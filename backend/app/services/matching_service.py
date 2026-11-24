from typing import Dict, Any, List, Optional
from app.utils.text_processing import extract_skills_from_text

class MatchingService:
    """Computes multidimensional match scores between a resume/profile and a job description."""

    @staticmethod
    def match_resume_to_job(resume_data: Dict[str, Any], job_data: Dict[str, Any]) -> Dict[str, Any]:
        resume_skills = [s.lower() for s in resume_data.get("skills", [])]
        resume_text = resume_data.get("raw_text", "").lower()
        
        job_skills = [s.lower() for s in job_data.get("skills", [])]
        job_title = job_data.get("title", "").lower()
        job_desc = job_data.get("description", "").lower()
        job_exp = job_data.get("experience", "").lower()
        
        # If job has no explicit skills, extract them from the description
        if not job_skills:
            job_skills = [s.lower() for s in extract_skills_from_text(job_desc)]

        # 1. Skill Overlap
        matching_skills = []
        missing_skills = []
        
        for js in job_skills:
            if js in resume_skills or js in resume_text:
                matching_skills.append(js.title() if len(js) > 3 else js.upper())
            else:
                missing_skills.append(js.title() if len(js) > 3 else js.upper())

        total_req_skills = max(len(job_skills), 1)
        skills_ratio = len(matching_skills) / total_req_skills
        skills_match_score = round(min(100.0, skills_ratio * 100), 1)

        # 2. Experience Compatibility
        # Check years of experience in resume
        user_experience_list = resume_data.get("experience", [])
        years_estimated = len(user_experience_list) * 1.5  # rule of thumb
        
        if "senior" in job_exp or "5+" in job_exp:
            if years_estimated >= 4:
                exp_compat = "Strong Match (Senior Level Experience)"
                exp_score = 95.0
            elif years_estimated >= 2:
                exp_compat = "Moderate Match (Targeting Senior Role)"
                exp_score = 70.0
            else:
                exp_compat = "Growth Opportunity (Job seeks 5+ years)"
                exp_score = 50.0
        elif "3-5" in job_exp:
            if years_estimated >= 2:
                exp_compat = "Strong Match (Mid-Level Compatibility)"
                exp_score = 90.0
            else:
                exp_compat = "Moderate Match (Early Career Candidate)"
                exp_score = 75.0
        else:  # Fresher / 0-2 years
            exp_compat = "Excellent Match (Entry/Associate Level)"
            exp_score = 95.0

        # 3. Education Compatibility
        education_list = resume_data.get("education", [])
        if any("b.tech" in str(e).lower() or "bachelor" in str(e).lower() or "master" in str(e).lower() for e in education_list):
            edu_compat = "Fully Qualified (Technical Degree)"
            edu_score = 95.0
        elif education_list:
            edu_compat = "Qualified (Degree on record)"
            edu_score = 85.0
        else:
            edu_compat = "General Compatibility"
            edu_score = 70.0

        # 4. Keyword Overlap (Title / Context overlap)
        keyword_overlap = 50.0
        if any(term in resume_text for term in job_title.split()):
            keyword_overlap += 30.0
        if any(s.lower() in resume_text for s in matching_skills):
            keyword_overlap += 20.0
        keyword_overlap = min(100.0, keyword_overlap)

        # 5. Composite Match Score
        # Weighted: Skills (50%), Experience (25%), Education (10%), Keyword Overlap (15%)
        match_score = round(
            (skills_match_score * 0.50) +
            (exp_score * 0.25) +
            (edu_score * 0.10) +
            (keyword_overlap * 0.15),
            1
        )
        match_score = max(20.0, min(99.0, match_score))

        # Strengths, Weaknesses, Recommendations
        strengths = []
        weaknesses = []
        recommendations = []

        if matching_skills:
            strengths.append(f"Demonstrated core proficiency in: {', '.join(matching_skills[:4])}.")
        if "Strong" in exp_compat or "Excellent" in exp_compat:
            strengths.append(f"Experience level aligns well with {job_data.get('experience', 'the role')}.")
            
        if missing_skills:
            weaknesses.append(f"Key missing skills required by employer: {', '.join(missing_skills[:4])}.")
            recommendations.append(f"Highlight projects or practical experience involving {missing_skills[0]} and {missing_skills[1] if len(missing_skills) > 1 else 'related tools'}.")
        else:
            strengths.append("100% of the key required technologies are present in your profile.")

        if match_score >= 80:
            recommendations.append("High match probability! Proceed to tailor your cover letter and submit an application.")
        elif match_score >= 60:
            recommendations.append("Good baseline fit. Use the Resume Optimization Agent to tailor bullet points to this role's keywords.")
        else:
            recommendations.append("Address skill gaps by featuring relevant hands-on projects or open source contributions before applying.")

        return {
            "match_score": match_score,
            "skills_match_score": skills_match_score,
            "experience_compatibility": exp_compat,
            "education_compatibility": edu_compat,
            "keyword_overlap": keyword_overlap,
            "matching_skills": matching_skills,
            "missing_skills": missing_skills,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "recommendations": recommendations,
        }
