from typing import List, Dict, Any
from pydantic import BaseModel

class CareerInsightCard(BaseModel):
    category: str  # "Skill Gap", "Role Target", "Resume Optimization", "Interview Focus"
    title: str
    description: str
    actionable_steps: List[str] = []
    impact_level: str = "High"  # High, Medium, Low
    confidence_score: float = 0.9

class CareerInsightsResponse(BaseModel):
    summary: str
    insights: List[CareerInsightCard] = []
    top_in_demand_skills: List[Dict[str, Any]] = []
    target_role_recommendations: List[str] = []
    learning_resources: List[Dict[str, str]] = []
    disclaimer: str = "Recommendations are data-driven guidance based on your resume and market analysis. They do not constitute guaranteed career or hiring outcomes."
