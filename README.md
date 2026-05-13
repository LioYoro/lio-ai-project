# AI Document Workflow Automation Platform

An AI-powered document processing system that ingests scanned documents/PDFs, extracts text via OCR, classifies and extracts fields using LLMs, stores data in a searchable database, and provides semantic search.

---

## Project Status: In Progress

**Last Updated:** May 13, 2026

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Vercel (FREE)                │
                    │  React + Vite + TypeScript           │
                    │  Tailwind CSS                        │
                    └──────────────┬──────────────────────┘
                                   │ API calls
                    ┌──────────────▼──────────────────────┐
                    │         Render (FREE)                │
                    │  FastAPI + Tesseract                 │
                    │  ARQ workers + Supabase Auth        │
                    └──────────────┬──────────────────────┘
                                   │
               ┌──────────────────▼─────────────────────┐
               │  Supabase (FREE)                         │
               │  PostgreSQL + Auth                      │
               └─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React + Vite + TypeScript + Tailwind | ✅ Done |
| Backend | Python + FastAPI + SQLAlchemy | ✅ Done |
| Database | PostgreSQL (Supabase) + Auth | ✅ Done |
| OCR | Tesseract (images), PyMuPDF (PDFs) | ✅ Done |
| Queue | Redis (Upstash) + fallback sync | ⚠️ Fallback active |
| LLM | Gemini API (extraction) | ⏳ Phase 3 |
| Search | Semantic (pgvector) | ⏳ Phase 4 |

---

## Progress by Phase

### ✅ Phase 1: Foundation (Days 1-2) — COMPLETED

- [x] Initialize Python FastAPI project
- [x] Set up SQLAlchemy + Supabase PostgreSQL connection
- [x] Set up Supabase Auth with RLS policies
- [x] Create User + Document + Workflow DB models
- [x] Create document upload API (multipart file)
- [x] Initialize React + Vite + TypeScript project
- [x] Install Tailwind CSS
- [x] Build Login page + protected routes
- [x] Build Dashboard page
- [x] Build Document list page with upload
- [x] Auto-reload backend on code changes

**Status:** Backend runs on port 8001, frontend on port 5173. Auth working.

---

### ✅ Phase 2: OCR Pipeline (Days 3-4) — COMPLETED

- [x] Set up Upstash Redis connection (with fallback to sync)
- [x] Install + configure Tesseract OCR at `C:\Program Files\Tesseract-OCR`
- [x] Install PyMuPDF for text extraction from PDFs
- [x] OCR service: detect file type → process accordingly
- [x] Background worker: process document async
- [x] Update document status: pending → processing → completed
- [x] Frontend: show processing status per document
- [x] Frontend: view extracted raw text

**OCR Results:**
| File Type | Method | Confidence |
|-----------|--------|------------|
| PDF | PyMuPDF | 95% |
| Images (PNG/JPG) | Tesseract | 85% |

**Note:** CV2 preprocessing disabled - raw image + Tesseract gives better results.

---

### ✅ Phase 3: AI Extraction (Days 5-7) — COMPLETED

- [x] Create Gemini API integration service (`extraction_service.py`)
- [x] Document type classification prompt
- [x] Field extraction: names, dates, document numbers, amounts
- [x] Store extracted fields as JSON on document model
- [x] Confidence scoring on extracted fields
- [x] Handle extraction failures gracefully
- [x] Frontend: show extracted fields in a clean card
- [x] Frontend: highlight missing/uncertain fields

**Features:**
- Automatic document type classification (certificate, invoice, resume, permit, medical, id, contract)
- Structured field extraction per document type
- Per-field confidence scoring
- Overall extraction confidence (weighted: 30% type, 70% fields)
- Graceful error handling with fallback

**Backend:**
- `backend/app/services/extraction_service.py` - Gemini API integration
- `backend/app/workers/document_worker.py` - Calls extraction after OCR
- `backend/requirements.txt` - Added google-generativeai

**Frontend:**
- Enhanced Documents.tsx with extraction results card
- Field confidence indicators
- Support for complex field types (arrays, nested values)
- Extraction notes and status

---

### ⏳ Phase 4: Semantic Search (Days 8-10) — NOT STARTED

**Note:** Uses **MiniLM** (HuggingFace sentence-transformers) for embeddings - free, unlimited, no API rate limits.

**Remaining tasks:**
- [ ] Create embedding service with MiniLM (`all-MiniLM-L6-v2`)
- [ ] Enable pgvector extension in Supabase
- [ ] Generate embeddings on document upload/OCR completion
- [ ] Store embeddings in pgvector column (Supabase)
- [ ] Vector similarity search using cosine distance
- [ ] Frontend: search bar with model selector (MiniLM / Gemini Embedding)
- [ ] Frontend: search results with relevance score

**Rate Limits:**
| Model | RPM | RPD |
|-------|-----|-----|
| MiniLM (local) | ∞ | ∞ |
| Gemini Embedding-001 | 100 | 1000 |

---

### ⏳ Phase 5: Workflow + Polish (Days 11-14) — NOT STARTED

**Remaining tasks:**
- [ ] Document status workflow (pending → processing → review → approved/rejected)
- [ ] Simple approve/reject action
- [ ] Audit log (who did what, when, on which document)
- [ ] Dashboard stats: total docs, pending, recent activity
- [ ] Upload document type selector (user declares type)
- [ ] Document delete functionality
- [ ] Error handling and loading states across app
- [ ] README with screenshots + architecture diagram

---
<!--
## Environment Configuration

### Backend (.env)
```
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
DATABASE_URL=<supabase-connection-string>
UPSTASH_REDIS_REST_URL=<upstash-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-token>
GEMINI_API_KEY=<your-gemini-key>
JWT_SECRET=<your-jwt-secret>
CORS_ORIGINS=http://localhost:5173
```

### Frontend (.env.local)
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=http://localhost:8001
```

---
-->
## How to Run Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
python start.py
# Runs on http://localhost:8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## Current Issues / Notes

1. **Upstash Redis:** Connection fails, falls back to synchronous processing (works fine)
2. **Tesseract:** Installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`
3. **CV2 Preprocessing:** Disabled - raw image gives better OCR results
4. **Post-processing:** Skipped - will handle in Phase 3 with Gemini LLM

---

## What This Portfolio Shows

| Skill | Evidence |
|-------|----------|
| Full-stack dev | React frontend + FastAPI backend |
| AI/LLM integration | Phase 3 (upcoming) |
| OCR pipeline | Tesseract + PyMuPDF |
| Async processing | ARQ + Redis background workers |
| Database design | SQLAlchemy ORM with RLS |
| Auth/security | Supabase Auth with RLS policies |
| Cloud deployment | Ready for Vercel + Render |

---

## Next Steps

1. Implement Phase 3: AI Extraction with Gemini API
2. Extract structured fields from OCR text
3. Classify document types automatically
4. Proceed to Phase 4: Semantic Search with pgvector

---

*For full project plan, see [PLAN.md](./PLAN.md)*