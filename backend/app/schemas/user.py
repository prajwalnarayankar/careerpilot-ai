from typing import Optional, List, Dict, Any
import datetime
from pydantic import BaseModel, EmailStr, ConfigDict

class ProfileBase(BaseModel):
    headline: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    preferred_job_role: Optional[str] = None
    preferred_location: Optional[str] = None
    experience_level: Optional[str] = "Fresher / 0-2 years"
    preferred_work_mode: Optional[str] = "Remote / Hybrid / On-site"
    skills: List[str] = []
    education: List[Dict[str, Any]] = []
    bio: Optional[str] = None
    target_salary: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True

class UserResponse(UserBase):
    id: int
    created_at: datetime.datetime
    profile: Optional[ProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)
