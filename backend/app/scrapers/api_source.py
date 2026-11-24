import hashlib
import logging
from typing import List, Dict, Any, Optional
import httpx
from app.scrapers.base import JobSource
from app.utils.text_processing import extract_skills_from_text

logger = logging.getLogger(__name__)

class APIJobSource(JobSource):
    """
    Connects to real live public job APIs (e.g. RemoteOK, Jobicy)
    respecting rate limits and public API policies.
    """
    
    def __init__(self):
        super().__init__(name="Live API Source")
        self.remoteok_url = "https://remoteok.com/api"
        self.headers = {
            "User-Agent": "CareerPilot-AI-Career-Assistant/1.0 (academic/job-search platform)"
        }

    async def fetch_jobs(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        jobs = []
        kw = keyword.lower() if keyword else ""
        
        try:
            async with httpx.AsyncClient(headers=self.headers, timeout=5.0, follow_redirects=True) as client:
                response = await client.get(self.remoteok_url)
                if response.status_code == 200:
                    data = response.json()
                    # RemoteOK returns a legal notice object as index 0
                    entries = [item for item in data if isinstance(item, dict) and "position" in item]
                    
                    for item in entries:
                        title = item.get("position", "")
                        company = item.get("company", "")
                        description = item.get("description", "")
                        tags = item.get("tags", [])
                        loc = item.get("location", "Remote")
                        url = item.get("url", "")
                        
                        # Filter by keyword if provided
                        if kw:
                            tag_match = any(kw in str(t).lower() for t in tags)
                            text_match = kw in title.lower() or kw in description.lower()
                            if not (tag_match or text_match):
                                continue
                                
                        # Extract skills from tags + description
                        skills = [t.title() for t in tags[:8]]
                        if len(skills) < 3:
                            extracted = extract_skills_from_text(description)
                            skills = list(set(skills + extracted[:5]))

                        external_id = f"remoteok_{item.get('id', hashlib.md5(f'{company}_{title}'.encode()).hexdigest())}"

                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": loc or "Remote",
                            "work_mode": "Remote",
                            "experience": "Fresher / 0-2 years" if "junior" in title.lower() else "3-5 years",
                            "salary": item.get("salary", "Market Competitive"),
                            "description": description[:1000] + "..." if len(description) > 1000 else description,
                            "skills": skills,
                            "job_url": url,
                            "source": "RemoteOK (Live API)",
                            "is_demo": False,
                            "external_id": external_id
                        })
                        
                        if len(jobs) >= limit:
                            break
        except Exception as e:
            logger.warning(f"Live APIJobSource network call failed or timed out: {e}")
            
        return jobs
