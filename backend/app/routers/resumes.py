import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import Job
from app.schemas.resume import (
    ResumeResponse, ResumeAnalysisResponse, AnalyzeResumeRequest,
    ResumeOptimizationRequest, ResumeOptimizationResponse
)
from app.services.auth_service import get_current_user
from app.services.resume_parser import ResumeParserService
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/resumes", tags=["Resumes & ATS"])

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload, parse, and analyze a resume file (PDF or DOCX)."""
    filename = file.filename or "resume.pdf"
    _, ext = os.path.splitext(filename.lower())
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Only PDF and DOCX files are allowed."
        )

    # Read content and enforce size limit
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 10MB limit."
        )
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Save to disk securely
    unique_name = f"{current_user.id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    with open(file_path, "wb") as f:
        f.write(content)

    # Parse resume
    file_type = "pdf" if ext == ".pdf" else "docx"
    try:
        parsed_data = ResumeParserService.parse_file(file_path, file_type)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Error parsing resume: {str(e)}"
        )

    # Demote existing resumes as secondary if this is set to primary
    db.query(Resume).filter(Resume.user_id == current_user.id).update({"is_primary": 0})

    # Save Resume record
    db_resume = Resume(
        user_id=current_user.id,
        filename=unique_name,
        original_filename=filename,
        file_path=file_path,
        file_type=file_type,
        raw_text=parsed_data["raw_text"],
        candidate_name=parsed_data.get("candidate_name", current_user.full_name),
        contact_info=parsed_data.get("contact_info", {}),
        summary=parsed_data.get("summary"),
        education=parsed_data.get("education", []),
        experience=parsed_data.get("experience", []),
        projects=parsed_data.get("projects", []),
        skills=parsed_data.get("skills", []),
        certifications=parsed_data.get("certifications", []),
        is_primary=1
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)

    # Automatically run baseline ATS analysis
    ats_results = await orchestrator.audit_ats(parsed_data)
    db_analysis = ResumeAnalysis(
        resume_id=db_resume.id,
        ats_score=ats_results["ats_score"],
        keyword_match_score=ats_results["keyword_match_score"],
        skills_match_score=ats_results["skills_match_score"],
        formatting_score=ats_results["formatting_score"],
        experience_score=ats_results["experience_score"],
        education_score=ats_results["education_score"],
        formatting_problems=ats_results["formatting_problems"],
        missing_sections=ats_results["missing_sections"],
        measurable_achievements=ats_results["measurable_achievements"],
        extracted_keywords=ats_results["extracted_keywords"],
        missing_keywords=ats_results["missing_keywords"],
        recommendations=ats_results["recommendations"],
        strengths=ats_results["strengths"],
        weaknesses=ats_results["weaknesses"]
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_resume)

    # Attach latest analysis to response
    res_dict = ResumeResponse.model_validate(db_resume)
    res_dict.latest_analysis = ResumeAnalysisResponse.model_validate(db_analysis)
    return res_dict

@router.get("", response_model=List[ResumeResponse])
def get_resumes(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resumes = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).all()
    results = []
    for r in resumes:
        r_resp = ResumeResponse.model_validate(r)
        latest = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == r.id).order_by(ResumeAnalysis.id.desc()).first()
        if latest:
            r_resp.latest_analysis = ResumeAnalysisResponse.model_validate(latest)
        results.append(r_resp)
    return results

@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    r_resp = ResumeResponse.model_validate(resume)
    latest = db.query(ResumeAnalysis).filter(ResumeAnalysis.resume_id == resume.id).order_by(ResumeAnalysis.id.desc()).first()
    if latest:
        r_resp.latest_analysis = ResumeAnalysisResponse.model_validate(latest)
    return r_resp

@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(resume_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")
    
    if os.path.exists(resume.file_path):
        try:
            os.remove(resume.file_path)
        except Exception:
            pass
            
    db.delete(resume)
    db.commit()
    return None

@router.post("/{resume_id}/analyze", response_model=ResumeAnalysisResponse)
async def analyze_resume_endpoint(
    resume_id: int,
    request: AnalyzeResumeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    job_desc = request.job_description
    target_role = request.target_role
    if request.target_job_id:
        job = db.query(Job).filter(Job.id == request.target_job_id).first()
        if job:
            job_desc = job.description
            target_role = job.title

    resume_data = {
        "raw_text": resume.raw_text,
        "skills": resume.skills,
        "experience": resume.experience,
        "education": resume.education,
        "projects": resume.projects,
        "contact_info": resume.contact_info,
        "summary": resume.summary,
    }

    ats_results = await orchestrator.audit_ats(resume_data, job_description=job_desc, target_role=target_role)

    db_analysis = ResumeAnalysis(
        resume_id=resume.id,
        target_role=target_role,
        target_job_id=request.target_job_id,
        ats_score=ats_results["ats_score"],
        keyword_match_score=ats_results["keyword_match_score"],
        skills_match_score=ats_results["skills_match_score"],
        formatting_score=ats_results["formatting_score"],
        experience_score=ats_results["experience_score"],
        education_score=ats_results["education_score"],
        formatting_problems=ats_results["formatting_problems"],
        missing_sections=ats_results["missing_sections"],
        measurable_achievements=ats_results["measurable_achievements"],
        extracted_keywords=ats_results["extracted_keywords"],
        missing_keywords=ats_results["missing_keywords"],
        recommendations=ats_results["recommendations"],
        strengths=ats_results["strengths"],
        weaknesses=ats_results["weaknesses"]
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)

    return db_analysis

@router.post("/{resume_id}/optimize", response_model=ResumeOptimizationResponse)
async def optimize_resume_endpoint(
    resume_id: int,
    request: ResumeOptimizationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Resume not found.")

    job_data = None
    if request.target_job_id:
        job = db.query(Job).filter(Job.id == request.target_job_id).first()
        if job:
            job_data = {
                "title": job.title,
                "company": job.company,
                "skills": job.skills,
                "description": job.description
            }

    resume_data = {
        "id": resume.id,
        "candidate_name": resume.candidate_name,
        "skills": resume.skills,
        "experience": resume.experience,
        "education": resume.education,
        "projects": resume.projects,
        "summary": resume.summary,
    }

    optimized = await orchestrator.optimize_resume(
        resume_data=resume_data,
        job_data=job_data,
        job_description=request.job_description,
        target_role=request.target_role or (job_data.get("title") if job_data else None)
    )

    return optimized
