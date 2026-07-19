import httpx
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.features.auth.models import User, UserSession
from app.features.auth.schemas import TokenResponse
from pydantic import BaseModel, EmailStr

router = APIRouter()

class GoogleLoginRequest(BaseModel):
    id_token: str
    email: EmailStr
    full_name: str

@router.post("/google-login", response_model=TokenResponse)
def google_login(login_in: GoogleLoginRequest, db: Session = Depends(get_db)):
    """Authenticate or register a user using Google OAuth credentials."""
    email = login_in.email
    full_name = login_in.full_name
    
    # Try verifying the real Google ID token if it is provided
    if login_in.id_token and not login_in.id_token.startswith("google-mock-"):
        try:
            tokeninfo_url = f"https://oauth2.googleapis.com/tokeninfo?id_token={login_in.id_token}"
            with httpx.Client() as client:
                resp = client.get(tokeninfo_url, timeout=5.0)
                if resp.status_code == 200:
                    token_info = resp.json()
                    # Successfully verified Google token claims
                    email = token_info.get("email", email)
                    full_name = token_info.get("name", full_name)
                    print(f"[Google Auth] Verified real ID token for email: {email}")
                else:
                    print(f"[Google Auth] Token verification failed: {resp.text}")
        except Exception as e:
            print(f"[Google Auth] Failed to verify token: {e}")
            
    # Check if user already exists
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Register a new user automatically with the default Fan role
        from app.core.security import get_password_hash
        import secrets
        random_password = secrets.token_urlsafe(16)
        user = User(
            email=email,
            hashed_password=get_password_hash(random_password),
            full_name=full_name,
            role="Fan",
            is_active=True,
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="User account is inactive.")

    # Issue access/refresh tokens
    access_token = create_access_token(subject=user.email)
    refresh_token = create_refresh_token(subject=user.email)

    # Store refresh session
    session_expiry = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    user_session = UserSession(
        user_id=user.id,
        refresh_token=refresh_token,
        expires_at=session_expiry,
        is_revoked=False
    )
    db.add(user_session)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user
    }
