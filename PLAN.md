# AI Document Workflow Automation Platform — Final Plan

## Overview

An AI-powered document processing system that ingests scanned documents/PDFs, extracts text via OCR, classifies and extracts fields using LLMs, stores data in a searchable database, and provides semantic search. Designed for real-world PH operational problems (barangay documents, invoices, HR resumes, etc.).

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │        Frontend (localhost:5173)     │
                    │  React + Vite + TypeScript           │
                    │  Tailwind CSS + Shadcn UI            │
                    └──────────────┬──────────────────────┘
                                   │ API calls
                    ┌──────────────▼──────────────────────┐
                    │        Backend (localhost:8000)       │
                    │  FastAPI + SQLAlchemy                 │
                    │  Tesseract OCR + PyMuPDF             │
                    │  ARQ workers + OpenAI GPT-4o-mini   │
                    └──────────────┬──────────────────────┘
                                   │
               ┌──────────────────▼─────────────────────┐
               │  Supabase (Cloud)                        │
               │  PostgreSQL + pgvector + Auth + RLS      │
               └─────────────────────────────────────────┘
```

---

## Tech Stack (Actual)

| Layer | Technology | Hosting | Cost |
|---|---|---|---|
| Frontend | React + Vite + TypeScript + Tailwind + Shadcn UI (manual) | **Vercel** | $0 |
| Backend | Python + FastAPI + SQLAlchemy | **Render** | $0 |
| Database | PostgreSQL + pgvector | **Supabase** | $0 |
| Queue | Redis + ARQ (with sync fallback) | **Upstash** | $0 |
| Auth | Supabase Auth (custom JWT) + RLS | Supabase | $0 |
| OCR | Tesseract + PyMuPDF | Render (apt install) | $0 |
| LLM (prod) | OpenAI GPT-4o-mini (extraction) | OpenAI | Credits |
| LLM (embeddings) | MiniLM (local, free, unlimited) | Backend server | $0 |
| File storage | Render disk (ephemeral) | Render | $0 |

---

## Project Structure (Actual)

```
E:\Github\lio-ai-project\
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI entry + CORS
│   │   ├── config.py                 # Env vars
│   │   ├── database.py               # SQLAlchemy + pgvector
│   │   ├── dependencies.py           # Auth dependency
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py               # Login, register
│   │   │   ├── documents.py          # Upload, list, get, delete
│   │   │   ├── search.py             # Semantic + keyword search
│   │   │   ├── admin.py              # Admin stats, users, audit
│   │   │   └── workflows.py
│   │   ├── models/
│   │   │   ├── __init__.py           # User, Document, AuditLog
│   │   ├── schemas/
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── auth_service.py
│   │   │   ├── ocr_service.py        # Tesseract + PyMuPDF
│   │   │   ├── extraction_service.py # OpenAI GPT-4o-mini
│   │   │   ├── embedding_service.py  # MiniLM
│   │   │   ├── search_service.py
│   │   │   └── audit_service.py      # Audit logging
│   │   └── workers/
│   │       └── document_worker.py    # ARQ background tasks
│   ├── uploads/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── render.yaml
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css                 # Tailwind v4 + Shadcn CSS vars
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── utils.ts
│   │   │   └── adminApi.ts
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useDocuments.ts
│   │   ├── components/
│   │   │   ├── ui/                   # Button, Card, Input, Label, Badge, Table, Skeleton
│   │   │   └── layout/
│   │   │       └── Navbar.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminDocuments.tsx
│   │   │   ├── AdminAuditLog.tsx
│   │   │   └── AdminUsers.tsx
│   │   └── types/
│   │       └── index.ts
│   ├── vercel.json
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── PLAN.md
├── AGENTS.md
└── README.md
```

---

## Build Phases — Progress

### ✅ Phase 1-4 — COMPLETED

**Phase 1 — Foundation:**
- Python FastAPI project with SQLAlchemy + Supabase PostgreSQL
- Supabase Auth with custom JWT
- User + Document + Workflow DB models
- Document upload API (multipart file)
- React + Vite + TypeScript + Tailwind project
- Login page + protected routes
- Dashboard + Document list pages

**Phase 2 — OCR Pipeline:**
- Upstash Redis connection (with sync fallback)
- Tesseract OCR (images) + PyMuPDF (PDFs)
- OCR service with file type detection
- Async background worker with status updates
- Frontend: processing status + raw text view

**Phase 3 — AI Extraction:**
- OpenAI GPT-4o-mini integration (switched from Gemini)
- Document type classification (certificate, invoice, resume, permit, etc.)
- Structured field extraction per document type
- Per-field confidence scoring + overall confidence
- Frontend: extracted fields card with indicators

**Phase 4 — Semantic Search:**
- MiniLM embedding service (384-dim, local, free, unlimited)
- pgvector extension in Supabase
- Embedding generation + storage
- Vector similarity search (cosine distance, filename boost)
- Frontend: search with relevance scores + progress bars
- Document stats endpoint

### ✅ Phase 5 — Admin System — COMPLETED

- Admin role system: role column on User (auto-assigned via ADMIN_EMAIL)
- Audit logging: AuditLog model + audit_service.py
- Admin API endpoints: stats, documents, audit-logs, users
- AdminDashboard with Recharts (bar, pie, line charts)
- AdminDocuments, AdminAuditLog, AdminUsers pages
- Admin link in Navbar (role-based visibility)

### ✅ Phase 6 — UI/UX Polish — COMPLETED

- Dark theme (slate-900 gradients) + glassmorphism
- Shadcn-style components manually created (CLI broken)
- Centered layouts with consistent spacing
- Login/Register branding: "LioYoro | Hikari Systems"
- Loading skeletons for all data-fetching pages
- Response status badges with colors
- Responsive charts via Recharts
- Admin: Quick Actions section, stat cards, pagination

### ✅ Phase 7 — Deployment — COMPLETED

- [x] Dockerfile for Render
- [x] render.yaml with env vars
- [x] vercel.json for frontend
- [x] Pushed to GitHub (main branch)
- [x] RLS policies created for all tables
- [x] Backend deployed to Render
- [x] Frontend deployed to Vercel
- [x] CORS configured for production

---

## Key Design Decisions (Actual)

| Decision | Choice | Reason |
|---|---|---|
| LLM | OpenAI GPT-4o-mini | Had available credits, more reliable than Gemini |
| Embeddings | MiniLM (local) | Free, unlimited, no API costs |
| Auth | Supabase Auth + custom service | Full control over user management |
| OCR | Tesseract + PyMuPDF | Tesseract for images, PyMuPDF for PDFs |
| Vector search | pgvector in Supabase | Single DB, no extra service |
| Queue | ARQ + Upstash Redis | Async processing, 10k cmd/day free |
| Frontend state | TanStack Query | Auto-caching, loading states |
| UI components | Manual Shadcn-style | CLI broken with Node v24 |
| Admin roles | Email-based auto-assign | Simple, no admin panel needed |

---

## Environment Variables

### Backend (.env)
```
SUPABASE_URL=<supabase-url>
SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
DATABASE_URL=<supabase-connection-string>
UPSTASH_REDIS_REST_URL=<upstash-url>
UPSTASH_REDIS_REST_TOKEN=<upstash-token>
OPENAI_API_KEY=<openai-key>
JWT_SECRET=<random-string>
CORS_ORIGINS=http://localhost:5173
ADMIN_EMAIL=singajiyu10@gmail.com
```

---

## Project Highlights

| Skill | Demonstration |
|-------|-------------|
| **Full-Stack Architecture** | React + TypeScript frontend with FastAPI + Python backend |
| **AI/LLM Integration** | OpenAI GPT-4o-mini for document classification and structured field extraction with per-field confidence scoring |
| **OCR Pipeline** | Dual-engine OCR (Tesseract for images, PyMuPDF for PDFs) with automatic format detection |
| **Semantic Search** | pgvector-powered similarity search using local MiniLM embeddings (384-dim, no API costs) |
| **Background Processing** | Async queue via ARQ + Redis with automatic sync fallback |
| **Admin System** | Role-based access control, full audit logging, admin dashboard with Recharts analytics |
| **Database Design** | PostgreSQL with SQLAlchemy ORM, pgvector extension, RLS policies |
| **Authentication** | Supabase Auth with custom JWT + RLS policy enforcement |
| **UI/UX** | Dark theme with glassmorphism, loading skeletons, responsive layouts |
| **Deployment** | Vercel (frontend), Render (backend), Supabase (database), Docker containerized |
| **Architecture** | Clean layered separation (API → Services → Workers) |
