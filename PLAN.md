# AI Document Workflow Automation Platform — Final Plan

## Overview

An AI-powered document processing system that ingests scanned documents/PDFs, extracts text via OCR, classifies and extracts fields using LLMs, stores data in a searchable database, and provides semantic search. Designed for real-world PH operational problems (barangay documents, invoices, HR resumes, etc.).

---

## $0 Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Vercel (FREE)                │
                    │  React + Vite + TypeScript           │
                    │  Tailwind CSS + shadcn/ui            │
                    └──────────────┬──────────────────────┘
                                   │ API calls
                    ┌──────────────▼──────────────────────┐
                    │         Render (FREE)                │
                    │  FastAPI + Tesseract + EasyOCR       │
                    │  ARQ workers + JWT auth              │
                    │  ⚠ Cold start ~30s after idle       │
                    │                                      │
                    │  Connects to:                        │
                    │  ┌────────┐    ┌──────────┐          │
                    │  │Postgres│    │  Redis   │          │
                    │  │+ vector│    │  (queue) │          │
                    │  └───┬────┘    └────┬─────┘          │
                    └──────┼──────────────┼────────────────┘
                           │              │
              ┌────────────▼──┐   ┌──────▼──────┐
              │  Supabase     │   │  Upstash    │
              │  (FREE)       │   │  (FREE)     │
              │  PG + pgvector│   │  Redis      │
              │  + Auth       │   │  10k cmd/day│
              │  500MB DB     │   └─────────────┘
              └───────────────┘
                    │
              ┌─────▼──────┐
              │ Gemini API │
              │ (FREE)     │
              │ 60 req/min │
              │ no CC      │
              └────────────┘
```

---

## Tech Stack

| Layer | Technology | Hosting | Cost |
|---|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + shadcn/ui | **Vercel** | $0 |
| Backend | Python + FastAPI + SQLAlchemy | **Render** | $0 |
| Database | PostgreSQL + pgvector | **Supabase** | $0 |
| Queue | Redis + ARQ | **Upstash** | $0 |
| Auth | Supabase Auth (built-in) or custom JWT | Supabase | $0 |
| OCR | Tesseract + EasyOCR | Render (apt install) | $0 |
| LLM (prod) | Gemini API (extraction + embeddings) | Google AI Studio | $0 |
| LLM (dev) | Ollama (local) | Your machine | $0 |
| File storage | Render disk (ephemeral) or Supabase storage | Render/Supabase | $0 |

---

## Services You Need To Sign Up For

### 1. Supabase (Database + Auth)
- Go to: https://supabase.com
- Sign up (GitHub or email)
- Create a new project
- Save your **Project URL** and **anon key** (for frontend)
- Save your **Database connection string** (for backend)
- No credit card needed

### 2. Upstash (Redis Queue)
- Go to: https://upstash.com
- Sign up (GitHub or email)
- Create a Redis database (free tier)
- Save your **UPSTASH_REDIS_REST_URL** and **UPSTASH_REDIS_REST_TOKEN**
- Region: choose anything close to PH (Singapore, Tokyo, or US)
- No credit card needed

### 3. Google AI Studio (Gemini API)
- Go to: https://aistudio.google.com
- Sign in with Google
- Click "Get API Key" in left sidebar
- Create an API key
- Save your **GEMINI_API_KEY**
- No credit card needed

### 4. Render (Backend Hosting)
- Go to: https://render.com
- Sign up (GitHub recommended)
- Will ask for a credit card to verify — **no charges if you stay on free tier**
- No cost as long as you don't upgrade

### 5. Vercel (Frontend Hosting)
- Go to: https://vercel.com
- Sign up (GitHub recommended)
- No credit card needed

### 6. GitHub (Code Hosting)
- Create a GitHub account if you don't have one
- We'll push both frontend and backend repos here
- No credit card needed

---

## Project Structure

```
E:\Github\lio-ai-project\
├── backend/                          # Deploy to Render
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI entry + CORS
│   │   ├── config.py                 # Env vars (DB, Redis, Gemini key)
│   │   ├── database.py               # SQLAlchemy + pgvector
│   │   ├── dependencies.py           # Auth dependency injection
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Login, register
│   │   │   ├── documents.py          # Upload, list, get, delete
│   │   │   ├── search.py             # Semantic + keyword search
│   │   │   └── workflows.py          # Status, approve, audit
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── document.py
│   │   │   └── workflow.py
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── document.py
│   │   │   └── search.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── ocr_service.py        # Tesseract + EasyOCR
│   │   │   ├── extraction_service.py # Gemini field extraction
│   │   │   ├── embedding_service.py  # Gemini embeddings
│   │   │   ├── search_service.py     # Hybrid search
│   │   │   └── workflow_service.py
│   │   └── workers/
│   │       ├── __init__.py
│   │       └── document_worker.py    # ARQ background tasks
│   ├── uploads/                      # Uploaded files (gitignored)
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml                   # Render deploy config
│   └── .env.example
├── frontend/                         # Deploy to Vercel
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                # Axios client
│   │   │   ├── supabase.ts           # Supabase client
│   │   │   └── utils.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useDocuments.ts
│   │   │   └── useSearch.ts
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   ├── documents/
│   │   │   │   ├── UploadDialog.tsx
│   │   │   │   ├── DocumentCard.tsx
│   │   │   │   └── DocumentList.tsx
│   │   │   ├── search/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── SearchResults.tsx
│   │   │   └── dashboard/
│   │   │       └── StatsCards.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Search.tsx
│   │   │   └── Workflows.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
├── docs/
│   └── architecture.md
├── PLAN.md                           # This file
├── AGENTS.md                         # Dev notes
└── README.md
```

---

## Build Phases

### Phase 1 — Foundation (Days 1-2)
**Goal:** Working backend + frontend with auth
- [ ] Initialize Python FastAPI project
- [ ] Set up SQLAlchemy + Supabase PostgreSQL connection
- [ ] Set up Supabase Auth (or custom JWT)
- [ ] Create User + Document + Workflow DB models
- [ ] Create document upload API (multipart file)
- [ ] Initialize React + Vite + TypeScript project
- [ ] Install Tailwind CSS + shadcn/ui
- [ ] Build Login page + protected routes
- [ ] Build basic Dashboard page
- [ ] Build Document list page
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel

### Phase 2 — OCR Pipeline (Days 3-4)
**Goal:** Upload → OCR → extracted text
- [ ] Set up Upstash Redis connection
- [ ] Set up ARQ background worker
- [ ] Install + configure Tesseract OCR (with apt in Dockerfile)
- [ ] Install EasyOCR as fallback for handwritten/difficult docs
- [ ] Install PyMuPDF for text extraction from PDFs
- [ ] OCR service: detect file type → process accordingly
- [ ] Background worker: process document async
- [ ] Update document status: pending → processing → completed
- [ ] Frontend: show processing status per document
- [ ] Frontend: view extracted raw text

### Phase 3 — AI Extraction (Days 5-7)
**Goal:** LLM extracts structured fields from OCR text
- [ ] Create Gemini API integration service
- [ ] Document type classification prompt
- [ ] Field extraction: names, dates, document numbers, amounts
- [ ] Store extracted fields as JSON on document model
- [ ] Confidence scoring on extracted fields
- [ ] Handle extraction failures gracefully
- [ ] Frontend: show extracted fields in a clean card
- [ ] Frontend: highlight missing/uncertain fields

### Phase 4 — Semantic Search (Days 8-10)
**Goal:** Search documents by meaning, not just keywords
- [x] Create embedding service with MiniLM (`sentence-transformers/all-MiniLM-L6-v2`)
- [x] Enable pgvector extension in Supabase
- [x] Generate embeddings for existing documents via `/api/search/generate-embeddings`
- [x] Store embeddings in pgvector column (Supabase) with proper type registration
- [x] Vector similarity search using pgvector cosine distance (`<=>` operator)
- [x] Filename match boost (+0.3) for keyword-relevant documents
- [x] Frontend: search bar (model selector removed, default to MiniLM)
- [x] Frontend: search results with relevance score + visual progress bar
- [x] Dashboard document stats (total, processing, completed counts)

**Embedding Model:**
| Model | Type | Rate Limits | Notes |
|-------|------|-------------|-------|
| MiniLM (all-MiniLM-L6-v2) | HuggingFace | ∞ unlimited | Default, local, 384-dim vectors |
| ~~Gemini Embedding-001~~ | ~~Google API~~ | ~~100 RPM~~ | Removed from frontend selector |

### Phase 5 — Workflow + Polish (Days 11-14)
**Goal:** Status tracking, dashboard, final polish
- [ ] Document status workflow (pending → processing → review → approved/rejected)
- [ ] Simple approve/reject action
- [ ] Audit log (who did what, when, on which document)
- [ ] Dashboard stats: total docs, pending, recent activity
- [ ] Upload document type selector (user declares type)
- [ ] Document delete functionality
- [ ] Error handling and loading states across app
- [ ] README with screenshots + architecture diagram
- [ ] Loom screen recording (5-min walkthrough)

---

## What's In Scope (MVP)

- User registration and login
- Document upload (PDF, JPG, PNG)
- OCR text extraction (Tesseract + EasyOCR fallback)
- AI document classification (barangay permit, invoice, resume, etc.)
- AI field extraction (names, dates, amounts, IDs)
- Semantic search ("show noise complaints from April")
- RAG question answering with citations
- Document status workflow
- Audit log
- Dashboard with stats
- Responsive UI with sidebar navigation

## What's Out Of Scope (MVP)

- Real-time notifications
- Complex multi-step approval chains
- Email/Slack integrations
- Batch upload
- Document editing/annotation
- Mobile app
- WebSocket live updates

---

## Key Design Decisions

| Decision | Choice | Reason |
|---|---|---|
| LLM adapter | Config swap: Ollama (dev) ↔ Gemini (prod) | Free dev without API calls, free prod with Gemini tier |
| Embeddings | Gemini Embedding API (same key) | One API key for both extraction + embeddings |
| Auth | Supabase Auth (built-in, free) | Ready-made auth with social login, no custom JWT needed |
| OCR fallback | Tesseract first → EasyOCR on low confidence | Tesseract fast for typed text, EasyOCR for handwritten |
| Vector search | pgvector in same Supabase DB | Single DB, no extra service, sync with primary data |
| Background queue | ARQ + Upstash Redis | Async processing without blocking API, 10k cmd/day is plenty |
| File storage | Supabase Storage (free, 1GB) or Render disk | Keep files alongside DB in same ecosystem |
| Frontend state | TanStack Query | Auto-caching, refetch, loading states built-in |

---

## Environment Variables

### Backend (Render)
```
SUPABASE_URL=<from Supabase project settings>
SUPABASE_ANON_KEY=<from Supabase project settings>
SUPABASE_SERVICE_ROLE_KEY=<from Supabase project settings (for server-side)>
DATABASE_URL=<Supabase PostgreSQL connection string>
UPSTASH_REDIS_REST_URL=<from Upstash dashboard>
UPSTASH_REDIS_REST_TOKEN=<from Upstash dashboard>
GEMINI_API_KEY=<from Google AI Studio>
JWT_SECRET=<generate a random string>
CORS_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel)
```
VITE_SUPABASE_URL=<same as backend>
VITE_SUPABASE_ANON_KEY=<same as backend>
VITE_API_URL=https://your-backend.onrender.com
```

---

## What This Portfolio Shows Recruiters

| Skill | Evidence in Project |
|---|---|
| Full-stack dev | React frontend + FastAPI backend |
| AI/LLM integration | Document classification, field extraction, RAG Q&A |
| OCR pipeline | Tesseract + EasyOCR with fallback logic |
| Async processing | ARQ + Redis background document workers |
| Vector search | pgvector semantic similarity search |
| Database design | SQLAlchemy ORM models with relationships |
| Auth/security | Supabase Auth or custom JWT, row-level security |
| Cloud deployment | Vercel (frontend) + Render (backend) + Supabase (DB) |
| DevOps | Dockerfile, environment config, CI/CD via GitHub |
| Architecture | Clean layered separation (API → Services → Workers) |
| Real-world problem | Solves actual PH operational pain points |

---

## Why This Beats Typical Fresh Grad Projects

- **Most grads build:** Todo apps, blog CRUDs, chatbot clones
- **You build:** Production-oriented AI document workflow system
- **You show:** Systems thinking, not just feature completion
- **You position as:** Backend engineer / AI engineer / Automation engineer
- **You can discuss:** OCR confidence, LLM prompt design, vector search trade-offs, async worker architecture

---

## Demo Script (For Portfolio Video)

1. Login to dashboard
2. Upload a scanned document (e.g., barangay permit)
3. Watch status go: pending → processing → completed
4. View OCR-extracted text
5. View AI-extracted fields (name, date, permit number, address)
6. Ask "show all documents related to noise complaints from April"
7. See semantic search results
8. Ask "summarize what this permit covers"
9. See AI-generated answer with document citations
10. Approve document in workflow
11. View audit log
12. Show dashboard stats

---

## Accounts Setup Checklist

- [ ] **GitHub** — Create account (if none)
- [ ] **Supabase** — Sign up, create project, copy DB URL + keys
- [ ] **Upstash** — Sign up, create Redis DB, copy URL + token
- [ ] **Google AI Studio** — Sign in, create Gemini API key
- [ ] **Render** — Sign up (credit card for verification, no charge)
- [ ] **Vercel** — Sign up (no credit card needed)
