import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from sqlalchemy.pool import StaticPool
from backend.main import app
from backend.db import get_db
from random import randint
from fastapi_pagination import add_pagination

# Database in memory
DATABASE_URL = "sqlite://"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# Fixture to create db
@pytest.fixture(name="session")
def session_fixture():
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)

# Dependency
@pytest.fixture(name="client")
def client_fixture(session: Session):

    def get_session_override():
        return session

    app.dependency_overrides[get_db] = get_session_override

    with TestClient(app) as client:
        yield client

    app.dependency_overrides.clear()

@pytest.fixture()
def get_token(client: TestClient):
    num = randint(1, 1000000)

    reg = client.post("/auth/register", json={
        "username": f"juan{num}",
        "email":    f"juan{num}@example.com",
        "password": "password1234"
    })
    assert reg.status_code in (200, 201), f"Register failed: {reg.json()}"

    response = client.post("/auth/token", json={
        "email":    f"juan{num}@example.com",
        "password": "password1234"
    })
    assert response.status_code == 200, f"Login failed: {response.json()}"

    return response.json()["access_token"]
