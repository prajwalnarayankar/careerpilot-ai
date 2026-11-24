from typing import Optional, List
import datetime
from pydantic import BaseModel, ConfigDict

class JobBase(BaseModel):
    title: str
    company: str
    location: str
    work_mode: str = "On-site"
    experience: str = "0-2 years"
    salary: Optional[str] = None
    description: str
    skills: List[str] = []
    job_url: Optional[str] = None
    source: str = "demo"
    is_demo: bool = False

class JobCreate(JobBase):
    external_id: Optional[str] = None

class JobResponse(JobBase):
    id: int
    external_id: Optional[str] = None
    created_at: datetime.datetime
    user_match_score: Optional[float] = None
    is_saved: Optional[bool] = False
    application_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class JobSearchRequest(BaseModel):
    keyword: Optional[str] = None
    location: Optional[str] = None
    experience: Optional[str] = None
    work_mode: Optional[str] = None
    skills: Optional[List[str]] = None
    source: Optional[str] = "all"
    page: int = 1
    limit: int = 20

class JobSearchResponse(BaseModel):
    jobs: List[JobResponse]
    total: int
    page: int
    limit: int
    source_used: str
    is_demo: bool

class JobMatchResponse(BaseModel):
    job_id: int
    job_title: str
    company: str
    resume_id: Optional[int] = None
    match_score: float
    skills_match_score: float
    experience_compatibility: str
    education_compatibility: str
    keyword_overlap: float
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    recommendations: List[str] = []
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
