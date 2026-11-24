def test_interview_preparation_and_evaluation(client, auth_headers):
    # 1. Generate interview questions
    gen_payload = {
        "role_target": "Python Backend Developer",
        "session_type": "Comprehensive"
    }
    gen_resp = client.post("/api/interview/generate", json=gen_payload, headers=auth_headers)
    assert gen_resp.status_code == 201
    session_data = gen_resp.json()
    assert "questions" in session_data
    assert len(session_data["questions"]) >= 5
    
    first_question = session_data["questions"][0]
    question_id = first_question["id"]

    # 2. Submit candidate answer
    eval_payload = {
        "question_id": question_id,
        "user_answer": (
            "I design APIs by adhering strictly to REST principles and OpenAPI contracts. "
            "In FastAPI, I declare Pydantic schemas for request and response models to enforce validation at runtime. "
            "I use SQLAlchemy 2.0 with asynchronous engine connection pooling (NullPool or QueuePool) and implement "
            "custom exception handlers to standardize error payloads."
        )
    }
    eval_resp = client.post("/api/interview/evaluate", json=eval_payload, headers=auth_headers)
    assert eval_resp.status_code == 200
    eval_data = eval_resp.json()
    assert eval_data["evaluation_score"] >= 60
    assert "feedback" in eval_data
    assert "improved_answer" in eval_data
    assert len(eval_data["strengths"]) > 0

    # 3. Verify Dashboard stats reflect the new activity
    dash_resp = client.get("/api/dashboard", headers=auth_headers)
    assert dash_resp.status_code == 200
    dash_data = dash_resp.json()
    assert dash_data["interviews_count"] >= 1
    assert "applications_by_status" in dash_data
