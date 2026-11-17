"""Analysis routes - signal data, statistics, comparison, export."""
import os
import uuid
import tempfile
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import User, MeasurementFile
from app.models.schemas import (
    SignalRequest, SignalData,
    CompareRequest,
    StatisticsRequest, ChannelStatistics,
    ExportRequest,
)
from app.services.auth_service import get_current_user
from app.services.mdf_service import get_signal_data, get_statistics, export_to_csv

router = APIRouter()


def _get_user_file(file_id: int, user: User, db: Session) -> MeasurementFile:
    """Helper to get a file owned by the user."""
    file = (
        db.query(MeasurementFile)
        .filter(MeasurementFile.id == file_id, MeasurementFile.owner_id == user.id)
        .first()
    )
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadi")
    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="Dosya diskte bulunamadi")
    return file


@router.post("/signals", response_model=List[SignalData])
def get_signals(
    request: SignalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get signal data for specified channels."""
    file = _get_user_file(request.file_id, current_user, db)

    max_points = request.downsample or 5000  # Default max 5000 points for performance

    data = get_signal_data(
        file.file_path,
        request.channel_names,
        start_time=request.start_time,
        end_time=request.end_time,
        max_points=max_points,
    )
    return data


@router.post("/compare")
def compare_files(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Compare same channels across multiple files."""
    results = {}

    for file_id in request.file_ids:
        file = _get_user_file(file_id, current_user, db)

        signals = get_signal_data(
            file.file_path,
            request.channel_names,
            max_points=3000,
        )

        # Normalize time to start from 0 if requested
        if request.normalize_time:
            for sig in signals:
                if sig["timestamps"]:
                    t0 = sig["timestamps"][0]
                    sig["timestamps"] = [t - t0 for t in sig["timestamps"]]

        results[file_id] = {
            "filename": file.original_filename,
            "signals": signals,
        }

    return results


@router.post("/statistics", response_model=List[ChannelStatistics])
def get_channel_statistics(
    request: StatisticsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get detailed statistics for specified channels."""
    file = _get_user_file(request.file_id, current_user, db)
    stats = get_statistics(file.file_path, request.channel_names)
    return stats


@router.post("/export")
def export_data(
    request: ExportRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Export selected channels to CSV or XLSX."""
    file = _get_user_file(request.file_id, current_user, db)

    # Generate export file
    export_dir = tempfile.mkdtemp()
    base_name = os.path.splitext(file.original_filename)[0]

    if request.format == "csv":
        output_path = os.path.join(export_dir, f"{base_name}_export.csv")
        export_to_csv(
            file.file_path,
            request.channel_names,
            output_path,
            start_time=request.start_time,
            end_time=request.end_time,
        )
        media_type = "text/csv"
    else:
        raise HTTPException(status_code=400, detail="Desteklenmeyen format. Desteklenen: csv")

    return FileResponse(
        output_path,
        media_type=media_type,
        filename=os.path.basename(output_path),
    )
