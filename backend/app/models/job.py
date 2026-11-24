import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float, Boolean, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    location = Column(String(255), nullable=False, index=True)
    work_mode = Column(String(50), default="On-site", index=True)  # Remote, Hybrid, On-site
    experience = Column(String(100), default="0-2 years", index=True)  # Fresher / 0-2 years, 3-5 years, 5+ years
    salary = Column(String(100), nullable=True)
    description = Column(Text, nullable=False)
    skills = Column(JSON, default=list)  # ["Python", "FastAPI", "Docker", "SQL"]
    job_url = Column(String(500), nullable=True)
    source = Column(String(100), default="demo")  # api, web, selenium, demo
    is_demo = Column(Boolean, default=False)
    external_id = Column(String(255), unique=True, index=True, nullable=True)  # For deduplication
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")
    matches = relationship("JobMatch", back_populates="job", cascade="all, delete-orphan")
    interview_sessions = relationship("InterviewSession", back_populates="job", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="job", cascade="all, delete-orphan")

class JobMatch(Base):
    __tablename__ = "job_matches"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="CASCADE"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=True)
    
    match_score = Column(Float, nullable=False, default=0.0)  # 0 to 100
    skills_match_score = Column(Float, nullable=False, default=0.0)
    experience_compatibility = Column(String(100), nullable=True)
    education_compatibility = Column(String(100), nullable=True)
    keyword_overlap = Column(Float, default=0.0)
    
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="job_matches")
    job = relationship("Job", back_populates="matches")
    resume = relationship("Resume", back_populates="job_matches")
