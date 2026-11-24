from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.cover_letter import CoverLetter
from app.models.resume import Resume
from app.models.job import Job
from app.schemas.cover_letter import (
    CoverLetterGenerateRequest, CoverLetterResponse, CoverLetterUpdateRequest
)
from app.services.auth_service import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/cover-letter", tags=["Cover Letters"])

@router.post("/generate", response_model=CoverLetterResponse)
async def generate_cover_letter_endpoint(
    req: CoverLetterGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generate or regenerate a personalized cover letter using the CoverLetterAgent."""
    resume = None
    if req.resume_id:
        resume = db.query(Resume).filter(Resume.id == req.resume_id, Resume.user_id == current_user.id).first()
    else:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
        if not resume:
            resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()

    candidate_name = resume.candidate_name if resume and resume.candidate_name else current_user.full_name
    skills = resume.skills if resume and resume.skills else ["Python", "FastAPI", "Software Engineering"]
    exp_summary = resume.summary if resume else None

    # Retrieve job description if job_id provided
    job_desc = req.job_description
    if req.job_id:
        job = db.query(Job).filter(Job.id == req.job_id).first()
        if job and not job_desc:
            job_desc = job.description

    content = await orchestrator.generate_cover_letter(
        candidate_name=candidate_name,
        user_skills=skills,
        company_name=req.company_name,
        job_title=req.job_title,
        job_description=job_desc,
        tone=req.tone or "Professional",
        custom_instructions=req.custom_instructions,
        experience_summary=exp_summary
    )

    # Save to database
    db_letter = CoverLetter(
        user_id=current_user.id,
        job_id=req.job_id,
        resume_id=resume.id if resume else None,
        company_name=req.company_name,
        job_title=req.job_title,
        salutation=f"Hiring Team at {req.company_name}",
        content=content,
        tone=req.tone or "Professional",
        version=1
    )
    db.add(db_letter)
    db.commit()
    db.refresh(db_letter)

    return db_letter

@router.get("", response_model=List[CoverLetterResponse])
def list_cover_letters(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CoverLetter).filter(CoverLetter.user_id == current_user.id).order_by(CoverLetter.id.desc()).all()

@router.get("/{letter_id}", response_model=CoverLetterResponse)
def get_cover_letter(letter_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    letter = db.query(CoverLetter).filter(CoverLetter.id == letter_id, CoverLetter.user_id == current_user.id).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found.")
    return letter

@router.put("/{letter_id}", response_model=CoverLetterResponse)
def update_cover_letter(
    letter_id: int,
    req: CoverLetterUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    letter = db.query(CoverLetter).filter(CoverLetter.id == letter_id, CoverLetter.user_id == current_user.id).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found.")

    letter.content = req.content
    if req.salutation:
        letter.salutation = req.salutation
    if req.tone:
        letter.tone = req.tone
    letter.version += 1

    db.commit()
    db.refresh(letter)
    return letter

@router.delete("/{letter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cover_letter(letter_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    letter = db.query(CoverLetter).filter(CoverLetter.id == letter_id, CoverLetter.user_id == current_user.id).first()
    if not letter:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found.")
    db.delete(letter)
    db.commit()
    return None
