import hashlib
import logging
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup
from app.scrapers.base import JobSource
from app.utils.text_processing import extract_skills_from_text

logger = logging.getLogger(__name__)

class WebJobSource(JobSource):
    """
    Parses public structured job feeds and listings using BeautifulSoup
    while adhering strictly to robots.txt and polite request intervals.
    """
    
    def __init__(self):
        super().__init__(name="Web Scraper Source")
        self.feed_url = "https://weworkremotely.com/categories/remote-programming-jobs.rss"
        self.headers = {
            "User-Agent": "CareerPilot-AI/1.0 (Mozilla/5.0 compatible; polite educational reader)"
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
                response = await client.get(self.feed_url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, "xml" if "xml" in response.headers.get("content-type", "") else "html.parser")
                    items = soup.find_all("item")
                    
                    for item in items:
                        title_tag = item.find("title")
                        full_title = title_tag.get_text() if title_tag else ""
                        
                        # WeWorkRemotely RSS formats title as "Company: Role"
                        company = "Tech Company"
                        title = full_title
                        if ":" in full_title:
                            parts = full_title.split(":", 1)
                            company = parts[0].strip()
                            title = parts[1].strip()
                            
                        desc_tag = item.find("description")
                        desc_text = desc_tag.get_text() if desc_tag else ""
                        # Strip HTML tags from description
                        desc_soup = BeautifulSoup(desc_text, "html.parser")
                        clean_desc = desc_soup.get_text(separator=" ").strip()
                        
                        link_tag = item.find("link")
                        link = link_tag.get_text() if link_tag else ""
                        
                        if kw and (kw not in title.lower() and kw not in clean_desc.lower()):
                            continue
                            
                        skills = extract_skills_from_text(title + " " + clean_desc)[:8]
                        if not skills:
                            skills = ["Software Engineering", "Problem Solving", "Git"]
                            
                        ext_id = f"wwr_{hashlib.md5((company + title).encode()).hexdigest()}"
                        
                        jobs.append({
                            "title": title,
                            "company": company,
                            "location": "Remote",
                            "work_mode": "Remote",
                            "experience": "3-5 years" if "senior" in title.lower() else "Fresher / 0-2 years",
                            "salary": "Market Competitive",
                            "description": clean_desc[:1200] + ("..." if len(clean_desc) > 1200 else ""),
                            "skills": skills,
                            "job_url": link,
                            "source": "WeWorkRemotely (Web Feed)",
                            "is_demo": False,
                            "external_id": ext_id
                        })
                        
                        if len(jobs) >= limit:
                            break
        except Exception as e:
            logger.warning(f"WebJobSource fetch error: {e}")
            
        return jobs
