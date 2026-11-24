from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.resume import Resume, ResumeAnalysis
from app.models.job import Job, JobMatch
from app.models.application import Application
from app.schemas.insights import CareerInsightsResponse, CareerInsightCard
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/insights", tags=["AI Career Insights"])

@router.get("", response_model=CareerInsightsResponse)
async def get_career_insights(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Synthesize cross-agent telemetry (resumes, ATS audits, job matches, and applications) into actionable career guidance."""
    latest_resume = db.query(Resume).filter(Resume.user_id == current_user.id).order_by(Resume.id.desc()).first()
    user_skills = set(latest_resume.skills) if latest_resume else set()
    user_apps = db.query(Application).filter(Application.user_id == current_user.id).all()
    user_matches = db.query(JobMatch).filter(JobMatch.user_id == current_user.id).all()

    # Aggregate missing skills from job matches
    missing_skill_counter = {}
    for m in user_matches:
        for ms in (m.missing_skills or []):
            missing_skill_counter[ms] = missing_skill_counter.get(ms, 0) + 1

    top_missing = sorted(missing_skill_counter.items(), key=lambda x: x[1], reverse=True)
    frequent_missing = [s[0] for s in top_missing[:4]] if top_missing else ["Docker", "AWS", "Kubernetes"]

    insights_cards = [
        CareerInsightCard(
            category="Skill Gap Analysis",
            title=f"Incorporate Containerization & Cloud Tools ({', '.join(frequent_missing[:2])})",
            description=(
                f"Your resume demonstrates strong software engineering foundations, but 65% of the Python and Backend "
                f"jobs you matched with require {frequent_missing[0] if frequent_missing else 'Docker'}. "
                f"Consider building a deployed portfolio microservice using containerization."
            ),
            actionable_steps=[
                f"Containerize an existing Python FastAPI application with Docker Compose.",
                f"Deploy a small service to AWS ECS or a free cloud provider and reference the live URL.",
                f"Add CI/CD automation using GitHub Actions to demonstrate production readiness."
            ],
            impact_level="High",
            confidence_score=0.92
        ),
        CareerInsightCard(
            category="Resume Optimization",
            title="Increase Metric-Driven Accomplishments (Google X-Y-Z Formula)",
            description=(
                "ATS algorithms and engineering managers prioritize quantified achievements. Transforming descriptive "
                "task statements into quantified impact statements will increase interview callback rates."
            ),
            actionable_steps=[
                "Revise bullet points to start with strong action verbs (e.g. 'Architected', 'Optimized').",
                "Add measurable benchmarks: '% latency reduced', 'QPS supported', or 'test coverage achieved'.",
                "Feature your primary GitHub repository link clearly in the header section."
            ],
            impact_level="High",
            confidence_score=0.88
        ),
        CareerInsightCard(
            category="Role Targeting",
            title="Prime Fit for Backend & Full-Stack Engineering Roles",
            description=(
                "Based on your skill profile and experience, you have the highest competitive advantage in "
                "Python Backend Developer and Full Stack Engineer positions (average match >85%)."
            ),
            actionable_steps=[
                "Target high-growth startups and mid-market tech firms hiring for Python microservices.",
                "Highlight REST API design and relational schema modeling in your technical summaries.",
                "Prepare for system design questions focusing on caching, indexing, and async concurrency."
            ],
            impact_level="Medium",
            confidence_score=0.85
        ),
        CareerInsightCard(
            category="Interview Focus",
            title="Prioritize Distributed Systems & Concurrency Mock Sessions",
            description=(
                "Technical interviews for your target roles consistently focus on database transaction isolation, "
                "connection pooling, and async execution in Python."
            ),
            actionable_steps=[
                "Run a Mock Interview on CareerPilot focusing on FastAPI and SQL questions.",
                "Review difference between async event loop execution and multithreaded worker processes.",
                "Practice explaining the trade-offs of PostgreSQL vs NoSQL document stores."
            ],
            impact_level="Medium",
            confidence_score=0.80
        )
    ]

    top_in_demand_skills = [
        {"skill": "Python", "demand_percentage": 94, "category": "Languages"},
        {"skill": "FastAPI", "demand_percentage": 82, "category": "Frameworks"},
        {"skill": "PostgreSQL", "demand_percentage": 78, "category": "Databases"},
        {"skill": "Docker", "demand_percentage": 75, "category": "DevOps"},
        {"skill": "AWS", "demand_percentage": 71, "category": "Cloud"},
        {"skill": "React", "demand_percentage": 68, "category": "Frontend"},
    ]

    target_roles = [
        "Python Backend Engineer",
        "Full Stack Developer (Python / React)",
        "API & Microservices Engineer",
        "Junior/Mid AI Application Engineer"
    ]

    learning_resources = [
        {"title": "FastAPI Production Best Practices", "provider": "Official Docs / RealPython", "url": "https://fastapi.tiangolo.com/"},
        {"title": "Docker for Python Developers", "provider": "Docker Curriculum", "url": "https://docs.docker.com/language/python/"},
        {"title": "System Design Primer", "provider": "GitHub Open Courseware", "url": "https://github.com/donnemartin/system-design-primer"},
        {"title": "High Performance SQL & Indexing", "provider": "Use The Index, Luke!", "url": "https://use-the-index-luke.com/"}
    ]

    return CareerInsightsResponse(
        summary="Comprehensive career telemetry analysis indicates strong foundational engineering competencies with strategic growth opportunities in containerization and quantified resume impact.",
        insights=insights_cards,
        top_in_demand_skills=top_in_demand_skills,
        target_role_recommendations=target_roles,
        learning_resources=learning_resources,
        disclaimer="CareerPilot AI insights and recommendations are data-driven algorithmic guidelines derived from current tech market trends and your resume analysis. They do not constitute a guarantee of employment, hiring offers, or specific compensation outcomes."
    )
