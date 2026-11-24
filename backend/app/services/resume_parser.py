import os
import re
from typing import Dict, Any, List, Optional
try:
    import pymupdf as fitz
except ImportError:
    import fitz
from docx import Document
from app.utils.text_processing import (
    clean_text,
    extract_skills_from_text,
    extract_contact_info,
    detect_sections,
    detect_measurable_achievements
)

class ResumeParserService:
    """Extracts structured and unstructured information from PDF and DOCX resumes."""

    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract plain text from a PDF file using PyMuPDF."""
        try:
            doc = fitz.open(file_path)
            full_text = []
            for page in doc:
                text = page.get_text("text")
                if text:
                    full_text.append(text)
            doc.close()
            return clean_text("\n".join(full_text))
        except Exception as e:
            raise ValueError(f"Failed to parse PDF file: {str(e)}")

    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract plain text from a DOCX file."""
        try:
            doc = Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text]
            for table in doc.tables:
                for row in table.rows:
                    row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                    if row_text:
                        paragraphs.append(row_text)
            return clean_text("\n".join(paragraphs))
        except Exception as e:
            raise ValueError(f"Failed to parse DOCX file: {str(e)}")

    @classmethod
    def parse_file(cls, file_path: str, file_type: str) -> Dict[str, Any]:
        """Parse resume file and extract structured fields."""
        if file_type == "pdf" or file_path.lower().endswith(".pdf"):
            raw_text = cls.extract_text_from_pdf(file_path)
        elif file_type == "docx" or file_path.lower().endswith(".docx"):
            raw_text = cls.extract_text_from_docx(file_path)
        else:
            raise ValueError(f"Unsupported file format: {file_type}. Please upload PDF or DOCX.")

        if not raw_text.strip():
            raise ValueError("The uploaded document contains no readable text.")

        # Extract contact information
        contact_info = extract_contact_info(raw_text)

        # Detect candidate name (heuristic: first non-empty line with letters, < 4 words)
        lines = [line.strip() for line in raw_text.split("\n") if line.strip()]
        candidate_name = "Candidate"
        for line in lines[:5]:
            # Skip if it looks like an email or phone number or header label
            if "@" in line or any(char.isdigit() for char in line):
                continue
            if re.match(r'^[A-Za-z\s.\'-]{3,40}$', line) and len(line.split()) <= 4:
                candidate_name = line.strip().title()
                break

        # Detect sections
        sections = detect_sections(raw_text)

        # Extract skills
        skills = extract_skills_from_text(raw_text)
        # If skills section exists, extract specifically from it too
        if "skills" in sections:
            section_skills = extract_skills_from_text(sections["skills"])
            skills = sorted(list(set(skills + section_skills)))

        # Extract summary
        summary = sections.get("summary", "")
        if not summary and lines:
            # First paragraph after header
            for i, line in enumerate(lines[1:6]):
                if len(line) > 50:
                    summary = line
                    break

        # Extract education entries
        education = []
        if "education" in sections:
            edu_lines = [l.strip() for l in sections["education"].split("\n") if l.strip()]
            current_edu = {}
            for el in edu_lines:
                year_match = re.search(r'\b(19\d{2}|20\d{2})\b', el)
                if any(deg in el.lower() for deg in ["bachelor", "master", "b.tech", "b.e", "m.tech", "bs", "ms", "phd", "degree", "diploma"]):
                    if current_edu:
                        education.append(current_edu)
                    current_edu = {"degree": el, "institution": "", "year": year_match.group(1) if year_match else ""}
                elif current_edu and not current_edu.get("institution"):
                    current_edu["institution"] = el
            if current_edu:
                education.append(current_edu)
        if not education:
            # Fallback scan for common degrees
            for line in lines:
                if any(deg in line.lower() for deg in ["b.tech", "bachelor", "master", "computer science"]):
                    year_match = re.search(r'\b(19\d{2}|20\d{2})\b', line)
                    education.append({
                        "degree": line,
                        "institution": "University / College",
                        "year": year_match.group(1) if year_match else "2024"
                    })
                    break

        # Extract experience entries
        experience = []
        if "experience" in sections:
            exp_lines = [l.strip() for l in sections["experience"].split("\n") if l.strip()]
            current_exp = None
            for line in exp_lines:
                # Check for role / title pattern
                date_match = re.search(r'\b(20\d{2}|present|current)\b', line, re.IGNORECASE)
                is_bullet = line.startswith(('-', '•', '*', '–'))
                if (date_match or len(line) < 60) and not is_bullet and not current_exp:
                    current_exp = {
                        "role": line,
                        "company": "Company",
                        "duration": date_match.group(0) if date_match else "",
                        "bullets": []
                    }
                elif current_exp and is_bullet:
                    current_exp["bullets"].append(line.lstrip('-•*– ').strip())
                elif current_exp and len(current_exp["bullets"]) > 0 and not is_bullet and date_match:
                    experience.append(current_exp)
                    current_exp = {
                        "role": line,
                        "company": "Company",
                        "duration": date_match.group(0) if date_match else "",
                        "bullets": []
                    }
            if current_exp:
                experience.append(current_exp)

        # Extract projects entries
        projects = []
        if "projects" in sections:
            proj_lines = [l.strip() for l in sections["projects"].split("\n") if l.strip()]
            current_proj = None
            for line in proj_lines:
                is_bullet = line.startswith(('-', '•', '*', '–'))
                if not is_bullet and len(line) < 60:
                    if current_proj:
                        projects.append(current_proj)
                    current_proj = {"name": line, "description": "", "technologies": extract_skills_from_text(line)}
                elif current_proj:
                    current_proj["description"] += " " + line.lstrip('-•*– ')
                    current_proj["technologies"] = list(set(current_proj["technologies"] + extract_skills_from_text(line)))
            if current_proj:
                projects.append(current_proj)

        # Extract certifications
        certifications = []
        if "certifications" in sections:
            cert_lines = [l.strip().lstrip('-•* ') for l in sections["certifications"].split("\n") if l.strip()]
            certifications = cert_lines[:10]

        return {
            "candidate_name": candidate_name,
            "contact_info": contact_info,
            "summary": summary,
            "skills": skills,
            "education": education,
            "experience": experience,
            "projects": projects,
            "certifications": certifications,
            "raw_text": raw_text
        }
