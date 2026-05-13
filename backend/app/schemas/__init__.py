from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Document Schemas
class DocumentCreate(BaseModel):
    filename: str
    file_type: str


class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: str
    raw_text: Optional[str] = None
    extracted_data: Optional[dict] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class DocumentListResponse(BaseModel):
    id: str
    filename: str
    file_type: Optional[str] = None
    status: str
    raw_text: Optional[str] = None
    confidence_score: Optional[float] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Workflow Schemas
class WorkflowCreate(BaseModel):
    document_id: str
    action: str
    notes: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    document_id: str
    status: str
    action: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Auth Response
class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None