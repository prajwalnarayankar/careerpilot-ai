import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.database import Base

class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False)
    role_target = Column(String(255), nullable=False)
    session_type = Column(String(50), default="Comprehensive")  # Technical, HR, Behavioral, Mock, Comprehensive
    overall_score = Column(Float, nullable=True)
    summary_feedback = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", back_populates="interview_sessions")
    job = relationship("Job", back_populates="interview_sessions")
    questions = relationship("InterviewQuestion", back_populates="session", cascade="all, delete-orphan")

class InterviewQuestion(Base):
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("interview_sessions.id", ondelete="CASCADE"), nullable=False)
    
    # Types: Technical, HR, Resume-based, Project, Job-description-specific, Behavioral
    category = Column(String(50), nullable=False)
    question_text = Column(Text, nullable=False)
    context_hint = Column(Text, nullable=True)
    sample_key_points = Column(JSON, default=list)
    order_index = Column(Integer, default=0)

    # Relationships
    session = relationship("InterviewSession", back_populates="questions")
    answer = relationship("InterviewAnswer", back_populates="question", uselist=False, cascade="all, delete-orphan")

class InterviewAnswer(Base):
    __tablename__ = "interview_answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("interview_questions.id", ondelete="CASCADE"), unique=True, nullable=False)
    
    user_answer = Column(Text, nullable=False)
    evaluation_score = Column(Float, nullable=False, default=0.0)  # 0 to 100
    feedback = Column(Text, nullable=False)
    improved_answer = Column(Text, nullable=False)
    strengths = Column(JSON, default=list)
    weaknesses = Column(JSON, default=list)
    key_takeaways = Column(JSON, default=list)

    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    question = relationship("InterviewQuestion", back_populates="answer")
