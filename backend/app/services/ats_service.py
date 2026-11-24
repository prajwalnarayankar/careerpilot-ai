from typing import Dict, Any, List, Optional
from app.utils.text_processing import (
    extract_skills_from_text,
    detect_measurable_achievements,
    detect_action_verbs,
    detect_sections,
    SKILL_TAXONOMY
)

class AtsService:
    """Analyzes resume against ATS standards and optional job descriptions."""

    @staticmethod
    def analyze_resume(resume_data: Dict[str, Any], job_description: Optional[str] = None, target_role: Optional[str] = None) -> Dict[str, Any]:
        raw_text = resume_data.get("raw_text", "")
        skills = resume_data.get("skills", [])
        experience = resume_data.get("experience", [])
        education = resume_data.get("education", [])
        projects = resume_data.get("projects", [])
        contact = resume_data.get("contact_info", {})
        summary = resume_data.get("summary", "")

        formatting_problems = []
        missing_sections = []
        strengths = []
        weaknesses = []
        recommendations = []

        # 1. Formatting & Structure Assessment (Max 100)
        formatting_score = 100.0
        
        # Check sections
        sections = detect_sections(raw_text)
        required_sections = ["skills", "experience", "education"]
        for sec in required_sections:
            if sec not in sections and not resume_data.get(sec):
                missing_sections.append(sec.title())
                formatting_problems.append(f"Missing distinct '{sec.title()}' section header.")
                formatting_score -= 15.0

        if not summary:
            missing_sections.append("Professional Summary")
            formatting_problems.append("No professional summary found at the top of the resume.")
            formatting_score -= 8.0

        # Check contact info
        if not contact.get("email"):
            formatting_problems.append("Missing contact email address.")
            formatting_score -= 10.0
        if not contact.get("phone"):
            formatting_problems.append("Missing phone number.")
            formatting_score -= 5.0
        if not (contact.get("linkedin") or contact.get("github")):
            formatting_problems.append("No professional links (LinkedIn/GitHub) detected.")
            formatting_score -= 5.0

        # Text length & word count check
        word_count = len(raw_text.split())
        if word_count < 180:
            formatting_problems.append("Resume content is sparse (fewer than 180 words). Add more details.")
            formatting_score -= 15.0
        elif word_count > 1200:
            formatting_problems.append("Resume is lengthy (>1200 words). Aim for a concise 1-2 page format.")
            formatting_score -= 8.0

        formatting_score = max(20.0, min(100.0, formatting_score))

        # 2. Measurable Achievements & Action Verbs (Experience Score)
        measurable = detect_measurable_achievements(raw_text)
        action_verbs_found, verb_count = detect_action_verbs(raw_text)

        experience_score = 60.0
        if len(experience) > 0:
            experience_score += 15.0
        if len(measurable) >= 3:
            experience_score += 15.0
            strengths.append(f"Strong quantification: identified {len(measurable)} measurable achievements with metrics.")
        elif len(measurable) == 1 or len(measurable) == 2:
            experience_score += 8.0
            weaknesses.append(f"Limited metrics: only {len(measurable)} quantified bullet point(s) found.")
            recommendations.append("Quantify your impact using numbers, percentages, or scale (e.g. 'reduced latency by 35%').")
        else:
            weaknesses.append("No measurable metrics (%, $, numbers) detected in your bullet points.")
            recommendations.append("Adopt the Google X-Y-Z formula: 'Accomplished [X] as measured by [Y], by doing [Z]'.")

        if verb_count >= 5:
            experience_score += 10.0
            strengths.append(f"Good use of dynamic action verbs ({', '.join(action_verbs_found[:4])}).")
        else:
            recommendations.append("Begin bullet points with strong action verbs like 'Engineered', 'Architected', 'Optimized'.")

        experience_score = max(20.0, min(100.0, experience_score))

        # 3. Education Score
        education_score = 75.0
        if len(education) > 0:
            education_score = 95.0
            strengths.append("Clear educational credentials identified.")
        else:
            weaknesses.append("Formal education details could not be distinctly parsed.")
            recommendations.append("Include your degree, institution name, and graduation year clearly.")

        # 4. Skills & Keyword Relevance
        target_skills = []
        if job_description:
            target_skills = extract_skills_from_text(job_description)
            
        if not target_skills and target_role:
            # Derive expected skills from target role
            role_lower = target_role.lower()
            if "python" in role_lower:
                target_skills = ["Python", "FastAPI", "SQL", "Docker", "Git", "REST API"]
            elif "react" in role_lower or "frontend" in role_lower:
                target_skills = ["React", "JavaScript", "TypeScript", "Tailwind CSS", "HTML5", "Git"]
            elif "full" in role_lower or "stack" in role_lower:
                target_skills = ["Python", "React", "PostgreSQL", "Docker", "REST API", "Git"]
            elif "data" in role_lower or "ml" in role_lower:
                target_skills = ["Python", "Machine Learning", "Pandas", "PyTorch", "SQL"]
            else:
                target_skills = ["Python", "Git", "SQL", "Docker", "Communication"]

        resume_skills_set = {s.lower() for s in skills}
        
        if target_skills:
            target_skills_set = {s.lower() for s in target_skills}
            matching_skills_list = [s for s in target_skills if s.lower() in resume_skills_set]
            missing_skills_list = [s for s in target_skills if s.lower() not in resume_skills_set]
            
            skills_ratio = len(matching_skills_list) / max(len(target_skills), 1)
            skills_match_score = round(min(100.0, skills_ratio * 100), 1)
            keyword_match_score = round(min(100.0, (skills_match_score * 0.8) + (20.0 if len(skills) >= 6 else 10.0)), 1)
            
            if matching_skills_list:
                strengths.append(f"Target skills match: {', '.join(matching_skills_list[:5])}.")
            if missing_skills_list:
                weaknesses.append(f"Missing high-impact skills: {', '.join(missing_skills_list[:5])}.")
                recommendations.append(f"Incorporate missing core skills if you possess them: {', '.join(missing_skills_list[:4])}.")
        else:
            # General skill density evaluation
            skills_count = len(skills)
            if skills_count >= 10:
                skills_match_score = 90.0
                strengths.append(f"Broad technical skill profile with {skills_count} recognized technologies.")
            elif skills_count >= 5:
                skills_match_score = 75.0
            else:
                skills_match_score = 50.0
                weaknesses.append("Low density of explicit technical skills detected.")
                recommendations.append("Add a dedicated 'Technical Skills' section categorizing Languages, Frameworks, and Tools.")
                
            keyword_match_score = skills_match_score
            matching_skills_list = skills
            missing_skills_list = []

        # 5. Overall ATS Score Calculation (Weighted)
        # Weights: Keyword Match (25%), Skills Match (25%), Formatting (20%), Experience (20%), Education (10%)
        ats_score = round(
            (keyword_match_score * 0.25) +
            (skills_match_score * 0.25) +
            (formatting_score * 0.20) +
            (experience_score * 0.20) +
            (education_score * 0.10),
            1
        )

        return {
            "ats_score": ats_score,
            "keyword_match_score": keyword_match_score,
            "skills_match_score": skills_match_score,
            "formatting_score": formatting_score,
            "experience_score": experience_score,
            "education_score": education_score,
            "formatting_problems": formatting_problems,
            "missing_sections": missing_sections,
            "measurable_achievements": measurable,
            "extracted_keywords": skills,
            "missing_keywords": missing_skills_list if target_skills else [],
            "recommendations": recommendations,
            "strengths": strengths,
            "weaknesses": weaknesses,
        }
