"""
Sanchal — FastAPI Main Application
Municipal Intelligence & Spatial Conflict Resolution Platform
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os

from database import init_db, get_db, GEOJSON_PATH
from models import PublicWork, Contractor, SocialGrievance

app = FastAPI(
    title="Sanchal API",
    description="AI-powered Municipal Intelligence & Spatial Conflict Resolution Platform",
    version="1.0.0",
)

# ── CORS (allow Next.js dev server) ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup_event():
    init_db()


# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "sanchal-api", "version": "1.0.0"}


# ── GeoJSON ───────────────────────────────────────────────────────────────────
@app.get("/api/geojson/roadworks")
async def get_roadworks_geojson():
    """Return the full roadworks GeoJSON for map rendering."""
    with open(GEOJSON_PATH, "r") as f:
        data = json.load(f)
    return JSONResponse(content=data)


# ── Public Works ──────────────────────────────────────────────────────────────
@app.get("/api/public-works")
async def get_public_works(
    status: Optional[str] = None,
    department: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(PublicWork)
    if status:
        query = query.filter(PublicWork.status == status)
    if department:
        query = query.filter(PublicWork.department == department)
    works = query.all()
    return [
        {
            "id": w.id,
            "road_name": w.road_name,
            "department": w.department,
            "contractor": w.contractor,
            "start_date": w.start_date,
            "end_date": w.end_date,
            "delay_risk_score": w.delay_risk_score,
            "status": w.status,
            "description": w.description,
            "estimated_cost_cr": w.estimated_cost_cr,
            "cpgrams_count": w.cpgrams_count,
        }
        for w in works
    ]


@app.get("/api/public-works/{project_id}")
async def get_public_work(project_id: str, db: Session = Depends(get_db)):
    work = db.query(PublicWork).filter(PublicWork.id == project_id).first()
    if not work:
        raise HTTPException(status_code=404, detail="Project not found")
    return work


# ── Contractors ───────────────────────────────────────────────────────────────
@app.get("/api/contractors")
async def get_contractors(db: Session = Depends(get_db)):
    contractors = db.query(Contractor).order_by(Contractor.cri_score.desc()).all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "cri_score": c.cri_score,
            "active_tender_id": c.active_tender_id,
            "active_project": c.active_project,
            "department": c.department,
            "escrow_status": c.escrow_status,
            "escrow_amount_cr": c.escrow_amount_cr,
            "projects_completed": c.projects_completed,
            "avg_delay_days": c.avg_delay_days,
        }
        for c in contractors
    ]


# ── Grievances ────────────────────────────────────────────────────────────────
@app.get("/api/grievances")
async def get_grievances(
    urgency_tier: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(SocialGrievance).order_by(SocialGrievance.timestamp.desc())
    if urgency_tier:
        query = query.filter(SocialGrievance.urgency_tier == urgency_tier)
    grievances = query.all()
    return [
        {
            "id": g.id,
            "platform": g.platform,
            "user_handle": g.user_handle,
            "content": g.content,
            "related_project_id": g.related_project_id,
            "urgency_tier": g.urgency_tier,
            "location_mention": g.location_mention,
            "likes": g.likes,
            "retweets": g.retweets,
            "cpgrams_filed": g.cpgrams_filed,
            "timestamp": g.timestamp.isoformat() if g.timestamp else None,
        }
        for g in grievances
    ]


# ── Conflict Detection ─────────────────────────────────────────────────────────
@app.get("/api/conflicts")
async def get_conflicts(db: Session = Depends(get_db)):
    """Return projects with CRITICAL_OVERLAP status (spatial conflicts)."""
    conflicts = (
        db.query(PublicWork)
        .filter(PublicWork.status == "CRITICAL_OVERLAP")
        .all()
    )
    return {
        "total_conflicts": len(conflicts),
        "projects": [
            {
                "id": c.id,
                "road_name": c.road_name,
                "department": c.department,
                "delay_risk_score": c.delay_risk_score,
                "status": c.status,
            }
            for c in conflicts
        ],
    }


# ── Dashboard Summary ─────────────────────────────────────────────────────────
@app.get("/api/dashboard/summary")
async def get_dashboard_summary(db: Session = Depends(get_db)):
    total_projects = db.query(PublicWork).count()
    critical = db.query(PublicWork).filter(PublicWork.status == "CRITICAL_OVERLAP").count()
    moderate = db.query(PublicWork).filter(PublicWork.status == "MODERATE_RISK").count()
    on_schedule = db.query(PublicWork).filter(PublicWork.status == "ON_SCHEDULE").count()
    total_grievances = db.query(SocialGrievance).count()
    high_urgency = db.query(SocialGrievance).filter(SocialGrievance.urgency_tier == "HIGH").count()
    avg_cri = db.query(Contractor).all()
    avg_cri_score = (
        round(sum(c.cri_score for c in avg_cri) / len(avg_cri), 1) if avg_cri else 0
    )
    return {
        "total_projects": total_projects,
        "critical_overlaps": critical,
        "moderate_risk": moderate,
        "on_schedule": on_schedule,
        "total_grievances": total_grievances,
        "high_urgency_grievances": high_urgency,
        "avg_contractor_cri": avg_cri_score,
    }
