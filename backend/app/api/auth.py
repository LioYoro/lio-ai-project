from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional
from app.database import get_db
from app.models import User
from app.dependencies import supabase, get_current_user
from app.services.audit_service import log_action

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str = "user"

    class Config:
        from_attributes = True


@router.post("/register", response_model=UserResponse)
async def register(user_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user via Supabase Auth"""
    try:
        # Create user in Supabase Auth
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {
                "data": {
                    "full_name": user_data.full_name or ""
                }
            }
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=response.session or "Failed to create user"
            )
        
        # Create user in local DB
        from app.dependencies import create_or_sync_user
        user = create_or_sync_user(db, response.user)
        
        # Audit log for registration
        log_action(
            db=db,
            user_id=user.id,
            user_email=user.email,
            action="user_register",
            details={"full_name": user_data.full_name}
        )
        
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login")
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login user via Supabase Auth"""
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        
        if response.user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Sync user to local DB if not exists
        from app.dependencies import create_or_sync_user
        user = create_or_sync_user(db, response.user)
        
        # Audit log for login
        log_action(
            db=db,
            user_id=user.id,
            user_email=user.email,
            action="user_login",
            details={}
        )
        
        return {
            "access_token": response.session.access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "email": user.email,
                "role": user.role
            }
        }
        
    except Exception as e:
        # Log the actual error for debugging
        print(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid email or password: {str(e)}"
        )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current user info"""
    return current_user


@router.post("/logout")
async def logout():
    """Logout user"""
    # Client handles token removal, just return success
    return {"message": "Logged out successfully"}