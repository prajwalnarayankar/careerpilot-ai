from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.schemas.job import JobResponse

class ChartDataPoint(BaseModel):
    name: str
    value: float
    count: Optional[int] = None
    color: Optional[str] = None

class DashboardStats(BaseModel):
    total_jobs_found: int
    saved_jobs_count: int
    applications_count: int
    interviews_count: int
    average_match_score: float
    latest_ats_score: Optional[float] = None
    
    # Status breakdown
    applications_by_status: List[ChartDataPoint] = []
    jobs_by_category: List[ChartDataPoint] = []
    match_score_distribution: List[ChartDataPoint] = []
    application_activity: List[ChartDataPoint] = []
    
    # Recommendations
    recommended_jobs: List[JobResponse] = []
    skills_to_improve: List[str] = []
