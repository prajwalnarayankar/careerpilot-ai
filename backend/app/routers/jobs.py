from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.job import Job, JobMatch
from app.models.resume import Resume
from app.models.application import Application
from app.schemas.job import JobResponse, JobSearchRequest, JobSearchResponse, JobMatchResponse
from app.services.auth_service import get_current_user
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/jobs", tags=["Jobs & Matching"])

@router.get("", response_model=JobSearchResponse)
async def list_jobs(
    keyword: Optional[str] = None,
    location: Optional[str] = None,
    experience: Optional[str] = None,
    work_mode: Optional[str] = None,
    source: Optional[str] = "all",
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """Retrieve indexed jobs with filtering and dynamic user match score calculation."""
    # Ensure starter jobs exist
    from app.services.job_service import job_service
    await job_service.initialize_default_jobs(db)

    query = db.query(Job)
    if keyword:
        kw = f"%{keyword}%"
        query = query.filter(Job.title.ilike(kw) | Job.description.ilike(kw) | Job.company.ilike(kw))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    if experience and experience.lower() != "all":
        query = query.filter(Job.experience.ilike(f"%{experience}%"))
    if work_mode and work_mode.lower() not in ["all", "any"]:
        query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))

    total = query.count()
    offset = (page - 1) * limit
    jobs = query.order_by(Job.id.desc()).offset(offset).limit(limit).all()

    # User context: get user's primary resume for matching scores and application statuses
    user_resume = None
    applied_dict = {}
    if current_user:
        user_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
        if not user_resume:
            user_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
        
        apps = db.query(Application).filter(Application.user_id == current_user.id).all()
        applied_dict = {a.job_id: a.status for a in apps}

    job_responses = []
    for job in jobs:
        resp = JobResponse.model_validate(job)
        if job.id in applied_dict:
            resp.is_saved = True
            resp.application_status = applied_dict[job.id]

        if user_resume:
            # Check cached match or quick match
            cached = db.query(JobMatch).filter(JobMatch.user_id == current_user.id, JobMatch.job_id == job.id).first()
            if cached:
                resp.user_match_score = cached.match_score
            else:
                from app.services.matching_service import MatchingService
                quick = MatchingService.match_resume_to_job(
                    {"skills": user_resume.skills, "raw_text": user_resume.raw_text, "experience": user_resume.experience, "education": user_resume.education},
                    {"title": job.title, "description": job.description, "skills": job.skills, "experience": job.experience}
                )
                resp.user_match_score = quick["match_score"]
                
        job_responses.append(resp)

    return {
        "jobs": job_responses,
        "total": total,
        "page": page,
        "limit": limit,
        "source_used": source or "all",
        "is_demo": any(j.is_demo for j in jobs)
    }

@router.post("/search", response_model=JobSearchResponse)
async def search_jobs_endpoint(
    request: JobSearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Trigger multi-agent search across live and demo sources."""
    discovered = await orchestrator.discover_jobs(
        db=db,
        keyword=request.keyword,
        location=request.location,
        experience=request.experience,
        work_mode=request.work_mode,
        source=request.source,
        limit=request.limit
    )

    user_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    applied_dict = {a.job_id: a.status for a in apps}

    job_responses = []
    for job in discovered:
        resp = JobResponse.model_validate(job)
        if job.id in applied_dict:
            resp.is_saved = True
            resp.application_status = applied_dict[job.id]

        if user_resume:
            from app.services.matching_service import MatchingService
            quick = MatchingService.match_resume_to_job(
                {"skills": user_resume.skills, "raw_text": user_resume.raw_text, "experience": user_resume.experience, "education": user_resume.education},
                {"title": job.title, "description": job.description, "skills": job.skills, "experience": job.experience}
            )
            resp.user_match_score = quick["match_score"]

        job_responses.append(resp)

    return {
        "jobs": job_responses,
        "total": len(job_responses),
        "page": request.page,
        "limit": request.limit,
        "source_used": request.source or "all",
        "is_demo": any(j.is_demo for j in discovered)
    }

@router.get("/recommended", response_model=List[JobResponse])
async def get_recommended_jobs(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top recommended jobs customized to candidate's skills and preferences."""
    from app.services.job_service import job_service
    await job_service.initialize_default_jobs(db)

    user_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
    if not user_resume:
        user_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()

    all_jobs = db.query(Job).limit(50).all()
    apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    applied_dict = {a.job_id: a.status for a in apps}

    ranked = []
    for job in all_jobs:
        resp = JobResponse.model_validate(job)
        if job.id in applied_dict:
            resp.is_saved = True
            resp.application_status = applied_dict[job.id]

        score = 75.0
        if user_resume:
            from app.services.matching_service import MatchingService
            m = MatchingService.match_resume_to_job(
                {"skills": user_resume.skills, "raw_text": user_resume.raw_text, "experience": user_resume.experience, "education": user_resume.education},
                {"title": job.title, "description": job.description, "skills": job.skills, "experience": job.experience}
            )
            score = m["match_score"]

        resp.user_match_score = score
        ranked.append(resp)

    ranked.sort(key=lambda x: (x.user_match_score or 0), reverse=True)
    return ranked[:limit]

@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int, db: Session = Depends(get_db), current_user: Optional[User] = Depends(get_current_user)):
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    resp = JobResponse.model_validate(job)
    if current_user:
        app_record = db.query(Application).filter(Application.user_id == current_user.id, Application.job_id == job.id).first()
        if app_record:
            resp.is_saved = True
            resp.application_status = app_record.status

        user_resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
        if user_resume:
            from app.services.matching_service import MatchingService
            m = MatchingService.match_resume_to_job(
                {"skills": user_resume.skills, "raw_text": user_resume.raw_text, "experience": user_resume.experience, "education": user_resume.education},
                {"title": job.title, "description": job.description, "skills": job.skills, "experience": job.experience}
            )
            resp.user_match_score = m["match_score"]

    return resp

@router.post("/{job_id}/match", response_model=JobMatchResponse)
async def match_job_endpoint(
    job_id: int,
    resume_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Compute deep match analysis between user's resume and target job."""
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    if resume_id:
        resume = db.query(Resume).filter(Resume.id == resume_id, Resume.user_id == current_user.id).first()
    else:
        resume = db.query(Resume).filter(Resume.user_id == current_user.id, Resume.is_primary == 1).first()
        if not resume:
            resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload a resume first to compute match score."
        )

    resume_data = {
        "skills": resume.skills,
        "raw_text": resume.raw_text,
        "experience": resume.experience,
        "education": resume.education,
        "candidate_name": resume.candidate_name,
    }
    job_data = {
        "title": job.title,
        "company": job.company,
        "skills": job.skills,
        "description": job.description,
        "experience": job.experience,
    }

    match_result = await orchestrator.match_candidate(resume_data, job_data)

    # Persist or update match record
    db_match = db.query(JobMatch).filter(JobMatch.user_id == current_user.id, JobMatch.job_id == job.id).first()
    if not db_match:
        db_match = JobMatch(
            user_id=current_user.id,
            job_id=job.id,
            resume_id=resume.id
        )
        db.add(db_match)

    db_match.match_score = match_result["match_score"]
    db_match.skills_match_score = match_result["skills_match_score"]
    db_match.experience_compatibility = match_result["experience_compatibility"]
    db_match.education_compatibility = match_result["education_compatibility"]
    db_match.keyword_overlap = match_result["keyword_overlap"]
    db_match.matching_skills = match_result["matching_skills"]
    db_match.missing_skills = match_result["missing_skills"]
    db_match.strengths = match_result["strengths"]
    db_match.weaknesses = match_result["weaknesses"]
    db_match.recommendations = match_result["recommendations"]

    db.commit()
    db.refresh(db_match)

    return {
        "job_id": job.id,
        "job_title": job.title,
        "company": job.company,
        "resume_id": resume.id,
        "match_score": db_match.match_score,
        "skills_match_score": db_match.skills_match_score,
        "experience_compatibility": db_match.experience_compatibility,
        "education_compatibility": db_match.education_compatibility,
        "keyword_overlap": db_match.keyword_overlap,
        "matching_skills": db_match.matching_skills,
        "missing_skills": db_match.missing_skills,
        "strengths": db_match.strengths,
        "weaknesses": db_match.weaknesses,
        "recommendations": db_match.recommendations,
        "created_at": db_match.created_at
    }
