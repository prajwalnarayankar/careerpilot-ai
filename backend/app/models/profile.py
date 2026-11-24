import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    # Required Profile Fields from specification:
    # name, email, phone (optional), location, preferred job role, preferred location,
    # experience level, skills, education, preferred work mode
    headline = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    preferred_job_role = Column(String(255), nullable=True)
    preferred_location = Column(String(255), nullable=True)
    experience_level = Column(String(100), default="Fresher / 0-2 years")  # e.g., Fresher / 0-2 years, Mid-Level / 3-5 years, Senior / 5+ years
    preferred_work_mode = Column(String(50), default="Remote / Hybrid / On-site")  # Remote, Hybrid, On-site, Any
    skills = Column(JSON, default=list)  # List of strings e.g. ["Python", "FastAPI", "Docker"]
    education = Column(JSON, default=list)  # List of dicts e.g. [{"degree": "B.Tech CS", "institution": "XYZ", "year": "2024"}]
    bio = Column(Text, nullable=True)
    target_salary = Column(String(100), nullable=True)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="profile")
