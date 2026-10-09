"""
Sanchal — Database initialization and seeding.
Uses SQLite via SQLAlchemy. Seeds all three tables from mock data.
"""

import json
import os
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from models import Base, PublicWork, Contractor, SocialGrievance

# ── SQLite database stored in backend/data/sanchal.db ────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "data", "sanchal.db")
GEOJSON_PATH = os.path.join(BASE_DIR, "data", "roadworks.geojson")

DATABASE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """Dependency injector for FastAPI routes."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables and seed if empty."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(PublicWork).count() == 0:
            _seed_public_works(db)
        if db.query(Contractor).count() == 0:
            _seed_contractors(db)
        if db.query(SocialGrievance).count() == 0:
            _seed_grievances(db)
    finally:
        db.close()


# ── Seed helpers ─────────────────────────────────────────────────────────────

def _seed_public_works(db: Session):
    with open(GEOJSON_PATH, "r") as f:
        geojson = json.load(f)

    for feature in geojson["features"]:
        props = feature["properties"]
        work = PublicWork(
            id=props["id"],
            road_name=props["road_name"],
            department=props["department"],
            contractor=props["contractor"],
            start_date=props["start_date"],
            end_date=props["end_date"],
            delay_risk_score=props["delay_risk_score"],
            status=props["status"],
            description=props.get("description"),
            estimated_cost_cr=props.get("estimated_cost_cr"),
            cpgrams_count=props.get("cpgrams_count", 0),
        )
        db.add(work)
    db.commit()


def _seed_contractors(db: Session):
    contractors = [
        Contractor(
            name="L&T Infrastructure",
            cri_score=78,
            active_tender_id="TND-2026-OMR-101",
            active_project="PRJ-CHE-101",
            department="Chennai Metro Water",
            escrow_status="Locked - Awaiting Visual Audit",
            escrow_amount_cr=3.6,
            projects_completed=42,
            avg_delay_days=12.4,
        ),
        Contractor(
            name="KEC International",
            cri_score=62,
            active_tender_id="TND-2026-OMR-102",
            active_project="PRJ-CHE-102",
            department="TNEB Electricity Board",
            escrow_status="Locked - Awaiting Visual Audit",
            escrow_amount_cr=2.3,
            projects_completed=31,
            avg_delay_days=19.7,
        ),
        Contractor(
            name="Afcons Infrastructure",
            cri_score=85,
            active_tender_id="TND-2026-VLY-103",
            active_project="PRJ-CHE-103",
            department="CMRL Metro",
            escrow_status="Released",
            escrow_amount_cr=5.7,
            projects_completed=58,
            avg_delay_days=6.2,
        ),
        Contractor(
            name="Sterlite Technologies",
            cri_score=71,
            active_tender_id="TND-2026-GST-104",
            active_project="PRJ-CHE-104",
            department="BSNL Telecom",
            escrow_status="Released",
            escrow_amount_cr=0.9,
            projects_completed=24,
            avg_delay_days=9.8,
        ),
        Contractor(
            name="NCC Limited",
            cri_score=91,
            active_tender_id="TND-2026-TMB-105",
            active_project="PRJ-CHE-105",
            department="Chennai Metro Water",
            escrow_status="Released",
            escrow_amount_cr=1.8,
            projects_completed=67,
            avg_delay_days=3.1,
        ),
        Contractor(
            name="Tata Projects Limited",
            cri_score=68,
            active_tender_id="TND-2026-ANS-106",
            active_project="PRJ-CHE-106",
            department="TNEB Electricity Board",
            escrow_status="Locked - Awaiting Visual Audit",
            escrow_amount_cr=4.6,
            projects_completed=39,
            avg_delay_days=14.5,
        ),
        Contractor(
            name="Bharti Infratel",
            cri_score=54,
            active_tender_id="TND-2026-KYB-108",
            active_project="PRJ-CHE-108",
            department="BSNL Telecom",
            escrow_status="Locked - Awaiting Visual Audit",
            escrow_amount_cr=1.5,
            projects_completed=18,
            avg_delay_days=22.3,
        ),
    ]
    db.add_all(contractors)
    db.commit()


def _seed_grievances(db: Session):
    now = datetime.utcnow()
    grievances = [
        SocialGrievance(
            platform="Twitter",
            user_handle="@chennai_commuter",
            user_avatar_seed="commuter1",
            content="Unannounced trench dug on OMR causing major traffic bottleneck near Perungudi junction. No barricades, dangerous at night! #Chennai #RoadWorks",
            related_project_id="PRJ-CHE-101",
            urgency_tier="HIGH",
            location_mention="OMR, Perungudi",
            likes=312,
            retweets=89,
            cpgrams_filed=1,
            timestamp=now - timedelta(hours=2),
        ),
        SocialGrievance(
            platform="Twitter",
            user_handle="@omr_resident_blr",
            user_avatar_seed="resident2",
            content="TNEB digging and Metro Water also digging on the SAME stretch of OMR Sholinganallur. What is CMDA doing? This is madness! @CMOTamilNadu",
            related_project_id="PRJ-CHE-102",
            urgency_tier="HIGH",
            location_mention="OMR, Sholinganallur",
            likes=547,
            retweets=203,
            cpgrams_filed=1,
            timestamp=now - timedelta(hours=5),
        ),
        SocialGrievance(
            platform="Facebook",
            user_handle="Velachery Residents Forum",
            user_avatar_seed="forum3",
            content="Metro Phase 2 utility diversion work on Velachery Main Road has been going on for 3 weeks. Dust, noise, and blocked footpaths. Residents need immediate action.",
            related_project_id="PRJ-CHE-103",
            urgency_tier="MEDIUM",
            location_mention="Velachery Main Road",
            likes=189,
            retweets=44,
            cpgrams_filed=0,
            timestamp=now - timedelta(hours=11),
        ),
        SocialGrievance(
            platform="Twitter",
            user_handle="@gst_road_watch",
            user_avatar_seed="watch4",
            content="BSNL fibre digging on GST Chromepet junction blocking entry to Pallavaram market. Small businesses suffering. Week 3 of disruption.",
            related_project_id="PRJ-CHE-104",
            urgency_tier="MEDIUM",
            location_mention="GST Road, Chromepet",
            likes=94,
            retweets=31,
            cpgrams_filed=0,
            timestamp=now - timedelta(hours=18),
        ),
        SocialGrievance(
            platform="Twitter",
            user_handle="@namma_chennai_cares",
            user_avatar_seed="cares5",
            content="Kudos to NCC Limited for completing Tambaram sewer work well within schedule with proper barricading. Rare sight! Hope other contractors follow.",
            related_project_id="PRJ-CHE-105",
            urgency_tier="LOW",
            location_mention="GST Road, Tambaram",
            likes=423,
            retweets=117,
            cpgrams_filed=0,
            timestamp=now - timedelta(hours=26),
        ),
        SocialGrievance(
            platform="Twitter",
            user_handle="@annaroad_daily",
            user_avatar_seed="daily6",
            content="Anna Salai near Nandanam flyover dug up again! This is the 3rd time in 18 months. When will the govt implement Dig-Once policy? #SingleWindowExcavation",
            related_project_id="PRJ-CHE-106",
            urgency_tier="HIGH",
            location_mention="Anna Salai, Nandanam",
            likes=1203,
            retweets=489,
            cpgrams_filed=1,
            timestamp=now - timedelta(hours=3),
        ),
        SocialGrievance(
            platform="Twitter",
            user_handle="@koyambedu_hub",
            user_avatar_seed="hub7",
            content="5G duct work near Koyambedu bus terminus has zero safety measures. Open trench overnight. Accident waiting to happen. @ChennaiCorpn please act!",
            related_project_id="PRJ-CHE-108",
            urgency_tier="HIGH",
            location_mention="Poonamallee High Road, Koyambedu",
            likes=678,
            retweets=234,
            cpgrams_filed=1,
            timestamp=now - timedelta(hours=1),
        ),
    ]
    db.add_all(grievances)
    db.commit()
