import json
import logging
from typing import Dict, Any, Optional
from app.services.matching_service import MatchingService
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class JobMatchingAgent:
    """
    CrewAI-compatible Job Matching Agent.
    Evaluates semantic fit, skill overlap, and qualifications between candidate profile and job requirements.
    """
    role = "Lead Technical Recruiter and Matchmaker"
    goal = "Evaluate nuanced candidate fit for target roles, identifying strengths and critical gaps."
    backstory = (
        "Veteran technical recruiter having reviewed tens of thousands of engineering applications. "
        "Understands exact hiring manager expectations, domain overlap, and transferable skills."
    )

    def __init__(self):
        pass

    async def evaluate_match(self, resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        # Perform base quantitative matching
        match_result = MatchingService.match_resume_to_job(resume_data, job_data)

        # If LLM is configured, enrich recommendations and qualitative assessment
        if llm_service.is_configured():
            system_prompt = (
                "You are an expert technical recruiter analyzing how well a candidate's resume matches a job. "
                "Output strictly valid JSON with keys: 'strengths' (list of strings), 'weaknesses' (list of strings), "
                "'recommendations' (list of strings), 'experience_compatibility' (string). "
                "Never invent experience or skills the candidate doesn't have."
            )
            user_prompt = f"""
Candidate Skills: {', '.join(resume_data.get('skills', []))}
Candidate Experience: {json.dumps(resume_data.get('experience', []))}

Job Title: {job_data.get('title')} at {job_data.get('company')}
Job Required Skills: {', '.join(job_data.get('skills', []))}
Job Description: {job_data.get('description')}
"""
            try:
                response_text = await llm_service.generate_chat_completion(system_prompt, user_prompt, response_format_json=True)
                if response_text:
                    parsed = json.loads(response_text)
                    if "strengths" in parsed and isinstance(parsed["strengths"], list):
                        match_result["strengths"] = parsed["strengths"]
                    if "weaknesses" in parsed and isinstance(parsed["weaknesses"], list):
                        match_result["weaknesses"] = parsed["weaknesses"]
                    if "recommendations" in parsed and isinstance(parsed["recommendations"], list):
                        match_result["recommendations"] = parsed["recommendations"]
                    if "experience_compatibility" in parsed:
                        match_result["experience_compatibility"] = parsed["experience_compatibility"]
            except Exception as e:
                logger.warning(f"JobMatchingAgent LLM enrichment skipped: {e}")

        return match_result
