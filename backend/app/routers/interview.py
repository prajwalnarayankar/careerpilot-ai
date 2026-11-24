import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.interview import InterviewSession, InterviewQuestion, InterviewAnswer
from app.models.job import Job
from app.models.resume import Resume
from app.schemas.interview import (
    InterviewSessionCreate, InterviewSessionResponse,
    InterviewAnswerCreate, InterviewAnswerResponse, EvaluateAnswerRequest
)
from app.services.auth_service import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/interview", tags=["Interview Preparation & Mock Simulator"])

@router.post("/generate", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def generate_interview_session(
    req: InterviewSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate an interview preparation session with categorized questions."""
    job_data = None
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if job:
            job_data = {
                "title": job.title,
                "company": job.company,
                "description": job.description,
                "skills": job.skills
            }

    # Get candidate skills
    resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
    candidate_skills = resume.skills if resume else ["Python", "FastAPI", "SQL", "Git"]

    questions_data = await orchestrator.prepare_interview(
        role_target=req.role_target,
        job_data=job_data,
        candidate_skills=candidate_skills,
        session_type=req.session_type or "Comprehensive"
    )

    title = f"{req.role_target} Interview ({req.session_type or 'Comprehensive'})"
    if job_data:
        title = f"{job_data['title']} at {job_data['company']}"

    db_session = InterviewSession(
        user_id=current_user.id,
        job_id=req.job_id,
        title=title,
        role_target=req.role_target,
        session_type=req.session_type or "Comprehensive"
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)

    # Add questions
    for idx, q in enumerate(questions_data):
        db_q = InterviewQuestion(
            session_id=db_session.id,
            category=q.get("category", "Technical"),
            question_text=q["question_text"],
            context_hint=q.get("context_hint"),
            sample_key_points=q.get("sample_key_points", []),
            order_index=idx
        )
        db.add(db_q)
    db.commit()
    db.refresh(db_session)

    return db_session

@router.get("/sessions", response_model=List[InterviewSessionResponse])
def list_interview_sessions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(InterviewSession).filter(InterviewSession.user_id == current_user.id).order_by(InterviewSession.id.desc()).all()

@router.get("/sessions/{session_id}", response_model=InterviewSessionResponse)
def get_interview_session(session_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    session = db.query(InterviewSession).filter(InterviewSession.id == session_id, InterviewSession.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Interview session not found.")
    return session

@router.post("/evaluate", response_model=InterviewAnswerResponse)
async def evaluate_interview_answer(
    req: EvaluateAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit candidate response to a question and receive AI evaluation."""
    question = db.query(InterviewQuestion).filter(InterviewQuestion.id == req.question_id).first()
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found.")

    # Verify session ownership
    session = db.query(InterviewSession).filter(
        InterviewSession.id == question.session_id,
        InterviewSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.")

    # Evaluate via InterviewAgent
    eval_result = await orchestrator.evaluate_interview_response(
        question_text=question.question_text,
        category=question.category,
        user_answer=req.user_answer,
        context_hint=question.context_hint
    )

    existing_answer = db.query(InterviewAnswer).filter(InterviewAnswer.question_id == question.id).first()
    if not existing_answer:
        existing_answer = InterviewAnswer(question_id=question.id)
        db.add(existing_answer)

    existing_answer.user_answer = req.user_answer
    existing_answer.evaluation_score = eval_result["evaluation_score"]
    existing_answer.feedback = eval_result["feedback"]
    existing_answer.improved_answer = eval_result["improved_answer"]
    existing_answer.strengths = eval_result["strengths"]
    existing_answer.weaknesses = eval_result["weaknesses"]
    existing_answer.key_takeaways = eval_result["key_takeaways"]
    existing_answer.submitted_at = datetime.datetime.utcnow()

    db.commit()
    db.refresh(existing_answer)

    # Recalculate session overall average score
    all_answers = db.query(InterviewAnswer).join(InterviewQuestion).filter(
        InterviewQuestion.session_id == session.id
    ).all()
    if all_answers:
        avg_score = sum(a.evaluation_score for a in all_answers) / len(all_answers)
        session.overall_score = round(avg_score, 1)
        db.commit()

    return existing_answer
