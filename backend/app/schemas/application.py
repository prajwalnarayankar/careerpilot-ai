from typing import Optional, List
import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.job import JobResponse

class ApplicationBase(BaseModel):
    job_id: int
    resume_id: Optional[int] = None
    status: str = "Saved"
    notes: Optional[str] = None
    salary_offered: Optional[str] = None
    applied_date: Optional[datetime.datetime] = None
    follow_up_date: Optional[datetime.datetime] = None
    interview_date: Optional[datetime.datetime] = None

class ApplicationCreate(ApplicationBase):
    pass

class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    salary_offered: Optional[str] = None
    applied_date: Optional[datetime.datetime] = None
    follow_up_date: Optional[datetime.datetime] = None
    interview_date: Optional[datetime.datetime] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    resume_id: Optional[int] = None
    status: str
    notes: Optional[str] = None
    salary_offered: Optional[str] = None
    applied_date: Optional[datetime.datetime] = None
    follow_up_date: Optional[datetime.datetime] = None
    interview_date: Optional[datetime.datetime] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)

class KanbanColumn(BaseModel):
    status: str
    count: int
    applications: List[ApplicationResponse]
