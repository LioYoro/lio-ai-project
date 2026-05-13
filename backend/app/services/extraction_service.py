import json
import logging
from typing import Optional, Dict, Any
import re

logger = logging.getLogger(__name__)


def get_gemini_client():
    """Get Gemini API client"""
    import google.generativeai as genai
    from app.config import settings
    
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai


def is_rate_limit_error(e: Exception) -> bool:
    """Check if exception is a rate limit / quota error"""
    error_str = str(e).lower()
    return any(x in error_str for x in ["429", "quota", "rate limit", "resource_exhausted", "exceeded"])


def classify_document_type(text: str, model_type: str = "flash") -> Dict[str, Any]:
    """Classify document type using Gemini"""
    try:
        client = get_gemini_client()
        
        # Select model
        model_name = "gemini-embedding-001" if model_type == "embedding" else "gemini-2.5-flash"
        
        prompt = f"""Analyze this document text and classify its type. Return a JSON object with:
- type: one of [certificate, invoice, resume, permit, medical, id, contract, other]
- confidence: 0-1 score
- reasoning: brief explanation

Classification guidelines:
- CERTIFICATE: Look for ANY of these: certificate, certification, completion, certified, awarded, passed, course completion, training completion, IT specialist, completion of, passing, exam passed, skills assessment, competency, attainment, achievement, earned, completion certificate, professional certificate, training certificate, course name followed by date (indicates completion)
- RESUME: Look for words like: resume, CV, work experience, employment history, professional experience, skills, education background, accomplishments, projects
- INVOICE: Look for words like: invoice, bill, payment, total, due date, vendor, receipt, purchase order, grand total, transaction
- MEDICAL: Look for words like: patient, diagnosis, prescription, doctor, medical, hospital, clinic, treatment, health
- PERMIT: Look for words like: permit, license, clearance, barangay, mayor, office, official business
- ID: Look for words like: ID, identification, card, government, valid until, expiration
- CONTRACT: Look for words like: contract, agreement, terms, conditions, signed, party, obligation

IMPORTANT: Even short documents with a person's name AND a topic/course name followed by a date are likely CERTIFICATES. Example: "John Doe - Python Programming - December 2023"

Document text:
{text[:3000]}

Return ONLY valid JSON, no other text."""
        
        model = client.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        
        # Parse JSON response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        result = json.loads(response_text)
        
        logger.info(f"Document classified as: {result.get('type')} (confidence: {result.get('confidence')})")
        return result
        
    except Exception as e:
        logger.error(f"Document classification failed: {e}")
        
        # Check for rate limit
        if is_rate_limit_error(e):
            return {
                "type": "other",
                "confidence": 0.0,
                "reasoning": "Rate limit reached - try again later",
                "rate_limited": True
            }
        
        return {
            "type": "other",
            "confidence": 0.0,
            "reasoning": f"Classification failed: {str(e)}"
        }


def extract_fields(text: str, doc_type: str = "other", model_type: str = "flash") -> Dict[str, Any]:
    """Extract structured fields from document text using Gemini"""
    try:
        client = get_gemini_client()
        
        # Base fields that apply to all documents
        base_fields = "name, date, email, phone, address, id_number, amount"
        
        # Type-specific fields
        type_specific = {
            "certificate": "issuer, course_name, level, completion_date, certificate_number",
            "invoice": "invoice_number, invoice_date, due_date, vendor_name, total_amount, items",
            "resume": "job_titles, skills, education, experience_years, licenses_and_certifications",
            "permit": "permit_type, permit_number, issued_date, expiry_date, issuing_authority",
            "medical": "patient_name, diagnosis, date, doctor_name, hospital, prescription",
            "id": "id_type, id_number, full_name, dob, issue_date, expiry_date",
            "contract": "parties, signature_date, contract_type, key_terms, termination_clause",
        }
        
        fields_to_extract = f"{base_fields}, {type_specific.get(doc_type, '')}"
        
        prompt = f"""Extract ALL structured information from this {doc_type} document.
Return a JSON object with these fields: {fields_to_extract}

Rules:
- Extract exact values found in document
- Use null for missing fields
- For confidence, provide 0-1 scores per field
- Keep values clean and consistent
- For lists (skills, items), return as arrays
- IMPORTANT: For complex fields like 'education', 'experience', 'address' - return as a simple STRING (e.g., "Bachelor of Science in IT - Jose Rizal University" or "Mandaluyong City, Philippines") instead of nested objects

Document text:
{text[:5000]}

Return ONLY valid JSON with structure like:
{{
  "fields": {{
    "name": {{"value": "...", "confidence": 0.95}},
    "education": {{"value": "BS IT - Jose Rizal University", "confidence": 0.95}},
    "skills": {{"value": ["Python", "JavaScript"], "confidence": 0.95}},
    ...
  }},
  "overall_confidence": 0.85,
  "extraction_notes": "..."
}}"""
        
        # Select model
        model_name = "gemini-embedding-001" if model_type == "embedding" else "gemini-2.5-flash"
        model = client.GenerativeModel(model_name)
        response = model.generate_content(prompt)
        
        # Parse JSON response
        response_text = response.text.strip()
        # Remove markdown code blocks if present
        response_text = re.sub(r'^```json\s*', '', response_text)
        response_text = re.sub(r'\s*```$', '', response_text)
        
        result = json.loads(response_text)
        
        logger.info(f"Extracted {len(result.get('fields', {}))} fields with confidence {result.get('overall_confidence', 0)}")
        return result
        
    except Exception as e:
        logger.error(f"Field extraction failed: {e}")
        
        # Check for rate limit
        if is_rate_limit_error(e):
            return {
                "fields": {},
                "overall_confidence": 0.0,
                "extraction_notes": "API rate limit reached - please try again later",
                "rate_limited": True
            }
        
        return {
            "fields": {},
            "overall_confidence": 0.0,
            "extraction_notes": f"Extraction failed: {str(e)}"
        }


def process_document_extraction(text: str, model_type: str = "flash") -> Dict[str, Any]:
    """
    Complete extraction pipeline: classify → extract
    model_type: "flash" (gemini-2.5-flash) or "embedding" (gemini-embedding-001)
    """
    try:
        # Step 1: Classify document type
        classification = classify_document_type(text, model_type)
        doc_type = classification.get("type", "other")
        
        # Step 2: Extract fields based on type
        extraction = extract_fields(text, doc_type, model_type)
        
        # Combine results
        result = {
            "document_type": doc_type,
            "type_confidence": classification.get("confidence", 0),
            "type_reasoning": classification.get("reasoning", ""),
            "extracted_fields": extraction.get("fields", {}),
            "extraction_confidence": extraction.get("overall_confidence", 0),
            "extraction_notes": extraction.get("extraction_notes", ""),
        }
        
        # Calculate overall confidence
        result["overall_confidence"] = (
            result["type_confidence"] * 0.3 + 
            result["extraction_confidence"] * 0.7
        )
        
        logger.info(f"Document extraction complete. Type: {doc_type}, Overall confidence: {result['overall_confidence']:.2f}")
        return result
        
    except Exception as e:
        logger.error(f"Document extraction pipeline failed: {e}")
        return {
            "document_type": "unknown",
            "type_confidence": 0.0,
            "extracted_fields": {},
            "extraction_confidence": 0.0,
            "overall_confidence": 0.0,
            "error": str(e)
        }
