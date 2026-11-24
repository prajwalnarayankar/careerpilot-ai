from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.resumes import router as resumes_router
from app.routers.jobs import router as jobs_router
from app.routers.applications import router as applications_router
from app.routers.cover_letter import router as cover_letter_router
from app.routers.interview import router as interview_router
from app.routers.dashboard import router as dashboard_router
from app.routers.insights import router as insights_router

__all__ = [
    "auth_router",
    "users_router",
    "resumes_router",
    "jobs_router",
    "applications_router",
    "cover_letter_router",
    "interview_router",
    "dashboard_router",
    "insights_router",
]
