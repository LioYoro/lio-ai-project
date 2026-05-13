import os
from pathlib import Path
from typing import Optional, Tuple
import logging
import tempfile

logger = logging.getLogger(__name__)


def find_tesseract() -> Optional[str]:
    """Find Tesseract executable"""
    possible_paths = [
        r"C:\Program Files\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
        "tesseract",  # Try system PATH
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path
    
    # Try calling where
    import subprocess
    try:
        result = subprocess.run(["where", "tesseract"], capture_output=True, text=True)
        if result.returncode == 0:
            return result.stdout.strip().split('\n')[0]
    except:
        pass
    
    return None


def preprocess_image_cv2(image_path: str) -> Optional[str]:
    """Basic preprocessing with OpenCV"""
    import cv2
    import numpy as np
    
    try:
        img = cv2.imread(image_path)
        if img is None:
            return None
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # CLAHE for contrast
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        
        # Denoise
        denoised = cv2.fastNlMeansDenoising(enhanced, None, 10, 7, 21)
        
        # Sharpen
        kernel = np.array([[-1,-1,-1], [-1,9,-1], [-1,-1,-1]])
        sharpened = cv2.filter2D(denoised, -1, kernel)
        
        temp = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        cv2.imwrite(temp.name, sharpened)
        
        return temp.name
        
    except Exception as e:
        logger.error(f"CV2 preprocessing failed: {e}")
        return None


def extract_text_from_pdf(file_path: str) -> Tuple[str, float]:
    """Extract text from PDF using PyMuPDF"""
    import pymupdf
    
    try:
        text_parts = []
        with pymupdf.open(file_path) as doc:
            for page in doc:
                text_parts.append(page.get_text())
        
        full_text = "\n\n".join(text_parts)
        confidence = 0.95 if full_text.strip() else 0.0
        
        return full_text, confidence
        
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return "", 0.0


def extract_text_from_image_tesseract(image_path: str) -> Tuple[str, float]:
    """Extract text using Tesseract"""
    import pytesseract
    from PIL import Image
    
    try:
        tesseract_cmd = find_tesseract()
        if not tesseract_cmd:
            logger.warning("Tesseract not found. Please install from: https://github.com/UB-Mannheim/tesseract/releases")
            return "", 0.0
            
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd
        
        # Skip CV2 preprocessing - use raw image
        processed_path = None
        
        image = Image.open(image_path)
        
        result = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        
        confidences = [int(conf) for conf in result['conf'] if int(conf) > 0]
        avg_confidence = sum(confidences) / len(confidences) / 100.0 if confidences else 0.0
        
        text = pytesseract.image_to_string(image)
        
        if processed_path and os.path.exists(processed_path):
            try:
                os.unlink(processed_path)
            except:
                pass
        
        return text.strip(), avg_confidence
        
    except Exception as e:
        logger.error(f"Tesseract extraction failed: {e}")
        return "", 0.0


def extract_text(file_path: str) -> Tuple[str, float, str]:
    """Main OCR function"""
    file_path = Path(file_path)
    extension = file_path.suffix.lower()
    
    logger.info(f"Processing file: {file_path} (extension: {extension})")
    
    # PDF - use PyMuPDF
    if extension == ".pdf":
        text, confidence = extract_text_from_pdf(str(file_path))
        return text, confidence, "pymupdf"
    
    # Images
    elif extension in [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"]:
        logger.info("Processing image with CV2 preprocessing + Tesseract...")
        
        # Check if Tesseract is available
        tesseract_cmd = find_tesseract()
        if not tesseract_cmd:
            logger.warning("Tesseract not installed. Image OCR requires Tesseract. Install from: https://github.com/UB-Mannheim/tesseract/releases")
            return "", 0.0, "tesseract_not_installed"
        
        text, confidence = extract_text_from_image_tesseract(str(file_path))
        
        if text:
            logger.info(f"Tesseract succeeded: {len(text)} chars, confidence: {confidence:.2f}")
            return text, confidence, "tesseract"
        
        return "", 0.0, "failed"
    
    else:
        logger.warning(f"Unsupported file type: {extension}")
        return "", 0.0, "unsupported"