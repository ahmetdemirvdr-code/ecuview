"""File management routes - upload, list, delete MDF/DAT files."""
import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import UPLOAD_DIR, MAX_FILE_SIZE
from app.models.models import User, MeasurementFile, Channel
from app.models.schemas import FileInfo, FileDetail
from app.services.auth_service import get_current_user
from app.services.mdf_service import parse_mdf_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".dat", ".mdf", ".mf4", ".csv"}


@router.post("/upload", response_model=FileDetail)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and parse an MDF/DAT file."""
    # Validate extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya formati: {ext}. Desteklenen: {', '.join(ALLOWED_EXTENSIONS)}",
        )

    # Save file
    unique_name = f"{uuid.uuid4().hex}{ext}"
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, unique_name)

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Dosya boyutu 500MB sinirini asiyor")

    with open(file_path, "wb") as f:
        f.write(content)

    # Parse MDF file
    try:
        parse_result = parse_mdf_file(file_path)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Dosya parse edilemedi: {str(e)}")

    meta = parse_result["metadata"]

    # Determine format
    file_format = "MDF3"
    version = meta.get("mdf_version", "")
    if version.startswith("4"):
        file_format = "MDF4"
    elif ext == ".csv":
        file_format = "CSV"

    # Save to database
    db_file = MeasurementFile(
        filename=unique_name,
        original_filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        file_format=file_format,
        mdf_version=version,
        recording_date=meta.get("recording_date", ""),
        recording_time=meta.get("recording_time", ""),
        duration_seconds=parse_result["duration_seconds"],
        channel_count=parse_result["channel_count"],
        group_count=parse_result["group_count"],
        program=meta.get("program", ""),
        comment=meta.get("comment", ""),
        owner_id=current_user.id,
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)

    # Save channels
    for ch_info in parse_result["channels"]:
        ch = Channel(
            name=ch_info["name"],
            unit=ch_info["unit"],
            group_index=ch_info["group_index"],
            sample_count=ch_info["sample_count"],
            sample_rate_hz=ch_info["sample_rate_hz"],
            min_value=ch_info["min_value"],
            max_value=ch_info["max_value"],
            data_type=ch_info.get("data_type", ""),
            category=ch_info.get("category", "other"),
            file_id=db_file.id,
        )
        db.add(ch)

    db.commit()
    db.refresh(db_file)

    return FileDetail.model_validate(db_file)


@router.get("/", response_model=List[FileInfo])
def list_files(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all uploaded files for current user."""
    files = (
        db.query(MeasurementFile)
        .filter(MeasurementFile.owner_id == current_user.id)
        .order_by(MeasurementFile.created_at.desc())
        .all()
    )
    return [FileInfo.model_validate(f) for f in files]


@router.get("/{file_id}", response_model=FileDetail)
def get_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get file details including channel list."""
    file = (
        db.query(MeasurementFile)
        .filter(MeasurementFile.id == file_id, MeasurementFile.owner_id == current_user.id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadi")
    return FileDetail.model_validate(file)


@router.delete("/{file_id}")
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete an uploaded file."""
    file = (
        db.query(MeasurementFile)
        .filter(MeasurementFile.id == file_id, MeasurementFile.owner_id == current_user.id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadi")

    # Delete physical file
    if os.path.exists(file.file_path):
        os.remove(file.file_path)

    db.delete(file)
    db.commit()

    return {"message": "Dosya basariyla silindi"}
