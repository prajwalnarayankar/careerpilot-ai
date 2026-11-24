import hashlib
import logging
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.job import Job
from app.scrapers.base import JobSource
from app.scrapers.api_source import APIJobSource
from app.scrapers.web_source import WebJobSource
from app.scrapers.selenium_source import SeleniumJobSource
from app.scrapers.demo_source import DemoJobSource

logger = logging.getLogger(__name__)

class JobService:
    """Manages multi-source job ingestion, deduplication, and database querying."""

    def __init__(self):
        self.sources: Dict[str, JobSource] = {
            "demo": DemoJobSource(),
            "api": APIJobSource(),
            "web": WebJobSource(),
            "selenium": SeleniumJobSource(),
        }

    async def initialize_default_jobs(self, db: Session):
        """Seed initial jobs from DemoJobSource if the DB is empty."""
        count = db.query(Job).count()
        if count == 0:
            logger.info("Initializing database with starter job catalog...")
            demo_jobs = await self.sources["demo"].fetch_jobs(limit=50)
            for j in demo_jobs:
                db_job = Job(
                    title=j["title"],
                    company=j["company"],
                    location=j["location"],
                    work_mode=j.get("work_mode", "On-site"),
                    experience=j.get("experience", "0-2 years"),
                    salary=j.get("salary"),
                    description=j["description"],
                    skills=j.get("skills", []),
                    job_url=j.get("job_url"),
                    source=j.get("source", "demo"),
                    is_demo=j.get("is_demo", True),
                    external_id=j.get("external_id")
                )
                db.add(db_job)
            db.commit()

    async def search_and_sync(
        self,
        db: Session,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        source: Optional[str] = "all",
        limit: int = 20
    ) -> List[Job]:
        """Fetch fresh jobs from configured sources, deduplicate, and persist to SQLite."""
        selected_sources = []
        if source == "all" or not source:
            selected_sources = list(self.sources.values())
        elif source in self.sources:
            selected_sources = [self.sources[source]]
        else:
            selected_sources = [self.sources["demo"]]

        fetched_raw_jobs = []
        for src in selected_sources:
            try:
                jobs = await src.fetch_jobs(
                    keyword=keyword,
                    location=location,
                    experience=experience,
                    work_mode=work_mode,
                    limit=limit
                )
                fetched_raw_jobs.extend(jobs)
            except Exception as e:
                logger.warning(f"Error fetching from source {src.name}: {e}")

        # Deduplicate and store into DB
        for j in fetched_raw_jobs:
            ext_id = j.get("external_id")
            if not ext_id:
                raw_hash = f"{j['company']}_{j['title']}".encode('utf-8')
                ext_id = hashlib.md5(raw_hash).hexdigest()

            existing = db.query(Job).filter(Job.external_id == ext_id).first()
            if not existing:
                db_job = Job(
                    title=j["title"],
                    company=j["company"],
                    location=j["location"],
                    work_mode=j.get("work_mode", "On-site"),
                    experience=j.get("experience", "0-2 years"),
                    salary=j.get("salary"),
                    description=j["description"],
                    skills=j.get("skills", []),
                    job_url=j.get("job_url"),
                    source=j.get("source", "Scraped"),
                    is_demo=j.get("is_demo", False),
                    external_id=ext_id
                )
                db.add(db_job)
        db.commit()

        # Query database with the filters applied
        query = db.query(Job)
        if keyword:
            kw = f"%{keyword}%"
            query = query.filter(Job.title.ilike(kw) | Job.description.ilike(kw) | Job.company.ilike(kw))
        if location:
            query = query.filter(Job.location.ilike(f"%{location}%"))
        if experience:
            query = query.filter(Job.experience.ilike(f"%{experience}%"))
        if work_mode and work_mode.lower() != "any":
            query = query.filter(Job.work_mode.ilike(f"%{work_mode}%"))

        return query.order_by(Job.id.desc()).limit(limit).all()

    def get_job_by_id(self, db: Session, job_id: int) -> Optional[Job]:
        return db.query(Job).filter(Job.id == job_id).first()

job_service = JobService()
