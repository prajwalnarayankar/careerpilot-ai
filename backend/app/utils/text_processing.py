import re
from typing import List, Dict, Any, Set, Tuple

# Comprehensive Tech Skills taxonomy
SKILL_TAXONOMY = {
    # Programming Languages
    "python", "javascript", "typescript", "java", "c++", "c#", "golang", "go", "rust", 
    "ruby", "php", "swift", "kotlin", "scala", "r", "dart", "shell", "bash", "sql",
    
    # Frontend
    "react", "react.js", "next.js", "vue", "vue.js", "angular", "svelte", "html", "html5", 
    "css", "css3", "tailwind", "tailwind css", "bootstrap", "sass", "redux", "zustand",
    
    # Backend & Frameworks
    "fastapi", "flask", "django", "node.js", "express", "express.js", "nest.js", 
    "spring boot", "spring", "asp.net", "rails", "ruby on rails", "graphql", "rest api", "grpc",
    
    # Databases & Storage
    "postgresql", "postgres", "mysql", "sqlite", "mongodb", "redis", "elasticsearch", 
    "cassandra", "dynamodb", "supabase", "firebase", "neo4j", "mariadb", "snowflake", "bigquery",
    
    # Cloud & DevOps
    "aws", "amazon web services", "azure", "gcp", "google cloud", "docker", "kubernetes", 
    "k8s", "terraform", "ansible", "ci/cd", "github actions", "gitlab ci", "jenkins", 
    "linux", "nginx", "helm", "prometheus", "grafana",
    
    # AI / ML / Data Science
    "machine learning", "deep learning", "nlp", "natural language processing", 
    "computer vision", "llm", "large language models", "crewai", "langchain", "pytorch", 
    "tensorflow", "keras", "scikit-learn", "pandas", "numpy", "opencv", "huggingface", 
    "transformers", "vector databases", "chromadb", "faiss",
    
    # Methodologies & Tools
    "git", "github", "gitlab", "bitbucket", "jira", "agile", "scrum", "microservices", 
    "system design", "unit testing", "pytest", "jest", "cypress", "tdd"
}

# Strong Action Verbs for ATS
ACTION_VERBS = {
    "architected", "built", "spearheaded", "developed", "engineered", "implemented", 
    "designed", "optimized", "orchestrated", "automated", "refactored", "deployed", 
    "streamlined", "scaled", "boosted", "reduced", "delivered", "mentored", 
    "integrated", "pioneered", "standardized", "migrated", "collaborated", "managed",
    "launched", "revamped", "created", "transformed", "increased", "maximized"
}

EMAIL_REGEX = re.compile(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}')
PHONE_REGEX = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}')
URL_REGEX = re.compile(r'https?://(?:www\.)?[a-zA-Z0-9./\-_#]+')
LINKEDIN_REGEX = re.compile(r'linkedin\.com/in/([a-zA-Z0-9-_]+)', re.IGNORECASE)
GITHUB_REGEX = re.compile(r'github\.com/([a-zA-Z0-9-_]+)', re.IGNORECASE)

# Measurable metrics detection: numbers followed by %, $, ms, x, users, etc.
METRICS_REGEX = re.compile(
    r'(\b\d+(?:\.\d+)?%\b|\$\d+(?:,\d+)*(?:\.\d+)?(?:k|m|b)?\b|\b\d+(?:,\d+)*\+?\s*(?:users|clients|requests|qps|ms|seconds|minutes|hours|days|fold|x)\b|\breduced\s+by\s+\d+|\bincreased\s+by\s+\d+|\bimproved\s+by\s+\d+)',
    re.IGNORECASE
)

SECTION_PATTERNS = {
    "summary": [r"summary", r"professional summary", r"profile", r"about me", r"executive summary"],
    "skills": [r"technical skills", r"skills", r"core competencies", r"technologies", r"tools & technologies"],
    "experience": [r"experience", r"work experience", r"employment history", r"professional experience"],
    "education": [r"education", r"academic background", r"qualifications"],
    "projects": [r"projects", r"personal projects", r"key projects", r"academic projects"],
    "certifications": [r"certifications", r"certificates", r"licenses & certifications", r"courses"]
}

def clean_text(text: str) -> str:
    """Normalize whitespace and encoding artifacts."""
    if not text:
        return ""
    text = re.sub(r'\r\n|\r', '\n', text)
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def extract_skills_from_text(text: str) -> List[str]:
    """Identify skills present in text against taxonomy."""
    if not text:
        return []
    normalized_text = text.lower()
    found_skills = set()
    
    for skill in SKILL_TAXONOMY:
        # Match as full word
        pattern = r'(?<![a-zA-Z0-9])' + re.escape(skill) + r'(?![a-zA-Z0-9])'
        if re.search(pattern, normalized_text):
            # Return proper casing representation
            found_skills.add(skill.title() if len(skill) > 3 else skill.upper())
            
    return sorted(list(found_skills))

def extract_contact_info(text: str) -> Dict[str, Any]:
    """Extract emails, phone numbers, and profile URLs."""
    emails = EMAIL_REGEX.findall(text)
    phones = PHONE_REGEX.findall(text)
    linkedin = LINKEDIN_REGEX.findall(text)
    github = GITHUB_REGEX.findall(text)
    
    return {
        "email": emails[0] if emails else None,
        "phone": phones[0] if phones else None,
        "linkedin": f"linkedin.com/in/{linkedin[0]}" if linkedin else None,
        "github": f"github.com/{github[0]}" if github else None,
    }

def detect_sections(text: str) -> Dict[str, str]:
    """Segment text into standard resume sections."""
    lines = text.split('\n')
    sections: Dict[str, List[str]] = {
        "header": [],
        "summary": [],
        "skills": [],
        "experience": [],
        "education": [],
        "projects": [],
        "certifications": [],
        "other": []
    }
    
    current_section = "header"
    
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue
            
        lower_line = stripped.lower().strip(":").strip()
        matched = False
        
        # Check if line looks like a header (short, matches section keyword)
        if len(stripped) < 40:
            for sec, patterns in SECTION_PATTERNS.items():
                for pat in patterns:
                    if re.fullmatch(pat, lower_line) or lower_line.startswith(pat + " "):
                        current_section = sec
                        matched = True
                        break
                if matched:
                    break
                    
        if not matched:
            sections[current_section].append(stripped)
            
    return {k: "\n".join(v) for k, v in sections.items() if v}

def detect_measurable_achievements(text: str) -> List[str]:
    """Find bullet points or sentences that contain measurable metrics."""
    results = []
    lines = text.split('\n')
    for line in lines:
        line_clean = line.strip().lstrip('•-*').strip()
        if len(line_clean) > 20 and METRICS_REGEX.search(line_clean):
            results.append(line_clean)
    return results

def detect_action_verbs(text: str) -> Tuple[List[str], int]:
    """Count and list strong action verbs used at sentence or bullet starts."""
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    found = [w for w in words if w in ACTION_VERBS]
    return list(set(found)), len(found)
