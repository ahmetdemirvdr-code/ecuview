"""File management routes - upload, list, delete MDF/DAT files."""
import os
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.config import (
    UPLOAD_DIR,
    MAX_FILE_SIZE,
    MAX_USER_STORAGE,
    format_bytes,
)
from app.models.models import User, MeasurementFile, Channel
from app.models.schemas import FileInfo, FileDetail, StorageQuota
from app.services.auth_service import get_current_user
from app.services.mdf_service import parse_mdf_file

router = APIRouter()

ALLOWED_EXTENSIONS = {".dat", ".mdf", ".mf4", ".csv"}


def get_user_storage_used(db: Session, user_id: int) -> int:
    used = (
        db.query(func.coalesce(func.sum(MeasurementFile.file_size), 0))
        .filter(MeasurementFile.owner_id == user_id)
        .scalar()
    )
    return int(used or 0)


def build_quota(db: Session, user_id: int) -> StorageQuota:
    used = get_user_storage_used(db, user_id)
    return StorageQuota(
        used_bytes=used,
        max_bytes=MAX_USER_STORAGE,
        remaining_bytes=max(0, MAX_USER_STORAGE - used),
        max_file_bytes=MAX_FILE_SIZE,
        used_human=format_bytes(used),
        max_human=format_bytes(MAX_USER_STORAGE),
        remaining_human=format_bytes(max(0, MAX_USER_STORAGE - used)),
        max_file_human=format_bytes(MAX_FILE_SIZE),
    )


@router.get("/quota", response_model=StorageQuota)
def get_storage_quota(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return current user's storage quota usage."""
    return build_quota(db, current_user.id)


@router.post("/upload", response_model=FileDetail)
async def upload_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload and parse an MDF/DAT file."""
    # Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Desteklenmeyen dosya formati: {ext}. Desteklenen: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    content = await file.read()
    size = len(content)

    if size == 0:
        raise HTTPException(status_code=400, detail="Bos dosya yuklenemez")

    if size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Tek dosya limiti asildi. Maksimum: {format_bytes(MAX_FILE_SIZE)}, gelen: {format_bytes(size)}",
        )

    used = get_user_storage_used(db, current_user.id)
    if used + size > MAX_USER_STORAGE:
        remaining = max(0, MAX_USER_STORAGE - used)
        raise HTTPException(
            status_code=400,
            detail=(
                f"Depolama kotasi dolu. Kullanilan: {format_bytes(used)} / {format_bytes(MAX_USER_STORAGE)}. "
                f"Kalan: {format_bytes(remaining)}. Yer acmak icin eski kayitlari silin."
            ),
        )

    # Save file
    unique_name = f"{uuid.uuid4().hex}{ext}"
    user_dir = os.path.join(UPLOAD_DIR, str(current_user.id))
    os.makedirs(user_dir, exist_ok=True)
    file_path = os.path.join(user_dir, unique_name)

    with open(file_path, "wb") as f:
        f.write(content)

    # Parse MDF file
    try:
        parse_result = parse_mdf_file(file_path)
    except Exception as e:
        if os.path.exists(file_path):
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
        file_size=size,
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
    """Delete an uploaded file from database and server disk."""
    file = (
        db.query(MeasurementFile)
        .filter(MeasurementFile.id == file_id, MeasurementFile.owner_id == current_user.id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadi")

    file_path = file.file_path
    user_dir = os.path.dirname(file_path) if file_path else None

    # Delete physical file from server
    if file_path and os.path.exists(file_path):
        os.remove(file_path)

    # Remove empty user upload directory
    if user_dir and os.path.isdir(user_dir) and not os.listdir(user_dir):
        try:
            os.rmdir(user_dir)
        except OSError:
            pass

    db.delete(file)
    db.commit()

    return {
        "message": "Dosya basariyla silindi",
        "quota": build_quota(db, current_user.id).model_dump(),
    }
