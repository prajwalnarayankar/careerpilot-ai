import hashlib
from typing import List, Dict, Any, Optional
from app.scrapers.base import JobSource

SAMPLE_JOBS_DATABASE = [
    {
        "title": "Junior Python Developer",
        "company": "DataSphere Analytics",
        "location": "Bangalore",
        "work_mode": "Hybrid",
        "experience": "Fresher / 0-2 years",
        "salary": "₹6,00,000 - ₹9,00,000",
        "description": "We are seeking an enthusiastic Junior Python Developer to build data ingestion pipelines, RESTful backend services with FastAPI, and automated data validation scripts. You will collaborate with senior engineers to deliver scalable data services.",
        "skills": ["Python", "FastAPI", "SQL", "PostgreSQL", "Git", "Docker", "REST API"],
        "job_url": "https://example.com/jobs/datasphere-junior-python",
    },
    {
        "title": "Python Developer",
        "company": "CloudScale Systems",
        "location": "Bangalore",
        "work_mode": "Remote",
        "experience": "Fresher / 0-2 years",
        "salary": "₹8,00,000 - ₹12,00,000",
        "description": "Looking for a Python Developer proficient in Python, SQL, and FastAPI. The ideal candidate will design microservices, optimize database queries, write comprehensive unit tests, and integrate third-party APIs.",
        "skills": ["Python", "FastAPI", "SQL", "Docker", "AWS", "PyTest", "Redis"],
        "job_url": "https://example.com/jobs/cloudscale-python-dev",
    },
    {
        "title": "Backend Software Engineer (Python/Django)",
        "company": "FinTech Nexus",
        "location": "Hyderabad",
        "work_mode": "Hybrid",
        "experience": "3-5 years",
        "salary": "₹14,00,000 - ₹20,00,000",
        "description": "FinTech Nexus is hiring a Backend Engineer to scale our payment processing engine. You will write high-throughput Python code, handle distributed transactions, manage PostgreSQL databases, and deploy onto Kubernetes clusters.",
        "skills": ["Python", "Django", "PostgreSQL", "Redis", "Celery", "Docker", "Kubernetes", "AWS"],
        "job_url": "https://example.com/jobs/fintech-nexus-backend",
    },
    {
        "title": "Full Stack Engineer (React & Python)",
        "company": "InnovateAI Labs",
        "location": "Pune",
        "work_mode": "Remote",
        "experience": "3-5 years",
        "salary": "₹15,00,000 - ₹22,00,000",
        "description": "Develop full-stack web applications using React, TypeScript, and FastAPI. Build clean UI dashboards, interactive charts, secure JWT-based authentication, and scalable background task workers.",
        "skills": ["Python", "FastAPI", "React", "TypeScript", "Tailwind CSS", "PostgreSQL", "Docker", "CI/CD"],
        "job_url": "https://example.com/jobs/innovateai-fullstack",
    },
    {
        "title": "AI / ML Engineer",
        "company": "NeuroTech Solutions",
        "location": "Bangalore",
        "work_mode": "On-site",
        "experience": "Fresher / 0-2 years",
        "salary": "₹10,00,000 - ₹16,00,000",
        "description": "Join our AI research and deployment team. You will train and fine-tune NLP models, build retrieval-augmented generation (RAG) pipelines, implement vector search with ChromaDB, and serve models via FastAPI.",
        "skills": ["Python", "PyTorch", "HuggingFace", "LangChain", "CrewAI", "FastAPI", "Vector Databases", "NLP"],
        "job_url": "https://example.com/jobs/neurotech-ai-ml",
    },
    {
        "title": "DevOps Engineer",
        "company": "TerraCloud Infrastructure",
        "location": "Hyderabad",
        "work_mode": "Remote",
        "experience": "3-5 years",
        "salary": "₹16,00,000 - ₹24,00,000",
        "description": "Manage multi-region AWS cloud infrastructure, configure Terraform IaC, maintain Kubernetes production clusters, and build automated CI/CD pipelines with GitHub Actions.",
        "skills": ["AWS", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD", "GitHub Actions", "Python"],
        "job_url": "https://example.com/jobs/terracloud-devops",
    },
    {
        "title": "Frontend Developer (React / Next.js)",
        "company": "Pulse Digital",
        "location": "Bangalore",
        "work_mode": "Hybrid",
        "experience": "Fresher / 0-2 years",
        "salary": "₹7,00,000 - ₹11,00,000",
        "description": "Create responsive, accessible user interfaces using React, Next.js, and Tailwind CSS. Implement state management, write client-side tests, and optimize Core Web Vitals.",
        "skills": ["React", "JavaScript", "TypeScript", "Next.js", "Tailwind CSS", "HTML5", "CSS3", "Git"],
        "job_url": "https://example.com/jobs/pulse-frontend-dev",
    },
    {
        "title": "Senior Data Engineer",
        "company": "Enterprise DataWorks",
        "location": "Mumbai",
        "work_mode": "On-site",
        "experience": "Senior / 5+ years",
        "salary": "₹28,00,000 - ₹38,00,000",
        "description": "Architect and maintain real-time and batch streaming ETL pipelines using Spark, Airflow, Snowflake, and Python. Lead data governance, schema validation, and optimize query latency.",
        "skills": ["Python", "SQL", "Spark", "Snowflake", "AWS", "Kafka", "Docker", "Airflow"],
        "job_url": "https://example.com/jobs/dataworks-senior-data-eng",
    },
    {
        "title": "Associate QA Automation Engineer",
        "company": "QualityFirst Systems",
        "location": "Chennai",
        "work_mode": "Hybrid",
        "experience": "Fresher / 0-2 years",
        "salary": "₹5,50,000 - ₹8,00,000",
        "description": "Design end-to-end automation test suites using Python, PyTest, and Selenium. Execute regression testing, test RESTful endpoints, and report issues with Jira.",
        "skills": ["Python", "Selenium", "PyTest", "REST API", "Git", "Jira", "CI/CD"],
        "job_url": "https://example.com/jobs/qualityfirst-qa-engineer",
    },
    {
        "title": "Lead Software Architect",
        "company": "Apex Global Cloud",
        "location": "Bangalore",
        "work_mode": "Hybrid",
        "experience": "Senior / 5+ years",
        "salary": "₹35,00,000 - ₹50,00,000",
        "description": "Define enterprise cloud software architecture, mentor engineering squads, conduct system design reviews, and guide microservices transitions for enterprise scale.",
        "skills": ["System Design", "Microservices", "Python", "Go", "Kubernetes", "AWS", "PostgreSQL", "Redis"],
        "job_url": "https://example.com/jobs/apex-software-architect",
    },
    {
        "title": "Machine Learning Research Engineer",
        "company": "DeepCognition AI",
        "location": "San Francisco / Remote",
        "work_mode": "Remote",
        "experience": "3-5 years",
        "salary": "$140,000 - $180,000",
        "description": "Develop state-of-the-art agentic workflows, autonomous LLM agents, and multi-modal embedding spaces. Collaborate with cross-functional AI researchers to publish and deploy models.",
        "skills": ["Python", "PyTorch", "LLM", "CrewAI", "LangChain", "Transformers", "Docker", "GCP"],
        "job_url": "https://example.com/jobs/deepcognition-ml-research",
    },
    {
        "title": "Full Stack Python/Vue Developer",
        "company": "SaaS Matrix",
        "location": "Delhi NCR",
        "work_mode": "Remote",
        "experience": "Fresher / 0-2 years",
        "salary": "₹6,50,000 - ₹10,00,000",
        "description": "Build modern B2B SaaS portals using Vue 3 and FastAPI. Implement authentication, Stripe billing integrations, and automated background jobs.",
        "skills": ["Python", "FastAPI", "Vue", "JavaScript", "PostgreSQL", "Tailwind CSS", "Git"],
        "job_url": "https://example.com/jobs/saasmatrix-python-vue",
    }
]

class DemoJobSource(JobSource):
    """Provides high-quality realistic job postings clearly tagged as Demo Data."""
    
    def __init__(self):
        super().__init__(name="Demo Source")

    async def fetch_jobs(
        self,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        results = []
        kw = keyword.lower() if keyword else ""
        loc = location.lower() if location else ""
        exp = experience.lower() if experience else ""
        wm = work_mode.lower() if work_mode else ""
        
        for job in SAMPLE_JOBS_DATABASE:
            # Check keyword match across title, description, skills
            if kw:
                title_match = kw in job["title"].lower()
                desc_match = kw in job["description"].lower()
                skill_match = any(kw in s.lower() for s in job["skills"])
                if not (title_match or desc_match or skill_match):
                    continue
                    
            # Check location match
            if loc and loc not in job["location"].lower():
                if not (loc == "remote" and job["work_mode"].lower() == "remote"):
                    continue
                    
            # Check experience match
            if exp and exp not in job["experience"].lower():
                continue
                
            # Check work mode match
            if wm and wm != "any" and wm not in job["work_mode"].lower():
                continue
                
            job_copy = job.copy()
            job_copy["source"] = "Demo Data (Realistic Sample)"
            job_copy["is_demo"] = True
            
            # Deterministic unique external id based on company and title
            key = f"demo_{job['company']}_{job['title']}".encode('utf-8')
            job_copy["external_id"] = hashlib.md5(key).hexdigest()
            
            results.append(job_copy)
            if len(results) >= limit:
                break
                
        return results
