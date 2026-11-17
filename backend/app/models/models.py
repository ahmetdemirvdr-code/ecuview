from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    company = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    files = relationship("MeasurementFile", back_populates="owner")
    templates = relationship("AnalysisTemplate", back_populates="owner")


class MeasurementFile(Base):
    __tablename__ = "measurement_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    file_format = Column(String, nullable=False)  # MDF3, MDF4, CSV, DBC
    mdf_version = Column(String, nullable=True)

    # Metadata from MDF
    recording_date = Column(String, nullable=True)
    recording_time = Column(String, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    channel_count = Column(Integer, nullable=True)
    group_count = Column(Integer, nullable=True)
    program = Column(String, nullable=True)
    comment = Column(String, nullable=True)

    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="files")
    channels = relationship("Channel", back_populates="file", cascade="all, delete-orphan")


class Channel(Base):
    __tablename__ = "channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    unit = Column(String, nullable=True)
    group_index = Column(Integer, nullable=False)
    sample_count = Column(Integer, nullable=True)
    sample_rate_hz = Column(Float, nullable=True)
    min_value = Column(Float, nullable=True)
    max_value = Column(Float, nullable=True)
    data_type = Column(String, nullable=True)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)  # engine, injection, rail, temp, etc.

    file_id = Column(Integer, ForeignKey("measurement_files.id"))
    file = relationship("MeasurementFile", back_populates="channels")


class AnalysisTemplate(Base):
    __tablename__ = "analysis_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    category = Column(String, nullable=True)
    is_system = Column(Boolean, default=False)  # Built-in templates
    config = Column(Text, nullable=False)  # JSON: channel names, chart config

    owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="templates")
