import asyncio
import logging
from datetime import datetime
from arq import create_pool
from arq.connections import RedisSettings

from app.config import settings
from app.database import SessionLocal
from app.models import Document, User
from app.services.ocr_service import extract_text
from app.services.extraction_service import process_document_extraction
from app.services.audit_service import log_action

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class WorkerSettings:
    redis_settings = RedisSettings(
        host=settings.UPSTASH_REDIS_REST_URL.replace("https://", "").split("/")[0].split(":")[0],
        port=443,
        password=settings.UPSTASH_REDIS_REST_TOKEN,
        ssl=True
    )


async def process_document_task(document_id: str, extraction_model: str = "gpt-4o-mini") -> dict:
    """
    ARQ task to process a document with OCR
    extraction_model: "gpt-4o" or "gpt-4o-mini" (OpenAI models)
    """
    logger.info(f"Starting OCR processing for document: {document_id}")
    
    db = SessionLocal()
    document_user = None
    
    try:
        # Get document
        document = db.query(Document).filter(Document.id == document_id).first()
        
        if not document:
            logger.error(f"Document not found: {document_id}")
            return {"error": "Document not found"}
        
        # Get document owner for audit log
        document_user = db.query(User).filter(User.id == document.owner_id).first()
        
        # Update status to processing
        document.status = "processing"
        document.updated_at = datetime.utcnow()
        db.commit()
        
        # Log processing started
        if document_user:
            log_action(
                db=db,
                user_id=document_user.id,
                user_email=document_user.email,
                action="processing_started",
                document_id=document_id,
                document_name=document.filename
            )
        
        # Check if file exists
        import os
        if not os.path.exists(document.file_path):
            document.status = "failed"
            document.error_message = "File not found"
            db.commit()
            if document_user:
                log_action(
                    db=db,
                    user_id=document_user.id,
                    user_email=document_user.email,
                    action="processing_failed",
                    document_id=document_id,
                    document_name=document.filename,
                    details={"error": "File not found"}
                )
            return {"error": "File not found"}
        
        # Run OCR
        logger.info(f"Running OCR on: {document.file_path}")
        text, confidence, method = extract_text(document.file_path)
        
        if text:
            # Update document with OCR results
            document.raw_text = text
            document.confidence_score = confidence
            document.status = "completed"
            document.updated_at = datetime.utcnow()
            logger.info(f"OCR completed for {document_id}: method={method}, confidence={confidence:.2f}")
            
            # Log OCR completed
            if document_user:
                log_action(
                    db=db,
                    user_id=document_user.id,
                    user_email=document_user.email,
                    action="ocr_completed",
                    document_id=document_id,
                    document_name=document.filename,
                    details={"method": method, "confidence": confidence}
                )
            
            # Phase 3: Extract structured fields using Gemini
            logger.info(f"Starting extraction for document {document_id} with model: {extraction_model}")
            extraction_result = process_document_extraction(text, extraction_model)
            
            # Store extraction results
            document.extracted_data = extraction_result
            db.commit()
            
            logger.info(f"Extraction completed for {document_id}: type={extraction_result.get('document_type')}, confidence={extraction_result.get('overall_confidence'):.2f}")
            
            # Log extraction completed
            if document_user:
                log_action(
                    db=db,
                    user_id=document_user.id,
                    user_email=document_user.email,
                    action="extraction_completed",
                    document_id=document_id,
                    document_name=document.filename,
                    details={
                        "document_type": extraction_result.get('document_type'),
                        "overall_confidence": extraction_result.get('overall_confidence')
                    }
                )
        else:
            document.status = "failed"
            document.error_message = f"OCR failed: no text extracted"
            logger.error(f"OCR failed for {document_id}: no text extracted")
            if document_user:
                log_action(
                    db=db,
                    user_id=document_user.id,
                    user_email=document_user.email,
                    action="processing_failed",
                    document_id=document_id,
                    document_name=document.filename,
                    details={"error": "OCR failed: no text extracted"}
                )
        
        db.commit()
        
        return {
            "document_id": document_id,
            "status": document.status,
            "method": method if text else None,
            "confidence": confidence if text else None,
            "text_length": len(text) if text else 0,
            "extraction": extraction_result if text else None
        }
        
    except Exception as e:
        logger.error(f"Error processing document {document_id}: {e}")
        
        # Update document status to failed
        document = db.query(Document).filter(Document.id == document_id).first()
        if document:
            document.status = "failed"
            document.error_message = str(e)
            document.updated_at = datetime.utcnow()
            db.commit()
            if document_user:
                log_action(
                    db=db,
                    user_id=document_user.id,
                    user_email=document_user.email,
                    action="processing_failed",
                    document_id=document_id,
                    document_name=document.filename,
                    details={"error": str(e)}
                )
        
        return {"error": str(e)}
        
    finally:
        db.close()


async def enqueue_document_processing(document_id: str, extraction_model: str = "gpt-4o-mini"):
    """
    Add document processing task to the queue
    """
    try:
        # Parse Upstash URL to get connection details
        redis_url = settings.UPSTASH_REDIS_REST_URL
        
        # Create ARQ pool and enqueue task
        pool = await create_pool(RedisSettings(
            host=redis_url.replace("https://", "").split("/")[0].split(":")[0],
            port=443,
            password=settings.UPSTASH_REDIS_REST_TOKEN,
            ssl=True
        ))
        
        await pool.enqueue_job(
            "process_document_task",
            document_id,
            extraction_model,
            _job_id=f"doc_{document_id}"
        )
        
        await pool.close()
        
        logger.info(f"Enqueued document {document_id} for processing with model: {extraction_model}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to enqueue document {document_id}: {e}")
        # Fallback: run synchronously
        logger.info("Falling back to synchronous processing")
        return await process_document_task(document_id)