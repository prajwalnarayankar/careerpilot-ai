import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.services.job_service import job_service

logger = logging.getLogger(__name__)

class JobDiscoveryAgent:
    """
    CrewAI-compatible Job Discovery Agent.
    Discovers, standardizes, filters, deduplicates, and stores employment opportunities.
    """
    role = "Senior Job Market Research Analyst"
    goal = "Discover and curate verified job postings matching candidate criteria across multiple sources."
    backstory = (
        "An elite talent acquisition scout with exhaustive knowledge of tech hiring portals, "
        "API feeds, and developer boards. Specializes in indexing and categorizing job listings."
    )

    def __init__(self):
        pass

    async def run(
        self,
        db: Session,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        source: Optional[str] = "all",
        limit: int = 20
    ) -> List[Any]:
        logger.info(f"JobDiscoveryAgent executing search for: {keyword} in {location}")
        # Search, deduplicate, and persist
        jobs = await job_service.search_and_sync(
            db=db,
            keyword=keyword,
            location=location,
            experience=experience,
            work_mode=work_mode,
            source=source,
            limit=limit
        )
        return jobs
