import json
import logging
from typing import Dict, Any, List, Optional
from app.services.llm_service import llm_service

logger = logging.getLogger(__name__)

class InterviewAgent:
    """
    CrewAI-compatible Interview Agent.
    Generates tailored technical, behavioral, and architectural interview questions,
    and provides real-time scoring, analytical feedback, and model STAR answers.
    """
    role = "Principal Engineering Hiring Director & Interview Coach"
    goal = "Equip candidates with rigorous interview simulations, constructive evaluations, and model answers."
    backstory = (
        "Chaired engineering hiring committees across Silicon Valley and leading tech firms. "
        "Designs questions evaluating technical depth, problem-solving, architectural reasoning, and leadership."
    )

    def __init__(self):
        pass

    async def generate_questions(
        self,
        role_target: str,
        job_data: Optional[Dict[str, Any]] = None,
        candidate_skills: Optional[List[str]] = None,
        session_type: str = "Comprehensive"
    ) -> List[Dict[str, Any]]:
        skills = candidate_skills or ["Python", "SQL", "System Design", "Git"]
        skills_str = ", ".join(skills[:5])

        if llm_service.is_configured():
            system_prompt = (
                "You are a principal technical interviewer. Generate an interview question set. "
                "Output strictly valid JSON with an array named 'questions', where each object has: "
                "'category' (one of 'Technical', 'HR', 'Resume-based', 'Project', 'Job-specific', 'Behavioral'), "
                "'question_text' (string), "
                "'context_hint' (guidance on what the interviewer is looking for), "
                "'sample_key_points' (list of 2-3 key themes the candidate should mention)."
            )
            user_prompt = f"""
Target Role: {role_target}
Session Focus: {session_type}
Candidate Core Skills: {skills_str}
Job Context: {job_data.get('description')[:400] if job_data else 'Software engineering position'}
Generate 6 diverse, high-quality questions spanning technical, behavioral, project, and role-specific domains.
"""
            try:
                resp = await llm_service.generate_chat_completion(system_prompt, user_prompt, response_format_json=True)
                if resp:
                    parsed = json.loads(resp)
                    if "questions" in parsed and isinstance(parsed["questions"], list) and len(parsed["questions"]) > 0:
                        return parsed["questions"]
            except Exception as e:
                logger.warning(f"InterviewAgent LLM question generation failed: {e}")

        # Comprehensive, curated realistic questions
        default_questions = [
            {
                "category": "Technical",
                "question_text": f"How do you design and structure high-performance REST APIs in {skills[0] if skills else 'Python'}? Discuss error handling, validation, and database connection pooling.",
                "context_hint": "Focus on clean architecture (e.g. FastAPI/Pydantic), connection limits, and HTTP status code standards.",
                "sample_key_points": ["Schema validation", "Async concurrency", "SQLAlchemy connection pooling", "Idempotency"]
            },
            {
                "category": "Project",
                "question_text": "Walk me through the most technically challenging project you have engineered. What architectural bottlenecks did you face and how did you resolve them?",
                "context_hint": "Structure your answer using the STAR method: Situation, Task, Action, and Result.",
                "sample_key_points": ["System bottlenecks", "Trade-offs considered", "Measurable performance gains"]
            },
            {
                "category": "Job-specific",
                "question_text": f"In a fast-paced team developing for {role_target}, how do you ensure zero-downtime deployments and backward compatibility in database migrations?",
                "context_hint": "Demonstrate understanding of CI/CD, blue-green or rolling deploys, and schema expansion/contract cycles.",
                "sample_key_points": ["Two-phase migrations", "Health checks", "Canary releases"]
            },
            {
                "category": "Behavioral",
                "question_text": "Tell me about a time you had a technical disagreement with a colleague or lead regarding system design. How did you handle it?",
                "context_hint": "Demonstrate professional maturity, data-driven debate, and commitment to the team outcome.",
                "sample_key_points": ["Active listening", "Objective benchmarking/prototyping", "Constructive alignment"]
            },
            {
                "category": "Resume-based",
                "question_text": f"Your profile highlights experience with {skills_str}. How have you practically applied these technologies in production or real-world problem solving?",
                "context_hint": "Anchor your answer in a specific production scenario or end-to-end implementation.",
                "sample_key_points": ["Concrete practical use case", "Debugging under pressure", "Lessons learned"]
            },
            {
                "category": "HR",
                "question_text": f"What motivates you to pursue this {role_target} position, and where do you envision your technical leadership in the next 2 to 3 years?",
                "context_hint": "Show alignment with the company's technical vision and commitment to continuous growth.",
                "sample_key_points": ["Passion for problem domain", "Skill trajectory", "Mentorship and ownership"]
            }
        ]
        return default_questions

    async def evaluate_answer(
        self,
        question_text: str,
        category: str,
        user_answer: str,
        context_hint: Optional[str] = None
    ) -> Dict[str, Any]:
        """Evaluate candidate's answer with scoring, feedback, strengths, weaknesses, and a model answer."""
        if not user_answer or len(user_answer.strip()) < 10:
            return {
                "evaluation_score": 25.0,
                "feedback": "The answer provided is too brief to adequately assess technical depth or communication clarity.",
                "improved_answer": "Provide a comprehensive response detailing your methodology, specific tools used, and measurable results.",
                "strengths": ["Attempted response"],
                "weaknesses": ["Answer lacks sufficient detail", "Missing specific technical evidence"],
                "key_takeaways": ["Expand your answers using the STAR format (Situation, Task, Action, Result)."]
            }

        if llm_service.is_configured():
            system_prompt = (
                "You are a senior technical interviewer scoring a candidate's answer. "
                "Output strictly valid JSON with keys: "
                "'evaluation_score' (number between 0 and 100), "
                "'feedback' (constructive 2-3 paragraph analysis), "
                "'improved_answer' (a polished, stellar model answer demonstrating best practices), "
                "'strengths' (list of 2-3 specific strengths), "
                "'weaknesses' (list of 1-3 areas for improvement), "
                "'key_takeaways' (list of 2 actionable tips)."
            )
            user_prompt = f"""
Interview Question ({category}):
"{question_text}"
Context Hint: {context_hint or 'N/A'}

Candidate's Answer:
"{user_answer}"
"""
            try:
                resp = await llm_service.generate_chat_completion(system_prompt, user_prompt, response_format_json=True)
                if resp:
                    parsed = json.loads(resp)
                    return {
                        "evaluation_score": float(parsed.get("evaluation_score", 80.0)),
                        "feedback": parsed.get("feedback", "Solid answer demonstrating foundational understanding."),
                        "improved_answer": parsed.get("improved_answer", ""),
                        "strengths": parsed.get("strengths", ["Clear explanation"]),
                        "weaknesses": parsed.get("weaknesses", []),
                        "key_takeaways": parsed.get("key_takeaways", ["Include quantified metrics."])
                    }
            except Exception as e:
                logger.warning(f"InterviewAgent LLM answer evaluation failed: {e}")

        # Intelligent Heuristic Evaluation Engine
        word_count = len(user_answer.split())
        score = 65.0
        strengths = []
        weaknesses = []
        key_takeaways = []

        # Analyze structure and depth
        if word_count > 80:
            score += 15.0
            strengths.append("Comprehensive response with thoughtful elaboration on key concepts.")
        elif word_count > 40:
            score += 10.0
            strengths.append("Good concise framing of the main ideas.")
        else:
            weaknesses.append("Response is slightly succinct; could benefit from more detailed implementation context.")

        has_metrics = any(char.isdigit() for char in user_answer) or "%" in user_answer
        if has_metrics:
            score += 10.0
            strengths.append("Great inclusion of quantitative impact and concrete outcomes.")
        else:
            key_takeaways.append("Incorporate concrete measurements (e.g., % improvement, response times, team size).")

        score = min(95.0, score)

        improved_model_answer = (
            f"In tackling this scenario, I begin by analyzing the fundamental requirements and establishing clear constraints. "
            f"For instance, when addressing {question_text.lower()[:80]}, I implemented a modular solution emphasizing decoupled services, "
            f"thorough unit and integration testing, and proactive monitoring. By adopting this methodical approach, we resolved technical roadblocks "
            f"and achieved a 30% reduction in turnaround time while maintaining 99.9% uptime."
        )

        feedback = (
            f"Your response effectively addresses the core premise of the question. You demonstrated good communication clarity and "
            f"technical awareness. To elevate this to an exceptional interview response, consider explicitly structuring your points using "
            f"the STAR framework (Situation, Task, Action, Result) and highlighting lessons learned during implementation."
        )

        return {
            "evaluation_score": score,
            "feedback": feedback,
            "improved_answer": improved_model_answer,
            "strengths": strengths if strengths else ["Good foundational understanding of the concept."],
            "weaknesses": weaknesses if weaknesses else ["Could provide deeper architectural trade-off comparisons."],
            "key_takeaways": key_takeaways if key_takeaways else ["Structure technical answers with Context -> Action -> Metric."]
        }
