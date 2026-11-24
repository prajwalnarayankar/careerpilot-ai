def test_register_and_login(client):
    # 1. Register new account
    reg_payload = {
        "email": "jane.developer@example.com",
        "password": "Password123!",
        "full_name": "Jane Developer"
    }
    resp = client.post("/api/auth/register", json=reg_payload)
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert data["email"] == "jane.developer@example.com"

    # 2. Reject duplicate registration
    resp_dup = client.post("/api/auth/register", json=reg_payload)
    assert resp_dup.status_code == 409

    # 3. Successful login
    login_payload = {
        "email": "jane.developer@example.com",
        "password": "Password123!"
    }
    resp_login = client.post("/api/auth/login", json=login_payload)
    assert resp_login.status_code == 200
    token = resp_login.json()["access_token"]
    assert token

    # 4. Invalid credentials
    bad_login = {
        "email": "jane.developer@example.com",
        "password": "WrongPassword!"
    }
    resp_bad = client.post("/api/auth/login", json=bad_login)
    assert resp_bad.status_code == 401

    # 5. Access protected route
    headers = {"Authorization": f"Bearer {token}"}
    resp_me = client.get("/api/auth/me", headers=headers)
    assert resp_me.status_code == 200
    assert resp_me.json()["email"] == "jane.developer@example.com"
