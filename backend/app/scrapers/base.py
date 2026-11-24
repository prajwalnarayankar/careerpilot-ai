from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional

class JobSource(ABC):
    """Abstract base class for all job source providers."""
    
    def __init__(self, name: str):
        self.name = name

    @abstractmethod
    async def fetch_jobs(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Fetch jobs matching criteria.
        
        Returns list of dicts:
        {
            "title": str,
            "company": str,
            "location": str,
            "work_mode": str, # "Remote", "Hybrid", "On-site"
            "experience": str, # "Fresher / 0-2 years", "3-5 years", "Senior / 5+ years"
            "salary": Optional[str],
            "description": str,
            "skills": List[str],
            "job_url": Optional[str],
            "source": str,
            "is_demo": bool,
            "external_id": str
        }
        """
        pass
