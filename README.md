# AI Document Workflow Automation Platform

An AI-powered document processing system that ingests scanned documents/PDFs, extracts text via OCR, classifies and extracts fields using LLMs, stores data in a searchable database, and provides semantic search.

---

## Project Status: Deployed & Polished

**Last Updated:** May 14, 2026

---

## Architecture

```
                    ┌─────────────────────────────────────┐
                    │         Vercel (FREE)                │
                    │  React + Vite + TypeScript           │
                    │  Tailwind CSS + Shadcn UI            │
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
               │  PostgreSQL + Auth + RLS                 │
               └─────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Status |
|-------|------------|--------|
| Frontend | React + Vite + TypeScript + Tailwind | ✅ Done |
| Backend | Python + FastAPI + SQLAlchemy | ✅ Done |
| Database | PostgreSQL (Supabase) + Auth + pgvector + RLS | ✅ Done |
| OCR | Tesseract (images), PyMuPDF (PDFs) | ✅ Done |
| Queue | Redis (Upstash) + fallback sync | ⚠️ Fallback active |
| LLM | OpenAI GPT-4o-mini (document extraction) | ✅ Done |
| Search | Semantic (pgvector + MiniLM) | ✅ Done |
| Auth | Supabase Auth with RLS policies | ✅ Done |
| UI | Shadcn-style components (manual) | ✅ Done |

---

## Progress by Phase

### ✅ Phase 1-4 — COMPLETED

- FastAPI backend with SQLAlchemy + Supabase PostgreSQL
- Supabase Auth with RLS policies on users, documents, workflows, audit_logs
- User + Document + Workflow DB models
- Document upload API (multipart)
- React + Vite + TypeScript + Tailwind frontend
- Login + Register + Dashboard + Documents pages
- OCR pipeline: Tesseract (images) + PyMuPDF (PDFs)
- AI extraction: OpenAI GPT-4o-mini for classification + field extraction
- Semantic search: MiniLM embeddings + pgvector cosine similarity
- Document stats endpoint

### ✅ Phase 5: Admin System — COMPLETED

- Admin role system (auto-assign based on ADMIN_EMAIL)
- Admin API endpoints: stats, documents, audit-logs, users
- Audit logging (AuditLog model + audit_service.py)
- AdminDashboard with charts (Recharts)
- AdminDocuments, AdminAuditLog, AdminUsers pages
- Admin link in Navbar for admin users

### ✅ Phase 6: UI/UX Polish — COMPLETED

- Dark theme with gradient backgrounds (slate-900)
- Glassmorphism effects (backdrop-blur, semi-transparent cards)
- Centered layouts with consistent spacing throughout
- Shadcn-style UI components: button, card, badge, table, input, skeleton, label
- Login/Register with "LioYoro | Hikari Systems" branding
- Loading skeletons for all data-fetching pages
- Response status badges (colored)
- Recharts integration (bar, pie, line charts)
- Responsive design

### 🔜 Phase 7: Deployment — READY

- [x] Dockerfile + render.yaml configured
- [x] vercel.json configured
- [x] Pushed to GitHub

---

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

## Current Notes

1. **Upstash Redis:** May fail, falls back to synchronous processing
2. **Tesseract:** Installed at `C:\Program Files\Tesseract-OCR\tesseract.exe`
3. **OpenAI API:** GPT-4o-mini for extraction (switched from Gemini)
4. **MiniLM:** Cold start ~5-10s, local 384-dim embeddings
5. **Frontend Auth Token:** `sb-access-token` in localStorage
6. **Backend Port:** 8001, Frontend Port: 5173
7. **Admin Email:** `singajiyu10@gmail.com`
8. **Shadcn CLI:** Broken with Node v24 — components created manually

---

## What This Portfolio Shows

| Skill | Evidence |
|-------|----------|
| Full-stack dev | React frontend + FastAPI backend |
| AI/LLM integration | OpenAI GPT-4o-mini classification + field extraction |
| OCR pipeline | Tesseract + PyMuPDF with confidence scoring |
| Async processing | ARQ + Redis background workers with sync fallback |
| Vector search | pgvector semantic search with MiniLM embeddings |
| Admin systems | Role-based auth, audit logging, admin dashboard |
| UI/UX | Dark theme, glassmorphism, responsive charts |
| Database design | SQLAlchemy ORM with RLS policies + pgvector |
| Auth/security | Supabase Auth with RLS policies |
| Cloud deployment | Vercel + Render + Supabase ready |

---

*For full project plan, see [PLAN.md](./PLAN.md)*
