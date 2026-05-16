from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models import User, Document
from app.schemas import DocumentResponse, DocumentListResponse, DocumentUpdate
from app.dependencies import get_current_user
from app.workers.document_worker import enqueue_document_processing
from app.services.audit_service import log_action
from pathlib import Path
import shutil
import asyncio
import mimetypes

router = APIRouter(prefix="/api/documents", tags=["documents"])

# Ensure uploads directory exists
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)


@router.get("/stats")
def get_document_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get document statistics for the current user"""
    total = db.query(func.count(Document.id)).filter(
        Document.owner_id == current_user.id
    ).scalar()
    
    processing = db.query(func.count(Document.id)).filter(
        Document.owner_id == current_user.id,
        Document.status == "processing"
    ).scalar()
    
    completed = db.query(func.count(Document.id)).filter(
        Document.owner_id == current_user.id,
        Document.status == "completed"
    ).scalar()
    
    pending = db.query(func.count(Document.id)).filter(
        Document.owner_id == current_user.id,
        Document.status == "pending"
    ).scalar()
    
    failed = db.query(func.count(Document.id)).filter(
        Document.owner_id == current_user.id,
        Document.status == "failed"
    ).scalar()
    
    return {
        "total": total or 0,
        "processing": processing or 0,
        "completed": completed or 0,
        "pending": pending or 0,
        "failed": failed or 0
    }


@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload a document and trigger OCR processing"""
    try:
        # Save file
        file_path = UPLOAD_DIR / f"{current_user.id}_{file.filename}"
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create document record with pending status
        document = Document(
            owner_id=current_user.id,
            filename=file.filename,
            file_path=str(file_path),
            file_type=file.filename.split('.')[-1].lower(),
            mime_type=file.content_type,
            document_type=document_type,  # Optional doc type hint
            status="pending"
        )
        
        db.add(document)
        db.commit()
        db.refresh(document)
        
        # Log the action
        log_action(
            db=db,
            user_id=current_user.id,
            user_email=current_user.email,
            action="upload",
            document_id=document.id,
            document_name=file.filename,
            details={"file_type": file.content_type, "document_type": document_type}
        )
        
        # Trigger async OCR processing
        try:
            await enqueue_document_processing(document.id)
        except Exception as e:
            from app.workers.document_worker import process_document_task
            await process_document_task(document.id)
        
        return document
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error uploading file: {str(e)}"
        )


@router.get("/", response_model=list[DocumentListResponse])
def list_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 10
):
    """List user's documents"""
    documents = db.query(Document).filter(
        Document.owner_id == current_user.id
    ).order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    return documents


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    return document


@router.get("/{document_id}/file")
def download_document_file(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download the original uploaded file"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    file_path = Path(document.file_path)
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    media_type, _ = mimetypes.guess_type(str(file_path))
    if not media_type:
        media_type = "application/octet-stream"
    
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        filename=document.filename
    )


@router.delete("/{document_id}", status_code=204)
def delete_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Log the action
    log_action(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="delete",
        document_id=document_id,
        document_name=document.filename
    )
    
    # Delete file
    file_path = Path(document.file_path)
    if file_path.exists():
        file_path.unlink()
    
    # Delete document record
    db.delete(document)
    db.commit()
    
    return None


@router.post("/{document_id}/reprocess")
def reprocess_document(
    document_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Re-process a document"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Log the action
    log_action(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="reprocess",
        document_id=document_id,
        document_name=document.filename
    )
    
    # Reset status and re-process
    document.status = "pending"
    document.error_message = None
    db.commit()
    
    # Trigger processing
    import asyncio
    from app.workers.document_worker import process_document_task
    try:
        # Run in background
        asyncio.create_task(enqueue_document_processing(document.id))
    except:
        asyncio.run(process_document_task(document.id))
    
    return {"message": "Re-processing started", "document_id": document_id}


@router.put("/{document_id}/notes", response_model=DocumentResponse)
def update_document_notes(
    document_id: str,
    update: DocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update document notes"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if update.notes is not None:
        document.notes = update.notes
        
        # Log the action
        log_action(
            db=db,
            user_id=current_user.id,
            user_email=current_user.email,
            action="notes",
            document_id=document_id,
            document_name=document.filename,
            details={"notes": update.notes}
        )
    
    db.commit()
    db.refresh(document)
    return document


@router.put("/{document_id}/verify", response_model=DocumentResponse)
def toggle_document_verify(
    document_id: str,
    is_verified: bool,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle document verified status"""
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.owner_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    document.is_verified = is_verified
    
    # Log the action
    log_action(
        db=db,
        user_id=current_user.id,
        user_email=current_user.email,
        action="verify",
        document_id=document_id,
        document_name=document.filename,
        details={"is_verified": is_verified}
    )
    
    db.commit()
    db.refresh(document)
    return document