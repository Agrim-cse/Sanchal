"""
Sanchal — FastAPI Main Application (Phase 2)
=============================================
Municipal Intelligence & Spatial Conflict Resolution Platform

Wires together:
  - database.py      → SQLite CRUD
  - models.py        → SQLAlchemy ORM
  - spatial_engine.py → Shapely conflict detection
  - ml_engine.py     → LightGBM delay prediction
  - nlp_engine.py    → DistilBERT grievance urgency classification

Startup sequence:
  1. init_db()          — create tables + seed data
  2. train_and_save_model() — train LightGBM (skips if pkl already exists)
"""

import json
import logging
import os
from datetime import datetime
from typing import Any, Optional

from fastapi import Depends, FastAPI, Form, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import GEOJSON_PATH, get_db, init_db
from ml_engine import predict_delay_risk, train_and_save_model
from models import Contractor, PublicWork, SocialGrievance
from nlp_engine import classify_grievance
from spatial_engine import detect_spatial_conflicts
from whatsapp_bot import process_whatsapp_message, build_twiml_response

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("sanchal.main")

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(
    title="Sanchal API",
    description=(
        "AI-powered Municipal Intelligence & Spatial Conflict Resolution Platform. "
        "Exposes spatial conflict detection, ML delay prediction, NLP grievance "
        "classification, and CRUD operations on the Greater Chennai Corporation "
        "road-works database."
    ),
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS — allow Next.js dev server + any Vercel preview ──────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten to specific origins before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def startup_event():
    logger.info("Sanchal API starting up…")
    init_db()
    logger.info("Database initialised and seeded.")
    # Train the ML model in the background (non-blocking) so Swagger loads fast
    try:
        train_and_save_model()
    except Exception as exc:
        logger.warning("ML model training skipped: %s", exc)


# ---------------------------------------------------------------------------
# Pydantic request / response models
# ---------------------------------------------------------------------------

class DelayPredictRequest(BaseModel):
    """Payload for POST /api/predict-delay"""
    project_id:       Optional[str]   = Field(None,  description="Optional existing project ID")
    department:       str             = Field("Other", description="Department name")
    start_date:       str             = Field("2026-10-01", description="YYYY-MM-DD")
    end_date:         str             = Field("2026-12-31", description="YYYY-MM-DD")
    estimated_cost_cr: float          = Field(10.0,  ge=0)
    project_scope_size: float         = Field(5.0,   ge=0,  description="Lane-km of excavation")
    avg_delay_days:   float           = Field(10.0,  ge=0,  description="Contractor historical avg delay")
    cpgrams_count:    int             = Field(0,     ge=0)
    contractor_id:    int             = Field(1,     ge=1)
    status:           str             = Field("MODERATE_RISK")


class DelayPredictResponse(BaseModel):
    project_id:           Optional[str]
    delay_risk_score:     int   = Field(..., ge=0, le=100)
    risk_label:           str
    estimated_delay_days: int
    model_used:           str


class IngestSocialRequest(BaseModel):
    """Payload for POST /api/ingest-social"""
    platform:           str  = Field(..., description="'Twitter' or 'Facebook'")
    user_handle:        str  = Field(..., description="@handle or page name")
    content:            str  = Field(..., min_length=5, description="Raw post text")
    related_project_id: Optional[str] = None
    location_mention:   Optional[str] = None
    likes:              int  = Field(0, ge=0)
    retweets:           int  = Field(0, ge=0)


class ConflictResponse(BaseModel):
    id:               str
    road_name:        str
    departments:      list[str]
    project_ids:      list[str]
    severity:         str
    overlap_area_sqm: float
    description:      str


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _work_to_dict(w: PublicWork) -> dict:
    return {
        "id":                w.id,
        "road_name":         w.road_name,
        "department":        w.department,
        "contractor":        w.contractor,
        "start_date":        w.start_date,
        "end_date":          w.end_date,
        "delay_risk_score":  w.delay_risk_score,
        "status":            w.status,
        "description":       w.description,
        "estimated_cost_cr": w.estimated_cost_cr,
        "cpgrams_count":     w.cpgrams_count,
    }


def _contractor_to_dict(c: Contractor) -> dict:
    return {
        "id":                 c.id,
        "name":               c.name,
        "cri_score":          c.cri_score,
        "active_tender_id":   c.active_tender_id,
        "active_project":     c.active_project,
        "department":         c.department,
        "escrow_status":      c.escrow_status,
        "escrow_amount_cr":   c.escrow_amount_cr,
        "projects_completed": c.projects_completed,
        "avg_delay_days":     c.avg_delay_days,
    }


def _grievance_to_dict(g: SocialGrievance) -> dict:
    return {
        "id":                 g.id,
        "platform":           g.platform,
        "user_handle":        g.user_handle,
        "user_avatar_seed":   g.user_avatar_seed,
        "content":            g.content,
        "related_project_id": g.related_project_id,
        "urgency_tier":       g.urgency_tier,
        "location_mention":   g.location_mention,
        "likes":              g.likes,
        "retweets":           g.retweets,
        "cpgrams_filed":      g.cpgrams_filed,
        "timestamp":          g.timestamp.isoformat() if g.timestamp else None,
    }


# ===========================================================================
# ENDPOINTS
# ===========================================================================

# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------
@app.get("/health", tags=["System"])
async def health():
    """Liveness probe. Returns service metadata."""
    return {
        "status":    "ok",
        "service":   "sanchal-api",
        "version":   "2.0.0",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }


# ---------------------------------------------------------------------------
# GeoJSON
# ---------------------------------------------------------------------------
@app.get("/api/geojson/roadworks", tags=["Spatial"])
async def get_roadworks_geojson():
    """
    Returns the full GeoJSON FeatureCollection of active excavation segments.
    Used by react-leaflet to render vector polylines on the map.
    """
    with open(GEOJSON_PATH, "r", encoding="utf-8") as fh:
        data = json.load(fh)
    return JSONResponse(content=data)


# ---------------------------------------------------------------------------
# Public Works / Projects
# ---------------------------------------------------------------------------
@app.get("/api/projects", tags=["Projects"])
@app.get("/api/public-works", tags=["Projects"])
async def get_public_works(
    status:     Optional[str] = None,
    department: Optional[str] = None,
    db:         Session       = Depends(get_db),
):
    """
    List all active public works projects.

    Query params:
    - status: `CRITICAL_OVERLAP` | `MODERATE_RISK` | `ON_SCHEDULE`
    - department: filter by department name substring
    """
    query = db.query(PublicWork)
    if status:
        query = query.filter(PublicWork.status == status)
    if department:
        query = query.filter(PublicWork.department.ilike(f"%{department}%"))
    works = query.all()
    return [_work_to_dict(w) for w in works]


@app.get("/api/public-works/{project_id}", tags=["Projects"])
async def get_public_work(project_id: str, db: Session = Depends(get_db)):
    """Retrieve a single project by ID (e.g. PRJ-CHE-101)."""
    work = db.query(PublicWork).filter(PublicWork.id == project_id).first()
    if not work:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return _work_to_dict(work)


# ---------------------------------------------------------------------------
# Spatial Conflict Detection
# ---------------------------------------------------------------------------
@app.get("/api/conflicts", tags=["Spatial"], response_model=list[ConflictResponse])
async def get_conflicts():
    """
    Run the Shapely spatial conflict engine on the current GeoJSON dataset.
    Returns a list of CRITICAL / HIGH overlap incidents with AI recommendations.

    Note: This endpoint is compute-only (no DB write). Results are deterministic
    for a given GeoJSON snapshot.
    """
    conflicts = detect_spatial_conflicts()   # loads from data/roadworks.geojson
    return conflicts


# ---------------------------------------------------------------------------
# ML Delay Prediction
# ---------------------------------------------------------------------------
@app.post("/api/predict-delay", tags=["ML"], response_model=DelayPredictResponse)
async def predict_delay(body: DelayPredictRequest):
    """
    Predict the slippage probability for a road-works project.

    - Uses LightGBM if the model file is present.
    - Falls back to a weighted heuristic formula if LightGBM is unavailable.

    Returns a `delay_risk_score` (0–100 %) aligned with the frontend DelayCard thresholds:
    - `> 75` → HIGH RISK
    - `40–75` → MODERATE
    - `< 40` → ON TRACK
    """
    project_dict = body.model_dump()
    result = predict_delay_risk(project_dict)
    return DelayPredictResponse(
        project_id=body.project_id,
        **result,
    )


# ---------------------------------------------------------------------------
# NLP Social Grievance Ingestion
# ---------------------------------------------------------------------------
@app.post("/api/ingest-social", tags=["NLP"])
async def ingest_social(body: IngestSocialRequest, db: Session = Depends(get_db)):
    """
    Classify and persist an incoming social media grievance.

    1. Runs the NLP pipeline (DistilBERT → keyword fallback).
    2. Writes the classified record to the `social_grievances` SQLite table.
    3. Returns the full saved record including assigned urgency tier.
    """
    classification = classify_grievance(body.content)

    grievance = SocialGrievance(
        platform=body.platform,
        user_handle=body.user_handle,
        user_avatar_seed=body.user_handle.replace("@", "").replace(" ", "").lower(),
        content=body.content,
        related_project_id=body.related_project_id,
        urgency_tier=classification["urgency_tier"],
        location_mention=body.location_mention,
        likes=body.likes,
        retweets=body.retweets,
        cpgrams_filed=0,
        timestamp=datetime.utcnow(),
    )
    db.add(grievance)
    db.commit()
    db.refresh(grievance)

    return {
        **_grievance_to_dict(grievance),
        "nlp_result": classification,
    }


# ---------------------------------------------------------------------------
# Grievances (read)
# ---------------------------------------------------------------------------
@app.get("/api/grievances", tags=["NLP"])
async def get_grievances(
    urgency_tier: Optional[str] = None,
    db:           Session       = Depends(get_db),
):
    """
    List all ingested social grievances, newest first.
    Filter by `urgency_tier`: `HIGH` | `MEDIUM` | `LOW`
    """
    query = db.query(SocialGrievance).order_by(SocialGrievance.timestamp.desc())
    if urgency_tier:
        query = query.filter(SocialGrievance.urgency_tier == urgency_tier.upper())
    return [_grievance_to_dict(g) for g in query.all()]


# ---------------------------------------------------------------------------
# Contractors
# ---------------------------------------------------------------------------
@app.get("/api/contractors", tags=["Contractors"])
async def get_contractors(db: Session = Depends(get_db)):
    """
    List all contractors sorted by Contractor Reliability Index (CRI) descending.
    """
    contractors = (
        db.query(Contractor)
        .order_by(Contractor.cri_score.desc())
        .all()
    )
    return [_contractor_to_dict(c) for c in contractors]


# ---------------------------------------------------------------------------
# Dashboard Summary KPIs
# ---------------------------------------------------------------------------
@app.get("/api/dashboard/summary", tags=["Dashboard"])
async def get_dashboard_summary(db: Session = Depends(get_db)):
    """
    Aggregated KPI snapshot for the Mission Control stat cards.
    """
    total_projects  = db.query(PublicWork).count()
    critical        = db.query(PublicWork).filter(PublicWork.status == "CRITICAL_OVERLAP").count()
    moderate        = db.query(PublicWork).filter(PublicWork.status == "MODERATE_RISK").count()
    on_schedule     = db.query(PublicWork).filter(PublicWork.status == "ON_SCHEDULE").count()
    total_griev     = db.query(SocialGrievance).count()
    high_urgency    = db.query(SocialGrievance).filter(SocialGrievance.urgency_tier == "HIGH").count()
    all_contractors = db.query(Contractor).all()
    avg_cri = (
        round(sum(c.cri_score for c in all_contractors) / len(all_contractors), 1)
        if all_contractors else 0
    )
    return {
        "total_projects":           total_projects,
        "critical_overlaps":        critical,
        "moderate_risk":            moderate,
        "on_schedule":              on_schedule,
        "total_grievances":         total_griev,
        "high_urgency_grievances":  high_urgency,
        "avg_contractor_cri":       avg_cri,
    }


# ---------------------------------------------------------------------------
# Phase 4 — Twilio WhatsApp Webhook
# ---------------------------------------------------------------------------

@app.post(
    "/api/whatsapp",
    tags=["Integrations"],
    response_class=HTMLResponse,
    summary="Twilio WhatsApp inbound webhook",
    description=(
        "Receives an inbound WhatsApp message forwarded by Twilio, queries the "
        "Sanchal project database, translates the response into the citizen's "
        "language (Tamil / Hindi / English), and returns a TwiML XML reply that "
        "Twilio sends back as a WhatsApp message."
    ),
)
async def whatsapp_webhook(
    Body: str = Form(..., description="Text body of the incoming WhatsApp message"),
    From: str = Form(..., description="Sender's WhatsApp number, e.g. whatsapp:+919876543210"),
    db: Session = Depends(get_db),
):
    """
    Twilio sends a multipart/form-data POST with (at minimum):
      - Body   : the citizen's raw message text
      - From   : the sender's WhatsApp-prefixed number

    We respond with TwiML XML (Content-Type: text/xml) so Twilio can relay
    the WhatsApp reply back to the citizen.

    Example Twilio webhook URL to configure:
      POST https://<your-domain>/api/whatsapp
    """
    try:
        reply_text = process_whatsapp_message(
            body=Body,
            from_number=From,
            db=db,
        )
    except Exception as exc:
        logger.error("WhatsApp bot processing error: %s", exc)
        reply_text = (
            "⚠️ Sanchal is temporarily unavailable. "
            "Please try again in a moment or visit pgportal.gov.in."
        )

    twiml_xml = build_twiml_response(reply_text)
    return HTMLResponse(content=twiml_xml, media_type="text/xml")
