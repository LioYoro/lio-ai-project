from supabase import create_client, Client
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.config import settings
from app.database import get_db
from app.models import User
from app.schemas import TokenData

# Create Supabase client
supabase: Client = create_client(
    settings.SUPABASE_URL,
    settings.SUPABASE_SERVICE_ROLE_KEY  # Use service role for server-side operations
)


def hash_password(password: str) -> str:
    """Hash a password using bcrypt (still needed for initial user creation if needed)"""
    from passlib.context import CryptContext
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get user from local DB by email"""
    return db.query(User).filter(User.email == email).first()


def create_or_sync_user(db: Session, supabase_user) -> User:
    """Create or sync user from Supabase Auth to local DB"""
    user = db.query(User).filter(User.id == supabase_user.id).first()
    
    # Check if this user should be admin
    is_admin = settings.ADMIN_EMAIL and supabase_user.email == settings.ADMIN_EMAIL
    
    if not user:
        # Create new user
        user = User(
            id=supabase_user.id,
            email=supabase_user.email,
            full_name=supabase_user.user_metadata.get("full_name") if supabase_user.user_metadata else None,
            role="admin" if is_admin else "user"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        # Update user info and role if needed
        user.email = supabase_user.email
        if supabase_user.user_metadata:
            user.full_name = supabase_user.user_metadata.get("full_name", user.full_name)
        if is_admin:
            user.role = "admin"
        db.commit()
    
    return user


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """Dependency to get the current authenticated user via Supabase token"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Extract token from "Bearer <token>"
    token = authorization.replace("Bearer ", "").replace("bearer ", "")
    
    try:
        # Verify the token with Supabase
        user_response = supabase.auth.get_user(token)
        supabase_user = user_response.user
        
        if not supabase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        
        # Sync/get user from local DB
        user = create_or_sync_user(db, supabase_user)
        return user
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Could not validate credentials: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def require_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """Dependency to ensure the current user is an admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user