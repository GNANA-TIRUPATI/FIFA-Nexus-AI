from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from app.database.session import get_db
from app.core.config import settings
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.features.auth.models import User, UserSession
from app.features.auth.schemas import (
    UserCreate,
    UserResponse,
    TokenResponse,
    LoginRequest,
    TokenRefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest
)

router = APIRouter()

from app.core.dependencies import get_current_user

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new user in the system and return initial tokens."""
    # Check if email is already taken
    existing_user = db.query(User).filter(User.email == user_in.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    
    # Hash password and create database user
    db_user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role.value,
        is_active=True,
        is_verified=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Issue access/refresh tokens
    access_token = create_access_token(subject=db_user.email)
    refresh_token = create_refresh_token(subject=db_user.email)
    
    # Store refresh session
    session_expiry = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    user_session = UserSession(
        user_id=db_user.id,
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
        "user": db_user
    }

@router.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate email/password credentials and return user session tokens."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is inactive"
        )

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

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Refresh access token using a valid, active refresh token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate refresh token",
    )
    try:
        payload = decode_token(refresh_in.refresh_token)
        email: str = payload.get("sub")
        token_type: str = payload.get("type")
        if email is None or token_type != "refresh":
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    # Find the session in the database
    db_session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_in.refresh_token,
        UserSession.is_revoked == False
    ).first()
    
    if not db_session or db_session.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if not user or not user.is_active:
        raise credentials_exception

    # Generate new access token (and optionally rotate refresh token)
    new_access_token = create_access_token(subject=user.email)
    
    return {
        "access_token": new_access_token,
        "refresh_token": refresh_in.refresh_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Fetch the active user's session profile details."""
    return current_user

@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(refresh_in: TokenRefreshRequest, db: Session = Depends(get_db)):
    """Revoke user session and delete active token."""
    db_session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_in.refresh_token
    ).first()
    if db_session:
        db_session.is_revoked = True
        db.commit()
    return {"message": "Successfully logged out"}

from app.core.dependencies import require_roles

@router.get("/admin-only", response_model=UserResponse)
def test_admin_route(current_user: User = Depends(require_roles(["Administrator", "Tournament Organizer"]))):
    """Test route requiring administrative access privileges."""
    return current_user

@router.get("/volunteer-only", response_model=UserResponse)
def test_volunteer_route(current_user: User = Depends(require_roles(["Volunteer"]))):
    """Test route requiring volunteer access privileges."""
    return current_user

import secrets
RESET_TOKENS = {}

@router.post("/forgot-password")
def forgot_password(forgot_in: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Generate a password reset token and return/log the recovery link in dev mode."""
    user = db.query(User).filter(User.email == forgot_in.email).first()
    if not user:
        return {"message": "If this email is registered, a password reset link has been generated."}
    
    token = secrets.token_urlsafe(32)
    RESET_TOKENS[token] = user.email
    
    reset_link = f"http://localhost:3000/auth/reset-password?token={token}"
    print(f"\n--- PASSWORD RESET REQUEST ---")
    print(f"User: {user.email}")
    print(f"Link: {reset_link}")
    print(f"-------------------------------\n")
    
    return {
        "message": "If this email is registered, a password reset link has been generated.",
        "dev_reset_link": reset_link
    }

@router.post("/reset-password")
def reset_password(reset_in: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset user password using token."""
    email = RESET_TOKENS.get(reset_in.token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")
        
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
        
    user.hashed_password = get_password_hash(reset_in.new_password)
    db.commit()
    del RESET_TOKENS[reset_in.token]
    
    return {"message": "Password reset successfully. You may now log in."}
