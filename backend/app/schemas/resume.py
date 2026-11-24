from typing import Optional, List, Dict, Any
import datetime
from pydantic import BaseModel, ConfigDict

class ResumeAnalysisResponse(BaseModel):
    id: int
    resume_id: int
    target_role: Optional[str] = None
    target_job_id: Optional[int] = None
    ats_score: float
    keyword_match_score: float
    skills_match_score: float
    formatting_score: float
    experience_score: float
    education_score: float
    formatting_problems: List[str] = []
    missing_sections: List[str] = []
    measurable_achievements: List[str] = []
    extracted_keywords: List[str] = []
    missing_keywords: List[str] = []
    recommendations: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class ResumeResponse(BaseModel):
    id: int
    user_id: int
    filename: str
    original_filename: str
    file_type: str
    candidate_name: Optional[str] = None
    contact_info: Dict[str, Any] = {}
    summary: Optional[str] = None
    education: List[Dict[str, Any]] = []
    experience: List[Dict[str, Any]] = []
    projects: List[Dict[str, Any]] = []
    skills: List[str] = []
    certifications: List[str] = []
    is_primary: int
    created_at: datetime.datetime
    updated_at: datetime.datetime
    latest_analysis: Optional[ResumeAnalysisResponse] = None

    model_config = ConfigDict(from_attributes=True)

class AnalyzeResumeRequest(BaseModel):
    target_role: Optional[str] = None
    target_job_id: Optional[int] = None
    job_description: Optional[str] = None

class ResumeOptimizationRequest(BaseModel):
    target_job_id: Optional[int] = None
    target_role: Optional[str] = None
    job_description: Optional[str] = None

class BulletPointImprovement(BaseModel):
    original: str
    improved: str
    impact_factor: str
    skills_highlighted: List[str] = []

class ResumeOptimizationResponse(BaseModel):
    resume_id: int
    target_role: Optional[str] = None
    optimized_summary: str
    improved_bullet_points: List[BulletPointImprovement] = []
    recommended_skills: List[str] = []
    keyword_recommendations: List[str] = []
    project_improvements: List[Dict[str, Any]] = []
    general_tips: List[str] = []
