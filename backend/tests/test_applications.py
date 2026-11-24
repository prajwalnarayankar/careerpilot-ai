def test_application_kanban_flow(client, auth_headers):
    # 1. Get a job
    jobs_resp = client.get("/api/jobs", headers=auth_headers)
    job_id = jobs_resp.json()["jobs"][0]["id"]

    # 2. Save job as application
    create_resp = client.post(
        "/api/applications",
        json={"job_id": job_id, "status": "Saved", "notes": "Saved for review"},
        headers=auth_headers
    )
    assert create_resp.status_code == 201
    app_id = create_resp.json()["id"]
    assert create_resp.json()["status"] == "Saved"

    # 3. Move application to "Interview"
    update_resp = client.put(
        f"/api/applications/{app_id}",
        json={"status": "Interview", "notes": "First round scheduled for Monday"},
        headers=auth_headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["status"] == "Interview"

    # 4. Check Kanban board
    kanban_resp = client.get("/api/applications/kanban", headers=auth_headers)
    assert kanban_resp.status_code == 200
    columns = kanban_resp.json()
    assert len(columns) == 6
    interview_col = next((c for c in columns if c["status"] == "Interview"), None)
    assert interview_col is not None
    assert interview_col["count"] >= 1
