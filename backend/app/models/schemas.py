from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# Auth schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    full_name: Optional[str] = None
    company: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    company: Optional[str]
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# File schemas
class ChannelInfo(BaseModel):
    id: int
    name: str
    unit: Optional[str]
    group_index: int
    sample_count: Optional[int]
    sample_rate_hz: Optional[float]
    min_value: Optional[float]
    max_value: Optional[float]
    category: Optional[str]

    class Config:
        from_attributes = True


class FileInfo(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_size: int
    file_format: str
    mdf_version: Optional[str]
    recording_date: Optional[str]
    recording_time: Optional[str]
    duration_seconds: Optional[float]
    channel_count: Optional[int]
    group_count: Optional[int]
    program: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class FileDetail(FileInfo):
    channels: List[ChannelInfo] = []


class StorageQuota(BaseModel):
    used_bytes: int
    max_bytes: int
    remaining_bytes: int
    max_file_bytes: int
    used_human: str
    max_human: str
    remaining_human: str
    max_file_human: str


# Analysis schemas
class SignalRequest(BaseModel):
    file_id: int
    channel_names: List[str]
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    downsample: Optional[int] = None  # Max points to return


class SignalData(BaseModel):
    name: str
    unit: Optional[str]
    timestamps: List[float]
    values: List[float]
    min: float
    max: float
    mean: float
    std: float
    sample_count: int


class CompareRequest(BaseModel):
    file_ids: List[int]
    channel_names: List[str]
    normalize_time: bool = True


class StatisticsRequest(BaseModel):
    file_id: int
    channel_names: List[str]


class ChannelStatistics(BaseModel):
    name: str
    unit: Optional[str]
    min: float
    max: float
    mean: float
    std: float
    median: float
    sample_count: int
    duration: float
    sample_rate: float


class ExportRequest(BaseModel):
    file_id: int
    channel_names: List[str]
    format: str = "csv"  # csv, xlsx
    start_time: Optional[float] = None
    end_time: Optional[float] = None


# Template schemas
class TemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    config: str  # JSON string


class TemplateResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    category: Optional[str]
    is_system: bool
    config: str
    created_at: datetime

    class Config:
        from_attributes = True
