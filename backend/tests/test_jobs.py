def test_jobs_api_and_search(client, auth_headers):
    # 1. Fetch initial jobs
    resp = client.get("/api/jobs", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "jobs" in data
    assert len(data["jobs"]) > 0

    # 2. Search for Python jobs
    search_resp = client.post(
        "/api/jobs/search",
        json={"keyword": "Python", "location": "Bangalore", "limit": 10},
        headers=auth_headers
    )
    assert search_resp.status_code == 200
    search_data = search_resp.json()
    assert len(search_data["jobs"]) > 0
    assert any("Python" in j["title"] for j in search_data["jobs"])

    # 3. Retrieve single job
    job_id = search_data["jobs"][0]["id"]
    get_job = client.get(f"/api/jobs/{job_id}", headers=auth_headers)
    assert get_job.status_code == 200
    assert get_job.json()["id"] == job_id
