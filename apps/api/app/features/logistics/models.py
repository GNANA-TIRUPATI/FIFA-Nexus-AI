import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer, Boolean
from app.database.session import Base

class TransitSchedule(Base):
    __tablename__ = "transit_schedules"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transit_type = Column(String(50), nullable=False) # Metro, Bus, Taxi, Ride Share
    route_name = Column(String(100), nullable=False)
    destination = Column(String(100), nullable=False)
    departure_time = Column(String(50), nullable=False) # departure string or datetime
    delay_minutes = Column(Integer, default=0, nullable=False)
    crowd_level = Column(String(20), default="Normal", nullable=False) # Normal, Crowded, Overcrowded
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class FoodVendor(Base):
    __tablename__ = "food_vendors"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    cuisine_type = Column(String(50), nullable=False)
    is_halal = Column(Boolean, default=False, nullable=False)
    is_vegetarian = Column(Boolean, default=False, nullable=False)
    is_vegan = Column(Boolean, default=False, nullable=False)
    avg_wait_time_minutes = Column(Integer, default=5, nullable=False)
    current_queue_size = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)


class VolunteerTask(Base):
    __tablename__ = "volunteer_tasks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    volunteer_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(100), nullable=False)
    description = Column(String(500), nullable=False)
    status = Column(String(20), default="Pending", nullable=False) # Pending, Active, Completed
    priority = Column(String(20), default="Medium", nullable=False) # Low, Medium, High
    location = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)


class SustainabilityMetric(Base):
    __tablename__ = "sustainability_metrics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    energy_consumption_kwh = Column(Float, default=0.0, nullable=False)
    water_consumption_liters = Column(Float, default=0.0, nullable=False)
    waste_collected_kg = Column(Float, default=0.0, nullable=False)
    carbon_footprint_kg = Column(Float, default=0.0, nullable=False)
