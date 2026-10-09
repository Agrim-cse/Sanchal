# Sanchal — AI Municipal Intelligence & Spatial Conflict Resolution Platform

> **Phase 1 Complete** · Greater Chennai Corporation · Tamil Nadu

---

## Quick Start

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
# → http://localhost:8000
# → Swagger UI: http://localhost:8000/docs
```

---

## Architecture

```
sanchal-monorepo/
├── backend/
│   ├── main.py           ← FastAPI app + all REST endpoints
│   ├── database.py       ← SQLite init, SessionLocal, seeding
│   ├── models.py         ← SQLAlchemy ORM models
│   ├── requirements.txt
│   └── data/
│       ├── roadworks.geojson  ← 8 Chennai excavation segments
│       └── sanchal.db         ← Auto-created on first run
└── frontend/
    ├── app/
    │   ├── layout.tsx    ← Root layout, Inter font, Leaflet CSS
    │   ├── globals.css   ← Design tokens, Leaflet dark theme
    │   └── page.tsx      ← Main dashboard (12-col grid)
    ├── components/dashboard/
    │   ├── Sidebar.tsx         ← Collapsible nav sidebar
    │   ├── Header.tsx          ← Top bar with search + status pills
    │   ├── MapContainer.tsx    ← react-leaflet + CartoDB dark + polylines
    │   ├── DelayCard.tsx       ← AI delay risk card with progress bar
    │   ├── ConflictModal.tsx   ← Overlap alerts + Dig-Once permit modal
    │   ├── GrievanceFeed.tsx   ← Live social feed with urgency filters
    │   ├── ContractorTable.tsx ← CRI scorecard + escrow status table
    │   └── CpgramsModal.tsx    ← Auto-filled CPGRAMS draft + download
    └── data/
        └── mockData.ts    ← Full TypeScript mock data (mirrors SQLite)
```

---

## Backend API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/api/geojson/roadworks` | Full GeoJSON for map rendering |
| GET | `/api/public-works` | All works (filter: `?status=&department=`) |
| GET | `/api/public-works/{id}` | Single project |
| GET | `/api/contractors` | All contractors sorted by CRI |
| GET | `/api/grievances` | All grievances (filter: `?urgency_tier=`) |
| GET | `/api/conflicts` | Critical overlap projects |
| GET | `/api/dashboard/summary` | Aggregated KPI summary |

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-base` | `#080A0F` | Page background |
| `--bg-surface` | `#0D0F14` | Cards, sidebar |
| `--bg-elevated` | `#13161D` | Inputs, rows |
| `--border-subtle` | `#1E2330` | All borders |
| `--risk-critical` | `#EF4444` | CRITICAL_OVERLAP |
| `--risk-moderate` | `#F59E0B` | MODERATE_RISK |
| `--risk-ok` | `#10B981` | ON_SCHEDULE |
| `--accent-blue` | `#3B82F6` | CTA buttons, active states |

---

## Phase 2 Roadmap
- Wire all UI components to live FastAPI endpoints
- ML model integration (scikit-learn delay predictor)
- Real CPGRAMS PDF generation (ReportLab)
- WebSocket live grievance ingestion (Twitter API v2)
- Visual audit drone footage uploader for escrow release
