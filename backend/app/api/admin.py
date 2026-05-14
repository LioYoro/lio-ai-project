from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Document, AuditLog
from app.dependencies import require_admin
from app.schemas import (
    AdminStatsResponse,
    AdminDocumentResponse,
    AdminUserResponse,
    AuditLogResponse
)

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
def get_admin_stats(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get system-wide statistics for admin dashboard"""
    
    # Count users
    users_count = db.query(func.count(User.id)).scalar() or 0
    
    # Count documents overall
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    
    # Documents by status
    docs_by_status = {}
    for status_val in ["pending", "processing", "completed", "failed"]:
        count = db.query(func.count(Document.id)).filter(
            Document.status == status_val
        ).scalar() or 0
        docs_by_status[status_val] = count
    
    # Documents uploaded today
    today = datetime.utcnow().date()
    docs_today = db.query(func.count(Document.id)).filter(
        func.date(Document.created_at) == today
    ).scalar() or 0
    
    # Average processing time (for completed documents)
    completed_docs = db.query(Document).filter(
        Document.status == "completed"
    ).all()
    
    avg_processing_time = None
    if completed_docs:
        total_time = 0
        count = 0
        for doc in completed_docs:
            if doc.created_at and doc.updated_at:
                delta = doc.updated_at - doc.created_at
                total_time += delta.total_seconds()
                count += 1
        if count > 0:
            avg_processing_time = total_time / count
    
    # Document type breakdown (from document_type column)
    doc_type_breakdown = {}
    type_results = db.query(
        Document.document_type,
        func.count(Document.id)
    ).filter(Document.document_type.isnot(None)).group_by(Document.document_type).all()
    
    for doc_type, count in type_results:
        if doc_type:
            doc_type_breakdown[doc_type] = doc_type_breakdown.get(doc_type, 0) + count
    
    # File type breakdown (from file_type column)
    file_type_breakdown = {}
    file_type_results = db.query(
        Document.file_type,
        func.count(Document.id)
    ).filter(Document.file_type.isnot(None)).group_by(Document.file_type).all()
    for ftype, count in file_type_results:
        file_type_breakdown[ftype or "unknown"] = count
    
    # Users by month (last 6 months) - using proper month boundaries
    users_by_month = {}
    now = datetime.utcnow()
    for i in range(5, -1, -1):
        # Get start of month for i months ago
        month_start = (now.replace(day=1) - timedelta(days=i*32)).replace(day=1)
        # Get start of next month
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        month_label = month_start.strftime("%b %Y")
        count = db.query(func.count(User.id)).filter(
            User.created_at >= month_start,
            User.created_at < month_end
        ).scalar() or 0
        users_by_month[month_label] = count
    
    # Documents by month (last 6 months)
    docs_by_month = {}
    for i in range(5, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i*32)).replace(day=1)
        month_end = (month_start + timedelta(days=32)).replace(day=1)
        month_label = month_start.strftime("%b %Y")
        count = db.query(func.count(Document.id)).filter(
            Document.created_at >= month_start,
            Document.created_at < month_end
        ).scalar() or 0
        docs_by_month[month_label] = count
    
    # Extract document types from extracted_data JSON
    extracted_type_breakdown = {}
    docs_with_data = db.query(Document).filter(
        Document.extracted_data.isnot(None)
    ).all()
    for doc in docs_with_data:
        if doc.extracted_data and isinstance(doc.extracted_data, dict):
            doc_type = doc.extracted_data.get("document_type")
            if doc_type:
                extracted_type_breakdown[doc_type] = extracted_type_breakdown.get(doc_type, 0) + 1
    
    return AdminStatsResponse(
        users_count=users_count,
        total_documents=total_documents,
        documents_by_status=docs_by_status,
        documents_today=docs_today,
        avg_processing_time_seconds=avg_processing_time,
        document_type_breakdown=doc_type_breakdown,
        file_type_breakdown=file_type_breakdown,
        users_by_month=users_by_month,
        documents_by_month=docs_by_month,
        extracted_document_types=extracted_type_breakdown
    )


@router.get("/documents")
def get_all_documents(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 10,
    status: str = None
):
    """Get all documents across all users with pagination"""
    query = db.query(Document)
    
    # Filter by status if provided
    if status:
        query = query.filter(Document.status == status)
    
    # Get total count
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Get paginated results
    skip = (page - 1) * limit
    documents = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for doc in documents:
        owner = db.query(User).filter(User.id == doc.owner_id).first()
        result.append({
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "owner_email": owner.email if owner else "Unknown",
            "status": doc.status,
            "document_type": doc.document_type,
            "notes": doc.notes,
            "is_verified": doc.is_verified,
            "confidence_score": doc.confidence_score,
            "extracted_data": doc.extracted_data,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at
        })
    
    return {
        "documents": result,
        "total": total,
        "page": page,
        "total_pages": total_pages
    }


@router.get("/audit-logs")
def get_audit_logs(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 20,
    action: str = None,
    user_email: str = None,
    days: int = 30
):
    """Get system-wide audit logs with pagination and filtering"""
    
    query = db.query(AuditLog)
    
    # Filter by date range (default 30 days)
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    query = query.filter(AuditLog.created_at >= cutoff_date)
    
    # Filter by action if provided
    if action:
        query = query.filter(AuditLog.action == action)
    
    # Filter by user email if provided
    if user_email:
        query = query.filter(AuditLog.user_email.ilike(f"%{user_email}%"))
    
    # Get total count
    total = query.count()
    total_pages = (total + limit - 1) // limit
    
    # Get paginated results
    skip = (page - 1) * limit
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "logs": logs,
        "total": total,
        "page": page,
        "total_pages": total_pages
    }


@router.get("/users", response_model=list[AdminUserResponse])
def get_all_users(
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Get all users with their document counts"""
    users = db.query(User).all()
    
    result = []
    for user in users:
        doc_count = db.query(func.count(Document.id)).filter(
            Document.owner_id == user.id
        ).scalar() or 0
        
        result.append({
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "document_count": doc_count,
            "created_at": user.created_at
        })
    
    return result


@router.delete("/documents/{document_id}", status_code=204)
def admin_delete_document(
    document_id: str,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin can delete any document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Log the action
    from app.services.audit_service import log_action
    log_action(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="delete",
        document_id=document_id,
        document_name=document.filename,
        details={"deleted_by_admin": True}
    )
    
    # Delete file if exists
    from pathlib import Path
    if document.file_path:
        file_path = Path(document.file_path)
        if file_path.exists():
            file_path.unlink()
    
    db.delete(document)
    db.commit()
    
    return None


@router.post("/documents/{document_id}/reprocess")
def admin_reprocess_document(
    document_id: str,
    admin_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin can force reprocess any document"""
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Log the action
    from app.services.audit_service import log_action
    log_action(
        db=db,
        user_id=admin_user.id,
        user_email=admin_user.email,
        action="reprocess",
        document_id=document_id,
        document_name=document.filename,
        details={"reprocessed_by_admin": True}
    )
    
    # Reset status
    document.status = "pending"
    document.error_message = None
    db.commit()
    
    # Enqueue processing
    from app.workers.document_worker import enqueue_document_processing
    import asyncio
    try:
        asyncio.create_task(enqueue_document_processing(document.id))
    except:
        from app.workers.document_worker import process_document_task
        asyncio.run(process_document_task(document.id))
    
    return {"message": "Reprocessing started", "document_id": document_id}
