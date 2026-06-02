import pytest

# Users
class TestReadUser:
    def test_success(self, client, get_token):
        headers = {"Authorization": f"Bearer {get_token}"}
        res = client.get("/users/me", headers=headers)
        assert res.status_code == 200

    def test_unauthorized(self, client):
        res = client.get("/users/me")
        assert res.status_code == 401


class TestUpdateUser:
    def test_update_username(self, client, get_token):
        headers = {"Authorization": f"Bearer {get_token}"}
        res = client.put("/users/me", json={"username": "updated_user"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["username"] == "updated_user"

    def test_update_email(self, client, get_token):
        headers = {"Authorization": f"Bearer {get_token}"}
        res = client.put("/users/me", json={"email": "new@nexus.com"}, headers=headers)
        assert res.status_code == 200
        assert res.json()["email"] == "new@nexus.com"

    def test_update_duplicate_email(self, client, get_token):
        headers = {"Authorization": f"Bearer {get_token}"}
        client.post("/auth/register", json={
            "username": "luis", "email": "luis@nexus.com", "password": "secret123"
        })
        res = client.put("/users/me", json={"email": "luis@nexus.com"}, headers=headers)
        assert res.status_code == 409

    def test_update_unauthorized(self, client):
        res = client.put("/users/me", json={"username": "Hacker"})
        assert res.status_code == 401