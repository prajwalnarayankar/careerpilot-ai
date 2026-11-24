import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from app.agents.job_discovery import JobDiscoveryAgent
from app.agents.job_matching import JobMatchingAgent
from app.agents.ats_agent import AtsAgent
from app.agents.resume_optimizer import ResumeOptimizationAgent
from app.agents.cover_letter import CoverLetterAgent
from app.agents.interview_agent import InterviewAgent

logger = logging.getLogger(__name__)

class CareerPilotOrchestrator:
    """
    CrewAI Multi-Agent System Orchestrator.
    Coordinates specialized autonomous agents across the entire career progression pipeline.
    """

    def __init__(self):
        self.job_discovery_agent = JobDiscoveryAgent()
        self.job_matching_agent = JobMatchingAgent()
        self.ats_agent = AtsAgent()
        self.resume_optimizer_agent = ResumeOptimizationAgent()
        self.cover_letter_agent = CoverLetterAgent()
        self.interview_agent = InterviewAgent()
        logger.info("CareerPilot Multi-Agent Orchestrator successfully initialized.")

    async def discover_jobs(
        self,
        db: Session,
        keyword: Optional[str] = None,
        location: Optional[str] = None,
        experience: Optional[str] = None,
        work_mode: Optional[str] = None,
        source: Optional[str] = "all",
        limit: int = 20
    ):
        return await self.job_discovery_agent.run(
            db=db,
            keyword=keyword,
            location=location,
            experience=experience,
            work_mode=work_mode,
            source=source,
            limit=limit
        )

    async def audit_ats(
        self,
        resume_data: Dict[str, Any],
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        return await self.ats_agent.analyze(resume_data, job_description, target_role)

    async def match_candidate(
        self,
        resume_data: Dict[str, Any],
        job_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        return await self.job_matching_agent.evaluate_match(resume_data, job_data)

    async def optimize_resume(
        self,
        resume_data: Dict[str, Any],
        job_data: Optional[Dict[str, Any]] = None,
        job_description: Optional[str] = None,
        target_role: Optional[str] = None
    ) -> Dict[str, Any]:
        return await self.resume_optimizer_agent.optimize(
            resume_data=resume_data,
            job_data=job_data,
            job_description=job_description,
            target_role=target_role
        )

    async def generate_cover_letter(
        self,
        candidate_name: str,
        user_skills: list,
        company_name: str,
        job_title: str,
        job_description: Optional[str] = None,
        tone: str = "Professional",
        custom_instructions: Optional[str] = None,
        experience_summary: Optional[str] = None
    ) -> str:
        return await self.cover_letter_agent.generate_cover_letter(
            candidate_name=candidate_name,
            user_skills=user_skills,
            company_name=company_name,
            job_title=job_title,
            job_description=job_description,
            tone=tone,
            custom_instructions=custom_instructions,
            experience_summary=experience_summary
        )

    async def prepare_interview(
        self,
        role_target: str,
        job_data: Optional[Dict[str, Any]] = None,
        candidate_skills: Optional[List[str]] = None,
        session_type: str = "Comprehensive"
    ) -> List[Dict[str, Any]]:
        return await self.interview_agent.generate_questions(
            role_target=role_target,
            job_data=job_data,
            candidate_skills=candidate_skills,
            session_type=session_type
        )

    async def evaluate_interview_response(
        self,
        question_text: str,
        category: str,
        user_answer: str,
        context_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        return await self.interview_agent.evaluate_answer(
            question_text=question_text,
            category=category,
            user_answer=user_answer,
            context_hint=context_hint
        )

# Global orchestrator singleton
orchestrator = CareerPilotOrchestrator()
