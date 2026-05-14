# AI Document Workflow Automation Platform

An AI-powered document processing system that ingests scanned documents/PDFs, extracts text via OCR, classifies and extracts fields using LLMs, stores data in a searchable database, and provides semantic search.

---

## Project Status: In Progress

**Last Updated:** May 14, 2026

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
| Database | PostgreSQL (Supabase) + Auth + pgvector | ✅ Done |
| OCR | Tesseract (images), PyMuPDF (PDFs) | ✅ Done |
| Queue | Redis (Upstash) + fallback sync | ⚠️ Fallback active |
| LLM | OpenAI GPT-4o-mini (document extraction) | ✅ Done |
| Search | Semantic (pgvector + MiniLM) | ✅ Done |

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

- [x] Create OpenAI API integration service (`extraction_service.py`)
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
- `backend/app/services/extraction_service.py` - OpenAI API integration
- `backend/app/workers/document_worker.py` - Calls extraction after OCR
- `backend/requirements.txt` - Added google-generativeai

**Frontend:**
- Enhanced Documents.tsx with extraction results card
- Field confidence indicators
- Support for complex field types (arrays, nested values)
- Extraction notes and status

---

### ✅ Phase 4: Semantic Search (Days 8-10) — COMPLETED

- [x] Create embedding service with MiniLM (`all-MiniLM-L6-v2`, 384-dim vectors)
- [x] Enable pgvector extension in Supabase
- [x] Generate embeddings for existing documents
- [x] Store embeddings in pgvector column with proper type registration
- [x] Vector similarity search using pgvector cosine distance
- [x] Frontend: search bar (MiniLM only, no model selector)
- [x] Frontend: search results with relevance score + visual progress bar
- [x] Dashboard document stats endpoint

**Key Decisions:**
- MiniLM is the sole embedding model (free, unlimited, no API calls)
- Filename match boost (+0.3) prioritizes keyword-relevant results
- Embeddings generated one doc at a time to avoid silent batch failures
- pgvector type registered per-connection via SQLAlchemy event listener

**Endpoints:**
- `POST /api/search/semantic` — Search with query text, returns ranked results
- `POST /api/search/generate-embeddings` — Generate embeddings for docs without them

---

### ⏳ Phase 5: Workflow + Polish (Days 11-14) — IN PROGRESS

**Completed:**
- [x] Dashboard stats: total docs, completed, failed counts
- [x] Document delete functionality
- [x] Document pagination (10 per page with Previous/Next)
- [x] Error handling and loading states across app
- [x] README with architecture diagram + current status

**Remaining:**
- [ ] Document status workflow (pending → processing → review → approved/rejected)
- [ ] Simple approve/reject action
- [ ] Audit log (who did what, when, on which document)
- [ ] Upload document type selector (user declares type)
- [ ] Push to GitHub and deploy to Render + Vercel

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

1. **Upstash Redis:** Connection may fail, falls back to synchronous processing (works fine)
2. **Tesseract:** Installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`
3. **CV2 Preprocessing:** Disabled - raw image gives better OCR results
4. **OpenAI API:** Using OpenAI credits — 2 calls per document (classification + extraction)
5. **MiniLM Startup:** ~5-10s cold start on first import (model loads into memory)
6. **Frontend Auth Token:** Uses `sb-access-token` (not `access_token`) in localStorage
7. **Backend Port:** 8001, Frontend Port: 5173
8. **Git Status:** 9 commits ahead of `origin/main`, working tree clean

---

## What This Portfolio Shows

| Skill | Evidence |
|-------|----------|
| Full-stack dev | React frontend + FastAPI backend |
| AI/LLM integration | Gemini 2.5 Flash document classification + field extraction |
| OCR pipeline | Tesseract + PyMuPDF with confidence scoring |
| Async processing | ARQ + Redis background workers with sync fallback |
| Vector search | pgvector semantic search with MiniLM embeddings |
| Database design | SQLAlchemy ORM with RLS policies + pgvector |
| Auth/security | Supabase Auth with RLS policies |
| Cloud deployment | Ready for Vercel + Render |

---

## Next Steps

1. Push 9 commits to GitHub (`git push origin main`)
2. Deploy backend to Render + frontend to Vercel
3. Phase 5: Document workflow (approve/reject), audit log, upload type selector

---

*For full project plan, see [PLAN.md](./PLAN.md)*