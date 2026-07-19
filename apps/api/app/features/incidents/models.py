import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from app.database.session import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    reporter_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assignee_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    sensor_id = Column(String(36), ForeignKey("stadium_sensors.id", ondelete="SET NULL"), nullable=True)
    
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    priority = Column(String(20), default="Medium", nullable=False) # Low, Medium, High, SOS
    status = Column(String(20), default="Reported", nullable=False) # Reported, In_Progress, Resolved
    incident_type = Column(String(50), nullable=False) # Medical, Security, Maintenance, Cleaning, Lost_Child, Lost_Item
    
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    summary_ai = Column(String(500), nullable=True)
    image_url = Column(String(255), nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
