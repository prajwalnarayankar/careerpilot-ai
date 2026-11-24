import logging
from typing import Dict, Any, Optional
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class CoverLetterAgent:
    """
    CrewAI-compatible Cover Letter Agent.
    Generates highly personalized, tailored cover letters bridging candidate background
    with the target company's mission and technical needs.
    """
    role = "Executive Communications and Cover Letter Specialist"
    goal = "Draft authentic, role-specific cover letters that capture recruiter interest without fluff or fabrication."
    backstory = (
        "Expert corporate communicator who transforms technical resumes and company job postings "
        "into persuasive professional narratives that clearly articulate value proposition."
    )

    def __init__(self):
        pass

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
        if llm_service.is_configured():
            system_prompt = (
                f"You are an expert executive career writer. Generate an exceptional cover letter tailored for the role of {job_title} "
                f"at {company_name}. Tone: {tone}. "
                "Guidelines:\n"
                "1. Strictly avoid generic filler, cliches, or robotic phrases.\n"
                "2. Concretely highlight the candidate's real skills and problem-solving abilities.\n"
                "3. Never fabricate certifications, degrees, or companies.\n"
                "4. Keep it concise (around 250-350 words, 3-4 paragraphs).\n"
                "5. Provide standard letter format with Salutation, Body, and Sign-off."
            )
            user_prompt = f"""
Candidate Name: {candidate_name}
Candidate Skills: {', '.join(user_skills)}
Key Background: {experience_summary or 'Experienced software engineer'}
Company: {company_name}
Target Role: {job_title}
Job Description Excerpt: {job_description or 'Seeking an engineering professional proficient in modern technologies.'}
Custom Instructions: {custom_instructions or 'Focus on technical excellence and engineering impact.'}
"""
            try:
                resp = await llm_service.generate_chat_completion(system_prompt, user_prompt)
                if resp and len(resp.strip()) > 100:
                    return resp.strip()
            except Exception as e:
                logger.warning(f"CoverLetterAgent LLM call failed: {e}")

        # High quality tailored template fallback
        top_skills_str = ", ".join(user_skills[:4]) if user_skills else "software engineering"
        
        tone_opening = {
            "Professional": f"I am writing to express my strong interest in the {job_title} position at {company_name}.",
            "Enthusiastic": f"I am thrilled to apply for the {job_title} position at {company_name}, an organization whose engineering culture and mission I deeply admire.",
            "Executive": f"With a proven background delivering scalable technical solutions, I welcome the opportunity to contribute to {company_name} as your next {job_title}.",
            "Technical": f"I am excited to submit my application for the {job_title} role at {company_name}, bringing specialized technical experience across {top_skills_str}."
        }.get(tone, f"I am writing to express my enthusiastic interest in the {job_title} position at {company_name}.")

        letter = f"""Dear Hiring Team at {company_name},

{tone_opening} Having closely followed {company_name}'s recent work, I am confident that my technical expertise in {top_skills_str} and dedication to engineering excellence align directly with the objectives of your team.

Throughout my career, I have focused on engineering dependable backend services, optimizing complex database workflows, and collaborating within agile environments to solve mission-critical problems. Whether designing clean RESTful interfaces, implementing automated test suites, or streamlining deployment pipelines, I prioritize system reliability, clean architectural patterns, and measurable user impact.

The opportunity to tackle challenging technical problems at {company_name} is especially appealing to me. My experience enables me to ramp up quickly, bridge cross-functional requirements, and contribute meaningfully to your product roadmap from day one.

Thank you for your time and consideration. I welcome the opportunity to discuss how my technical skills and enthusiasm can support {company_name}'s ongoing initiatives.

Sincerely,
{candidate_name}"""

        return letter
