from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.models import AuditLog


def log_action(
    db: Session,
    user_id: str,
    user_email: str,
    action: str,
    document_id: Optional[str] = None,
    document_name: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None
) -> AuditLog:
    """
    Log an action to the audit trail.
    
    Args:
        db: Database session
        user_id: ID of the user performing the action
        user_email: Email of the user (snapshot for audit trail)
        action: Action type (upload, ocr_completed, extraction_completed, delete, reprocess, verify, notes, login, etc)
        document_id: ID of the document being acted upon (optional)
        document_name: Name/filename of the document (snapshot for audit trail)
        details: Additional JSON context (file size, confidence score, etc)
    
    Returns:
        The created AuditLog record
    """
    audit_log = AuditLog(
        user_id=user_id,
        user_email=user_email,
        document_id=document_id,
        document_name=document_name,
        action=action,
        details=details or {}
    )
    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)
    return audit_log
