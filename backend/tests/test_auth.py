import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlmodel.pool import StaticPool

# POST /auth/register
PAYLOAD = {"username": "Ana Ruiz", "email": "ana@nexus.com", "password": "secret123"}

def test_register_success(client):
    res = client.post("/auth/register", json=PAYLOAD)
    assert res.status_code == 201
    body = res.json()
    assert body["email"]   == "ana@nexus.com"
    assert body["username"]    == "Ana Ruiz"
    assert body["balance"] == 0.0
    assert body["number"].startswith("180")

def test_register_duplicate(client):
    client.post("/auth/register", json=PAYLOAD)
    res = client.post("/auth/register", json=PAYLOAD)
    assert res.status_code == 409

def test_register_invalid_email(client):
    res = client.post("/auth/register", json={**PAYLOAD, "email": "not-an-email"})
    assert res.status_code == 422

def test_register_missing_fields(client):
    res = client.post("/auth/register", json={"username": "Ana"})
    assert res.status_code == 422

# POST /auth/token
def test_auth_success(client):
    client.post("/auth/register", json=PAYLOAD)
    res = client.post("/auth/token", json={"email": "ana@nexus.com", "password": "secret123"})
    assert res.status_code == 200
    body = res.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "ana@nexus.com"

def test_auth_user_not_found(client):
    res = client.post("/auth/token", json={"email": "ghost@nexus.com", "password": "secret123"})
    assert res.status_code == 404

def test_auth_wrong_password(client):
    client.post("/auth/register", json=PAYLOAD)
    res = client.post("/auth/token", json={"email": "ana@nexus.com", "password": "wrongpass"})
    assert res.status_code == 401