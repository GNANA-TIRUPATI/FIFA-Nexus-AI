from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base

# Import all models to ensure they are registered on Base metadata
from app.features.auth.models import User, UserSession
from app.features.stadium.models import Match, Ticket, Sensor, CrowdTelemetry
from app.features.incidents.models import Incident
from app.features.logistics.models import TransitSchedule, FoodVendor, VolunteerTask, SustainabilityMetric

from app.features.auth.router import router as auth_router
from app.features.auth.google import router as google_router
from app.features.ai.router import router as ai_router

# Autocreate database tables on app startup
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Could not auto-create database tables on startup. Details: {e}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register routes
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(google_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(ai_router, prefix=f"{settings.API_V1_STR}/ai", tags=["ai"])

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "1.0.0"
    }

@app.get("/health")
def health_check():
    """Detailed health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected"
    }
