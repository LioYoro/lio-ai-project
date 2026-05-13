FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (Tesseract OCR for image processing)
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    && rm -rf /var/lib/apt/lists/*

# Install language data for Tesseract (English)
RUN tesseract --languages

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create uploads directory for document storage
RUN mkdir -p uploads

# Copy app
COPY . .

# Expose port
EXPOSE 8001

# Run app
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
