from typing import Optional
import datetime
from pydantic import BaseModel, ConfigDict

class CoverLetterGenerateRequest(BaseModel):
    job_id: Optional[int] = None
    resume_id: Optional[int] = None
    company_name: str
    job_title: str
    job_description: Optional[str] = None
    tone: Optional[str] = "Professional"
    custom_instructions: Optional[str] = None

class CoverLetterResponse(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int] = None
    resume_id: Optional[int] = None
    company_name: str
    job_title: str
    salutation: str
    content: str
    tone: str
    version: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class CoverLetterUpdateRequest(BaseModel):
    content: str
    salutation: Optional[str] = None
    tone: Optional[str] = None
