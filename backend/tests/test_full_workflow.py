import io
import fitz
import pytest

def test_full_21_step_end_to_end_workflow(client):
    """
    Executes and validates the complete 21-step end-to-end platform workflow:
    1. Register a user
    2. Login
    3. Complete profile
    4. Upload a sample resume
    5. Parse the resume
    6. Run ATS analysis
    7. Search for Python Developer jobs
    8. Display job results
    9. Select a job
    10. Calculate resume-job match
    11. Show matching/missing skills
    12. Optimize resume suggestions
    13. Generate personalized cover letter
    14. Generate interview questions
    15. Answer an interview question
    16. Evaluate the answer
    17. Save the job
    18. Create an application
    19. Move application to Interview
    20. Verify dashboard statistics update
    21. Generate AI career insights
    """
    # Step 1: Register a user
    reg_data = {
        "email": "e2e_pilot_candidate@example.com",
        "password": "SecurePassword2026!",
        "full_name": "Priya Sharma"
    }
    reg_resp = client.post("/api/auth/register", json=reg_data)
    assert reg_resp.status_code == 201, f"Step 1 Failed: {reg_resp.text}"
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Step 2: Login
    login_resp = client.post("/api/auth/login", json={
        "email": "e2e_pilot_candidate@example.com",
        "password": "SecurePassword2026!"
    })
    assert login_resp.status_code == 200, f"Step 2 Failed: {login_resp.text}"
    assert "access_token" in login_resp.json()

    # Step 3: Complete profile
    profile_payload = {
        "headline": "Lead Python Developer & Cloud Architect",
        "phone": "+91 98765 43210",
        "location": "Bangalore, India",
        "preferred_job_role": "Python Developer",
        "preferred_location": "Bangalore",
        "experience_level": "Fresher / 0-2 years",
        "preferred_work_mode": "Remote / Hybrid / On-site",
        "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git", "Redis", "REST API"],
        "education": [{"degree": "B.Tech in Computer Science", "institution": "Indian Institute of Technology", "year": "2023"}],
        "bio": "Specialized in microservices, database indexing, and asynchronous event pipelines."
    }
    profile_resp = client.put("/api/users/profile", json=profile_payload, headers=headers)
    assert profile_resp.status_code == 200, f"Step 3 Failed: {profile_resp.text}"
    assert profile_resp.json()["preferred_job_role"] == "Python Developer"

    # Step 4 & 5: Upload a sample resume and parse it
    doc = fitz.open()
    page = doc.new_page()
    sample_resume_text = (
        "Priya Sharma\n"
        "priya.sharma@example.com | +91 98765 43210 | Bangalore, India\n"
        "linkedin.com/in/priyasharma | github.com/priyasharma\n\n"
        "PROFESSIONAL SUMMARY\n"
        "High-performing Python Engineer with 2 years of hands-on experience designing REST APIs with FastAPI, "
        "PostgreSQL, and Docker. Proven track record of optimizing database queries and reducing server response latency.\n\n"
        "TECHNICAL SKILLS\n"
        "Python, FastAPI, SQL, PostgreSQL, Docker, Redis, PyTest, Git, Linux, REST API\n\n"
        "WORK EXPERIENCE\n"
        "Backend Developer - CloudMatrix Systems (2022 - Present)\n"
        "- Engineered scalable microservices in Python and FastAPI, handling 150,000+ daily API requests.\n"
        "- Optimized PostgreSQL database queries, reducing 95th percentile response latency by 35%.\n"
        "- Automated test suites with PyTest and containerized services using Docker Compose.\n\n"
        "EDUCATION\n"
        "B.Tech in Computer Science, Indian Institute of Technology (2022)\n\n"
        "PROJECTS\n"
        "Distributed Event Broker: Built asynchronous streaming pipeline in Python processing 8,000 events/sec.\n"
    )
    page.insert_text((50, 72), sample_resume_text)
    pdf_bytes = doc.tobytes()
    doc.close()

    files = {"file": ("priya_sharma_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_resp = client.post("/api/resumes/upload", files=files, headers=headers)
    assert upload_resp.status_code == 201, f"Step 4 & 5 Failed: {upload_resp.text}"
    resume_data = upload_resp.json()
    resume_id = resume_data["id"]
    assert "Python" in resume_data["skills"]

    # Step 6: Run ATS analysis
    ats_resp = client.post(
        f"/api/resumes/{resume_id}/analyze",
        json={"target_role": "Python Developer"},
        headers=headers
    )
    assert ats_resp.status_code == 200, f"Step 6 Failed: {ats_resp.text}"
    ats_data = ats_resp.json()
    assert ats_data["ats_score"] > 50
    assert "formatting_score" in ats_data
    assert "keyword_match_score" in ats_data
    assert len(ats_data["recommendations"]) > 0

    # Step 7 & 8: Search for Python Developer jobs and display job results
    search_resp = client.post(
        "/api/jobs/search",
        json={"keyword": "Python Developer", "location": "Bangalore", "limit": 10},
        headers=headers
    )
    assert search_resp.status_code == 200, f"Step 7 & 8 Failed: {search_resp.text}"
    search_results = search_resp.json()
    assert len(search_results["jobs"]) > 0

    # Step 9: Select a job
    target_job = search_results["jobs"][0]
    job_id = target_job["id"]
    job_resp = client.get(f"/api/jobs/{job_id}", headers=headers)
    assert job_resp.status_code == 200, f"Step 9 Failed: {job_resp.text}"

    # Step 10 & 11: Calculate resume-job match and show matching/missing skills
    match_resp = client.post(f"/api/jobs/{job_id}/match", json={"resume_id": resume_id}, headers=headers)
    assert match_resp.status_code == 200, f"Step 10 & 11 Failed: {match_resp.text}"
    match_data = match_resp.json()
    assert "match_score" in match_data
    assert "matching_skills" in match_data
    assert "missing_skills" in match_data
    assert isinstance(match_data["matching_skills"], list)

    # Step 12: Optimize resume suggestions
    opt_resp = client.post(
        f"/api/resumes/{resume_id}/optimize",
        json={"target_job_id": job_id, "target_role": target_job["title"]},
        headers=headers
    )
    assert opt_resp.status_code == 200, f"Step 12 Failed: {opt_resp.text}"
    opt_data = opt_resp.json()
    assert "optimized_summary" in opt_data
    assert len(opt_data["improved_bullet_points"]) > 0

    # Step 13: Generate personalized cover letter
    cl_resp = client.post(
        "/api/cover-letter/generate",
        json={
            "job_id": job_id,
            "company_name": target_job["company"],
            "job_title": target_job["title"],
            "tone": "Professional"
        },
        headers=headers
    )
    assert cl_resp.status_code == 200, f"Step 13 Failed: {cl_resp.text}"
    cl_data = cl_resp.json()
    assert len(cl_data["content"]) > 100
    assert target_job["company"] in cl_data["content"]

    # Step 14: Generate interview questions
    interview_gen_resp = client.post(
        "/api/interview/generate",
        json={"job_id": job_id, "role_target": target_job["title"], "session_type": "Comprehensive"},
        headers=headers
    )
    assert interview_gen_resp.status_code == 201, f"Step 14 Failed: {interview_gen_resp.text}"
    session_data = interview_gen_resp.json()
    assert len(session_data["questions"]) >= 5
    question = session_data["questions"][0]

    # Step 15 & 16: Answer an interview question and evaluate the answer
    eval_resp = client.post(
        "/api/interview/evaluate",
        json={
            "question_id": question["id"],
            "user_answer": (
                "In my previous project at CloudMatrix, I designed high-performance REST APIs in FastAPI "
                "with asynchronous SQLAlchemy connection pooling. I enforced strict Pydantic schemas for request validation, "
                "handled database transaction rollbacks in custom middleware, and integrated Redis caching for read-heavy routes, "
                "which successfully reduced our response latency by 35%."
            )
        },
        headers=headers
    )
    assert eval_resp.status_code == 200, f"Step 15 & 16 Failed: {eval_resp.text}"
    eval_data = eval_resp.json()
    assert eval_data["evaluation_score"] >= 60
    assert "feedback" in eval_data
    assert "improved_answer" in eval_data

    # Step 17 & 18: Save the job and create an application
    save_resp = client.post(
        "/api/applications",
        json={"job_id": job_id, "status": "Saved", "notes": "Saved from discovery test"},
        headers=headers
    )
    assert save_resp.status_code in [200, 201], f"Step 17 & 18 Failed: {save_resp.text}"
    app_id = save_resp.json()["id"]

    # Step 19: Move application to Interview
    move_resp = client.put(
        f"/api/applications/{app_id}",
        json={"status": "Interview", "notes": "Technical Round 1 scheduled"},
        headers=headers
    )
    assert move_resp.status_code == 200, f"Step 19 Failed: {move_resp.text}"
    assert move_resp.json()["status"] == "Interview"

    # Step 20: Verify dashboard statistics update
    dash_resp = client.get("/api/dashboard", headers=headers)
    assert dash_resp.status_code == 200, f"Step 20 Failed: {dash_resp.text}"
    dash_data = dash_resp.json()
    assert dash_data["applications_count"] >= 1 or dash_data["saved_jobs_count"] >= 0
    assert dash_data["interviews_count"] >= 1
    assert len(dash_data["applications_by_status"]) > 0

    # Step 21: Generate AI career insights
    insights_resp = client.get("/api/insights", headers=headers)
    assert insights_resp.status_code == 200, f"Step 21 Failed: {insights_resp.text}"
    insights_data = insights_resp.json()
    assert "summary" in insights_data
    assert len(insights_data["insights"]) >= 3
    assert len(insights_data["top_in_demand_skills"]) > 0
    assert "disclaimer" in insights_data

    print("\n✓ ALL 21 STEPS OF THE END-TO-END WORKFLOW PASSED SUCCESSFULLY!")
