import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from app.database.session import Base

class Match(Base):
    __tablename__ = "matches"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    team_a = Column(String(100), nullable=False)
    team_b = Column(String(100), nullable=False)
    kick_off = Column(DateTime, nullable=False)
    stadium_id = Column(String(50), default="MetLife Stadium", nullable=False)
    stage = Column(String(50), default="Group Stage", nullable=False)
    status = Column(String(20), default="Scheduled", nullable=False) # Scheduled, Live, Finished
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    tickets = relationship("Ticket", back_populates="match", cascade="all, delete-orphan")


class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    match_id = Column(String(36), ForeignKey("matches.id", ondelete="CASCADE"), nullable=False)
    seat_number = Column(String(20), nullable=False)
    gate_number = Column(String(20), nullable=False)
    qr_code = Column(String(255), unique=True, nullable=False)
    status = Column(String(20), default="Active", nullable=False) # Active, Scanned, Cancelled
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    match = relationship("Match", back_populates="tickets")


class Sensor(Base):
    __tablename__ = "stadium_sensors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sensor_name = Column(String(100), nullable=False)
    sensor_type = Column(String(50), nullable=False) # Camera, Turnstile, Density, SOS
    location_gate = Column(String(20), nullable=True)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    status = Column(String(20), default="Active", nullable=False) # Active, Offline, Warning
    current_value = Column(Float, default=0.0, nullable=False)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    telemetry = relationship("CrowdTelemetry", back_populates="sensor", cascade="all, delete-orphan")


class CrowdTelemetry(Base):
    __tablename__ = "crowd_telemetry"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sensor_id = Column(String(36), ForeignKey("stadium_sensors.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    crowd_count = Column(Integer, nullable=False)
    status_level = Column(String(20), default="Normal", nullable=False) # Normal, Crowded, Overcrowded

    sensor = relationship("Sensor", back_populates="telemetry")
