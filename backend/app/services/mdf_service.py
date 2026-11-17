"""
MDF/DAT dosya parse ve analiz servisi.
ASAM MDF 3.x ve 4.x formatlarini destekler.
"""
import os
import sys
import types
import numpy as np
from typing import List, Dict, Optional, Tuple

# Monkey-patch zstd with pyzstd for environments without C compiler
try:
    import zstd
except ImportError:
    try:
        import pyzstd
        zstd_module = types.ModuleType("zstd")
        zstd_module.decompress = pyzstd.decompress
        zstd_module.compress = pyzstd.compress
        zstd_module.ZSTD_compress = pyzstd.compress
        zstd_module.ZSTD_uncompress = pyzstd.decompress
        sys.modules["zstd"] = zstd_module
    except ImportError:
        pass

from asammdf import MDF


# Channel category mapping for ECU signals
CHANNEL_CATEGORIES = {
    "engine": [
        "Eng_nAvr", "Eng_qFuel", "Eng_dmFuel", "Eng_dmEG", "Eng_tiDuration",
        "Eng_trq", "Eng_stNew", "Eng_idxDuration", "DSM_rLoadPCT",
    ],
    "injection": [
        "InjCrv_", "InjDrv_",
    ],
    "rail": [
        "Rail_", "RPSCD_",
    ],
    "governor": [
        "EISGov_", "HIGov_", "LIGov_", "TSCGov_",
    ],
    "temperature": [
        "CTSCD_t", "IATSCD_t", "OTSCD_t", "ETSCD_t", "FTSCD_t", "AFSCD_t",
    ],
    "pressure": [
        "OPSCD_p", "APSCD_p", "BPSCD_p", "POCCD_p",
    ],
    "pedal": [
        "AccPedCD_", "RemAccPedCD_",
    ],
    "battery": [
        "BattCD_",
    ],
    "vehicle": [
        "VSSCD_", "Gearbx_", "VehData_",
    ],
    "fuel_system": [
        "FuelSys_", "AirSys_", "StartSys_",
    ],
    "protection": [
        "EngPrt_", "EngLim_", "ShutDown_",
    ],
    "diagnostics": [
        "DFC_", "DFES_", "OBDLamp_",
    ],
    "metering_unit": [
        "MeUn_",
    ],
    "sensor_raw": [
        "_adRaw", "_uRaw", "_uPeak",
    ],
}


def categorize_channel(channel_name: str) -> str:
    """Assign a category to a channel based on its name prefix."""
    for category, prefixes in CHANNEL_CATEGORIES.items():
        for prefix in prefixes:
            if prefix in channel_name:
                return category
    return "other"


def parse_mdf_file(file_path: str) -> Dict:
    """
    Parse an MDF file and extract metadata and channel information.
    Returns a dict with file metadata and channel list.
    """
    mdf = MDF(file_path)

    # Extract basic metadata
    metadata = {
        "mdf_version": mdf.version,
        "program": "",
        "recording_date": "",
        "recording_time": "",
        "comment": "",
    }

    # Try to extract header info
    try:
        if hasattr(mdf, "header"):
            hdr = mdf.header
            if hasattr(hdr, "start_time") and hdr.start_time:
                metadata["recording_date"] = str(hdr.start_time.date())
                metadata["recording_time"] = str(hdr.start_time.time())
            if hasattr(hdr, "comment") and hdr.comment:
                metadata["comment"] = str(hdr.comment)
            if hasattr(hdr, "program") and hdr.program:
                metadata["program"] = str(hdr.program)
    except Exception:
        pass

    # Extract channel information
    channels = []
    max_duration = 0.0

    for group_idx, group in enumerate(mdf.groups):
        for ch in group.channels:
            if ch.name == "time":
                continue

            try:
                sig = mdf.get(ch.name, group=group_idx)
                samples = sig.samples.astype(float)
                timestamps = sig.timestamps

                sample_count = len(timestamps)
                if sample_count > 1:
                    duration = float(timestamps[-1] - timestamps[0])
                    sample_rate = sample_count / duration if duration > 0 else 0
                    max_duration = max(max_duration, float(timestamps[-1]))
                else:
                    duration = 0
                    sample_rate = 0

                # Fix encoding for unit
                unit = ch.unit if hasattr(ch, "unit") else ""
                if isinstance(unit, bytes):
                    try:
                        unit = unit.decode("utf-8")
                    except UnicodeDecodeError:
                        try:
                            unit = unit.decode("latin-1")
                        except Exception:
                            unit = ""

                channel_info = {
                    "name": ch.name,
                    "unit": unit or "",
                    "group_index": group_idx,
                    "sample_count": sample_count,
                    "sample_rate_hz": round(sample_rate, 2),
                    "min_value": round(float(np.nanmin(samples)), 4) if sample_count > 0 else None,
                    "max_value": round(float(np.nanmax(samples)), 4) if sample_count > 0 else None,
                    "data_type": str(samples.dtype),
                    "category": categorize_channel(ch.name),
                }
                channels.append(channel_info)
            except Exception:
                channels.append({
                    "name": ch.name,
                    "unit": "",
                    "group_index": group_idx,
                    "sample_count": 0,
                    "sample_rate_hz": 0,
                    "min_value": None,
                    "max_value": None,
                    "data_type": "unknown",
                    "category": categorize_channel(ch.name),
                })

    mdf.close()

    return {
        "metadata": metadata,
        "channels": channels,
        "duration_seconds": round(max_duration, 3),
        "channel_count": len(channels),
        "group_count": len(mdf.groups),
    }


def get_signal_data(
    file_path: str,
    channel_names: List[str],
    start_time: Optional[float] = None,
    end_time: Optional[float] = None,
    max_points: Optional[int] = None,
) -> List[Dict]:
    """
    Extract signal data for specified channels.
    Supports time range filtering and downsampling.
    """
    mdf = MDF(file_path)
    results = []

    for name in channel_names:
        try:
            sig = mdf.get(name)
            timestamps = sig.timestamps
            samples = sig.samples.astype(float)

            # Apply time range filter
            if start_time is not None or end_time is not None:
                mask = np.ones(len(timestamps), dtype=bool)
                if start_time is not None:
                    mask &= timestamps >= start_time
                if end_time is not None:
                    mask &= timestamps <= end_time
                timestamps = timestamps[mask]
                samples = samples[mask]

            # Downsample if too many points
            if max_points and len(timestamps) > max_points:
                indices = np.linspace(0, len(timestamps) - 1, max_points, dtype=int)
                timestamps = timestamps[indices]
                samples = samples[indices]

            # Get unit
            unit = ""
            if hasattr(sig, "unit"):
                unit = sig.unit
                if isinstance(unit, bytes):
                    try:
                        unit = unit.decode("utf-8")
                    except UnicodeDecodeError:
                        try:
                            unit = unit.decode("latin-1")
                        except Exception:
                            unit = ""

            # Clean NaN/Inf values
            valid_mask = np.isfinite(samples)
            valid_samples = samples[valid_mask]

            results.append({
                "name": name,
                "unit": unit or "",
                "timestamps": timestamps.tolist(),
                "values": samples.tolist(),
                "min": round(float(np.nanmin(valid_samples)), 4) if len(valid_samples) > 0 else 0,
                "max": round(float(np.nanmax(valid_samples)), 4) if len(valid_samples) > 0 else 0,
                "mean": round(float(np.nanmean(valid_samples)), 4) if len(valid_samples) > 0 else 0,
                "std": round(float(np.nanstd(valid_samples)), 4) if len(valid_samples) > 0 else 0,
                "sample_count": len(timestamps),
            })
        except Exception as e:
            results.append({
                "name": name,
                "unit": "",
                "timestamps": [],
                "values": [],
                "min": 0,
                "max": 0,
                "mean": 0,
                "std": 0,
                "sample_count": 0,
                "error": str(e),
            })

    mdf.close()
    return results


def get_statistics(file_path: str, channel_names: List[str]) -> List[Dict]:
    """Calculate detailed statistics for specified channels."""
    mdf = MDF(file_path)
    results = []

    for name in channel_names:
        try:
            sig = mdf.get(name)
            timestamps = sig.timestamps
            samples = sig.samples.astype(float)
            valid_mask = np.isfinite(samples)
            valid_samples = samples[valid_mask]

            duration = float(timestamps[-1] - timestamps[0]) if len(timestamps) > 1 else 0
            sample_rate = len(timestamps) / duration if duration > 0 else 0

            unit = ""
            if hasattr(sig, "unit"):
                unit = sig.unit if isinstance(sig.unit, str) else ""

            results.append({
                "name": name,
                "unit": unit,
                "min": round(float(np.nanmin(valid_samples)), 6),
                "max": round(float(np.nanmax(valid_samples)), 6),
                "mean": round(float(np.nanmean(valid_samples)), 6),
                "std": round(float(np.nanstd(valid_samples)), 6),
                "median": round(float(np.nanmedian(valid_samples)), 6),
                "sample_count": len(timestamps),
                "duration": round(duration, 3),
                "sample_rate": round(sample_rate, 2),
            })
        except Exception as e:
            results.append({
                "name": name,
                "error": str(e),
            })

    mdf.close()
    return results


def export_to_csv(file_path: str, channel_names: List[str], output_path: str,
                  start_time: Optional[float] = None, end_time: Optional[float] = None) -> str:
    """Export selected channels to CSV file."""
    import csv

    mdf = MDF(file_path)
    signals_data = {}
    all_timestamps = set()

    for name in channel_names:
        try:
            sig = mdf.get(name)
            timestamps = sig.timestamps
            samples = sig.samples.astype(float)

            if start_time is not None or end_time is not None:
                mask = np.ones(len(timestamps), dtype=bool)
                if start_time is not None:
                    mask &= timestamps >= start_time
                if end_time is not None:
                    mask &= timestamps <= end_time
                timestamps = timestamps[mask]
                samples = samples[mask]

            signals_data[name] = dict(zip(timestamps, samples))
            all_timestamps.update(timestamps)
        except Exception:
            pass

    mdf.close()

    sorted_times = sorted(all_timestamps)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["Time (s)"] + channel_names)
        for t in sorted_times:
            row = [round(t, 6)]
            for name in channel_names:
                val = signals_data.get(name, {}).get(t, "")
                if isinstance(val, float):
                    row.append(round(val, 6))
                else:
                    row.append(val)
            writer.writerow(row)

    return output_path
