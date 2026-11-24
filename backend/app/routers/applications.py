import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.application import Application
from app.models.job import Job
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationResponse, KanbanColumn
)
from app.schemas.job import JobResponse
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/applications", tags=["Application Tracker (Kanban)"])

VALID_STATUSES = ["Saved", "Applied", "Assessment", "Interview", "Offer", "Rejected"]

@router.get("", response_model=List[ApplicationResponse])
def get_applications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.updated_at.desc()).all()
    results = []
    for a in apps:
        resp = ApplicationResponse.model_validate(a)
        if a.job:
            resp.job = JobResponse.model_validate(a.job)
        results.append(resp)
    return results

@router.get("/kanban", response_model=List[KanbanColumn])
def get_kanban_board(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    apps = db.query(Application).filter(Application.user_id == current_user.id).order_by(Application.updated_at.desc()).all()
    
    # Group by valid status
    grouped = {st: [] for st in VALID_STATUSES}
    for a in apps:
        st = a.status if a.status in grouped else "Saved"
        resp = ApplicationResponse.model_validate(a)
        if a.job:
            resp.job = JobResponse.model_validate(a.job)
        grouped[st].append(resp)

    columns = []
    for st in VALID_STATUSES:
        columns.append(KanbanColumn(
            status=st,
            count=len(grouped[st]),
            applications=grouped[st]
        ))
    return columns

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    app_in: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    job = db.query(Job).filter(Job.id == app_in.job_id).first()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    # Check if application already exists for this job
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.job_id == app_in.job_id
    ).first()
    if existing:
        # Update existing status
        existing.status = app_in.status
        if app_in.notes is not None:
            existing.notes = app_in.notes
        db.commit()
        db.refresh(existing)
        resp = ApplicationResponse.model_validate(existing)
        resp.job = JobResponse.model_validate(job)
        return resp

    db_app = Application(
        user_id=current_user.id,
        job_id=app_in.job_id,
        resume_id=app_in.resume_id,
        status=app_in.status if app_in.status in VALID_STATUSES else "Saved",
        notes=app_in.notes,
        salary_offered=app_in.salary_offered,
        applied_date=app_in.applied_date or (datetime.datetime.utcnow() if app_in.status != "Saved" else None),
        follow_up_date=app_in.follow_up_date,
        interview_date=app_in.interview_date
    )
    db.add(db_app)
    db.commit()
    db.refresh(db_app)

    resp = ApplicationResponse.model_validate(db_app)
    resp.job = JobResponse.model_validate(job)
    return resp

@router.put("/{app_id}", response_model=ApplicationResponse)
def update_application(
    app_id: int,
    app_in: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found.")

    if app_in.status is not None:
        if app_in.status not in VALID_STATUSES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status '{app_in.status}'.")
        app.status = app_in.status
        if app.status == "Applied" and not app.applied_date:
            app.applied_date = datetime.datetime.utcnow()

    if app_in.notes is not None:
        app.notes = app_in.notes
    if app_in.salary_offered is not None:
        app.salary_offered = app_in.salary_offered
    if app_in.applied_date is not None:
        app.applied_date = app_in.applied_date
    if app_in.follow_up_date is not None:
        app.follow_up_date = app_in.follow_up_date
    if app_in.interview_date is not None:
        app.interview_date = app_in.interview_date

    app.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(app)

    resp = ApplicationResponse.model_validate(app)
    if app.job:
        resp.job = JobResponse.model_validate(app.job)
    return resp

@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    app = db.query(Application).filter(Application.id == app_id, Application.user_id == current_user.id).first()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application record not found.")
    db.delete(app)
    db.commit()
    return None
