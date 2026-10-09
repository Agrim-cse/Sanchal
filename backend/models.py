"""
Sanchal — Database models using SQLAlchemy ORM.
Defines tables: public_works, contractors, social_grievances.
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class PublicWork(Base):
    __tablename__ = "public_works"

    id = Column(String, primary_key=True, index=True)
    road_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    contractor = Column(String, nullable=False)
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    delay_risk_score = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    estimated_cost_cr = Column(Float, nullable=True)
    cpgrams_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Contractor(Base):
    __tablename__ = "contractors"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    cri_score = Column(Integer, nullable=False)  # Contractor Reliability Index 0–100
    active_tender_id = Column(String, nullable=True)
    active_project = Column(String, nullable=True)
    department = Column(String, nullable=True)
    escrow_status = Column(String, nullable=False)
    escrow_amount_cr = Column(Float, nullable=True)
    projects_completed = Column(Integer, default=0)
    avg_delay_days = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)


class SocialGrievance(Base):
    __tablename__ = "social_grievances"

    id = Column(Integer, primary_key=True, autoincrement=True)
    platform = Column(String, nullable=False)           # "Twitter", "Facebook", etc.
    user_handle = Column(String, nullable=False)
    user_avatar_seed = Column(String, nullable=True)    # seed for avatar generation
    content = Column(Text, nullable=False)
    related_project_id = Column(String, nullable=True)
    urgency_tier = Column(String, nullable=False)       # HIGH, MEDIUM, LOW
    location_mention = Column(String, nullable=True)
    likes = Column(Integer, default=0)
    retweets = Column(Integer, default=0)
    cpgrams_filed = Column(Integer, default=0)          # 1 if CPGRAMS filed
    timestamp = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
