from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Dict, List, Any


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
    role: str = "user"
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
    document_type: Optional[str] = None
    notes: Optional[str] = None
    is_verified: bool = False
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
    document_type: Optional[str] = None
    is_verified: bool = False
    raw_text: Optional[str] = None
    extracted_data: Optional[dict] = None
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


# Document Update Schema
class DocumentUpdate(BaseModel):
    notes: Optional[str] = None
    is_verified: Optional[bool] = None
    document_type: Optional[str] = None


# Audit Log Schema
class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    user_email: Optional[str] = None
    document_id: Optional[str] = None
    document_name: Optional[str] = None
    action: str
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Admin Response Schemas
class AdminDocumentResponse(BaseModel):
    id: str
    filename: str
    owner_email: str
    status: str
    document_type: Optional[str] = None
    is_verified: bool = False
    confidence_score: Optional[float] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    role: str
    document_count: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class AdminStatsResponse(BaseModel):
    users_count: int
    total_documents: int
    documents_by_status: Dict[str, int]
    documents_today: int
    avg_processing_time_seconds: Optional[float] = None
    document_type_breakdown: Dict[str, int] = {}
    file_type_breakdown: Dict[str, int] = {}
    users_by_month: Dict[str, int] = {}
    documents_by_month: Dict[str, int] = {}
    extracted_document_types: Dict[str, int] = {}