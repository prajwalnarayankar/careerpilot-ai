import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # "pdf", "docx"
    
    # Raw extracted text
    raw_text = Column(Text, nullable=False)
    
    # Structured extracted content
    candidate_name = Column(String(255), nullable=True)
    contact_info = Column(JSON, default=dict)  # email, phone, links, location
    summary = Column(Text, nullable=True)
    education = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    skills = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    
    is_primary = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="resumes")
    analyses = relationship("ResumeAnalysis", back_populates="resume", cascade="all, delete-orphan")
    job_matches = relationship("JobMatch", back_populates="resume", cascade="all, delete-orphan")

class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False)
    
    # Target role/job context if analyzed against specific job
    target_role = Column(String(255), nullable=True)
    target_job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    
    # ATS Compatibility metrics (0 - 100)
    ats_score = Column(Float, nullable=False, default=0.0)
    keyword_match_score = Column(Float, nullable=False, default=0.0)
    skills_match_score = Column(Float, nullable=False, default=0.0)
    formatting_score = Column(Float, nullable=False, default=0.0)
    experience_score = Column(Float, nullable=False, default=0.0)
    education_score = Column(Float, nullable=False, default=0.0)
    
    # Detailed findings
    formatting_problems = Column(JSON, default=list)
    missing_sections = Column(JSON, default=list)
    measurable_achievements = Column(JSON, default=list)
    extracted_keywords = Column(JSON, default=list)
    missing_keywords = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    resume = relationship("Resume", back_populates="analyses")
    target_job = relationship("Job")
