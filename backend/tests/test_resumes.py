import io
import fitz

def test_resume_upload_and_ats_analysis(client, auth_headers):
    # 1. Create a dummy PDF in-memory
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Jane Developer\njane.dev@example.com | +1 555-0199 | github.com/janedev\n\nPROFESSIONAL SUMMARY\nDedicated Python Engineer with 2 years of experience developing microservices.\n\nSKILLS\nPython, FastAPI, SQL, Docker, Git, REST API, Redis, PyTest\n\nEXPERIENCE\nSoftware Engineer - TechCorp (2022 - Present)\n- Engineered high-throughput REST APIs using FastAPI, reducing response latency by 35%.\n- Architected PostgreSQL database schemas and optimized indexing queries.\n- Automated CI/CD deployment pipelines using GitHub Actions.\n\nEDUCATION\nB.Tech in Computer Science, University Institute (2022)\n")
    pdf_bytes = doc.tobytes()
    doc.close()

    # 2. Upload the PDF
    files = {"file": ("test_resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    upload_resp = client.post("/api/resumes/upload", files=files, headers=auth_headers)
    assert upload_resp.status_code == 201
    resume_data = upload_resp.json()
    assert resume_data["candidate_name"] == "Jane Developer"
    assert "Python" in resume_data["skills"]
    assert "latest_analysis" in resume_data
    assert resume_data["latest_analysis"]["ats_score"] > 50

    resume_id = resume_data["id"]

    # 3. Optimize resume suggestions
    opt_resp = client.post(
        f"/api/resumes/{resume_id}/optimize",
        json={"target_role": "Senior Python Developer"},
        headers=auth_headers
    )
    assert opt_resp.status_code == 200
    opt_data = opt_resp.json()
    assert "optimized_summary" in opt_data
    assert len(opt_data["improved_bullet_points"]) > 0

    # 4. Match resume with a job
    jobs_resp = client.get("/api/jobs", headers=auth_headers)
    job_id = jobs_resp.json()["jobs"][0]["id"]
    match_resp = client.post(f"/api/jobs/{job_id}/match", json={}, headers=auth_headers)
    assert match_resp.status_code == 200
    match_data = match_resp.json()
    assert "match_score" in match_data
    assert "matching_skills" in match_data
