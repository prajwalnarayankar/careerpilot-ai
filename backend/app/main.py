import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.config import settings
from app.database import engine, Base, SessionLocal
from app.models import *  # Ensure all models are registered
from app.routers import (
    auth_router,
    users_router,
    resumes_router,
    jobs_router,
    applications_router,
    cover_letter_router,
    interview_router,
    dashboard_router,
    insights_router,
)
from app.services.job_service import job_service

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("careerpilot")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create tables and initialize demo jobs
    logger.info("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    # Initialize starter jobs
    db = SessionLocal()
    try:
        await job_service.initialize_default_jobs(db)
    except Exception as e:
        logger.warning(f"Default jobs initialization notice: {e}")
    finally:
        db.close()
        
    logger.info("CareerPilot AI Backend is ready and listening.")
    yield
    # Shutdown
    logger.info("CareerPilot AI Backend shutting down.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Multi-Agent AI Job Search and Career Assistant Platform",
    lifespan=lifespan
)

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    settings.FRONTEND_URL,
    "*"  # Open during local development for testing
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Error handling
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Input validation error", "errors": exc.errors()}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please try again later."}
    )

# Include Routers
api_prefix = settings.API_V1_PREFIX
app.include_router(auth_router, prefix=api_prefix)
app.include_router(users_router, prefix=api_prefix)
app.include_router(resumes_router, prefix=api_prefix)
app.include_router(jobs_router, prefix=api_prefix)
app.include_router(applications_router, prefix=api_prefix)
app.include_router(cover_letter_router, prefix=api_prefix)
app.include_router(interview_router, prefix=api_prefix)
app.include_router(dashboard_router, prefix=api_prefix)
app.include_router(insights_router, prefix=api_prefix)

@app.get("/api/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "llm_provider": settings.LLM_PROVIDER
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API. Visit /docs for OpenAPI specifications.",
        "version": settings.VERSION
    }
