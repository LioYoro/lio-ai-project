from sqlalchemy import Column, String, Integer, DateTime, Text, Enum, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base
from pgvector.sqlalchemy import Vector
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents = relationship("Document", back_populates="owner")
    workflows = relationship("Workflow", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String)
    file_type = Column(String)  # pdf, jpg, png, etc
    mime_type = Column(String)
    
    # OCR / Extraction
    raw_text = Column(Text)  # OCR extracted text
    extracted_data = Column(JSON)  # Structured extraction {name, date, amounts, etc}
    confidence_score = Column(Float)  # Confidence of extraction (0-1)
    
    # Vector embedding for semantic search (384-dimensional from MiniLM)
    embedding = Column(Vector(384))  # pgvector column
    
    # Status
    status = Column(String, default="pending")  # pending, processing, completed, failed
    error_message = Column(Text)  # If processing failed
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship("User", back_populates="documents")
    workflows = relationship("Workflow", back_populates="document")


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Status tracking
    status = Column(String, default="pending")  # pending, processing, review, approved, rejected
    action = Column(String)  # approve, reject
    notes = Column(Text)  # User notes on approval/rejection
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    document = relationship("Document", back_populates="workflows")
    user = relationship("User", back_populates="workflows")
