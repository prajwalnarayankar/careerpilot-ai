import json
import logging
from typing import Dict, Any, Optional
from app.services.ats_service import AtsService
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class AtsAgent:
    """
    CrewAI-compatible Resume / ATS Agent.
    Audits resume parser output, verifies layout compatibility with Applicant Tracking Systems,
    and provides actionable optimization strategies.
    """
    role = "Executive ATS Algorithm and Resume Auditor"
    goal = "Maximize candidate resume pass-rate through corporate Applicant Tracking Systems."
    backstory = (
        "Engineered parsing logic for major HR enterprise software (Workday, Taleo, Greenhouse). "
        "Knows every formatting pitfall, header requirement, and keyword density metric."
    )

    def __init__(self):
        pass

    async def analyze(self, resume_data: Dict[str, Any], job_description: Optional[str] = None, target_role: Optional[str] = None) -> Dict[str, Any]:
        analysis = AtsService.analyze_resume(resume_data, job_description, target_role)

        # Enrich with LLM if active
        if llm_service.is_configured():
            system_prompt = (
                "You are an ATS compliance expert. Return valid JSON with keys: "
                "'recommendations' (list of 3-5 specific, practical improvements), "
                "'formatting_tips' (list of strings). Do not hallucinate."
            )
            user_prompt = f"""
Current ATS Score: {analysis['ats_score']}
Formatting Score: {analysis['formatting_score']}
Detected Sections: Skills ({len(resume_data.get('skills', []))}), Experience ({len(resume_data.get('experience', []))})
Weaknesses: {', '.join(analysis.get('weaknesses', []))}
Target Role: {target_role or 'Software Engineer'}
"""
            try:
                resp = await llm_service.generate_chat_completion(system_prompt, user_prompt, response_format_json=True)
                if resp:
                    parsed = json.loads(resp)
                    if "recommendations" in parsed and isinstance(parsed["recommendations"], list):
                        analysis["recommendations"] = parsed["recommendations"]
            except Exception as e:
                logger.warning(f"AtsAgent LLM enrichment skipped: {e}")

        return analysis
