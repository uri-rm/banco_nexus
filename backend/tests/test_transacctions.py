import pytest
from fastapi.testclient import TestClient
from sqlmodel import select
from random import randint
from backend.models.models import User


@pytest.fixture()
def get_user(client: TestClient, session):
    num = randint(1, 1000000)

    res = client.post("/auth/register", json={
        "username": f"juan{num}",
        "email": f"juan{num}@example.com",
        "password": "password1234"
    })

    assert res.status_code in (200, 201)

    user = session.exec(
        select(User).where(User.email == f"juan{num}@example.com")
    ).first()

    user.balance = 1000
    session.add(user)
    session.commit()
    session.refresh(user)

    return res.json()


@pytest.fixture()
def get_destiny_user(client: TestClient):
    num = randint(1, 1000000)

    res = client.post("/auth/register", json={
        "username": f"maria{num}",
        "email": f"maria{num}@example.com",
        "password": "password1234"
    })

    assert res.status_code in (200, 201)

    return res.json()


@pytest.fixture()
def get_user_token(client: TestClient, session):
    num = randint(1, 1000000)

    res = client.post("/auth/register", json={
        "username": f"juan{num}",
        "email": f"juan{num}@example.com",
        "password": "password1234"
    })

    assert res.status_code in (200, 201)

    user = session.exec(
        select(User).where(User.email == f"juan{num}@example.com")
    ).first()

    user.balance = 1000
    session.add(user)
    session.commit()
    session.refresh(user)

    login_res = client.post("/auth/token", json={
        "email": f"juan{num}@example.com",
        "password": "password1234"
    })

    assert login_res.status_code == 200

    return {
        "token": login_res.json()["access_token"],
        "user": res.json()
    }


class TestReadTransactions:

    def test_success_empty(self, client, get_token):
        headers = {"Authorization": f"Bearer {get_token}"}

        res = client.get("/transactions/", headers=headers)

        assert res.status_code == 200
        assert res.json() == []

    def test_unauthorized(self, client):
        res = client.get("/transactions/")

        assert res.status_code == 401


class TestWriteTransaction:

    def test_transfer_success(
        self,
        client,
        get_user_token,
        get_destiny_user,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            f"/transactions/{get_destiny_user['number']}",
            json={
                "type": "deposit",
                "amount": 200.0,
                "description": "Transfer test"
            },
            headers=headers
        )

        assert res.status_code == 201

        data = res.json()
        assert data["amount"] == 200.0
        assert data["type"] == "deposit"

    def test_insufficient_balance(
        self,
        client,
        get_destiny_user,
        get_token
    ):
        headers = {"Authorization": f"Bearer {get_token}"}

        res = client.post(
            f"/transactions/{get_destiny_user['number']}",
            json={
                "type": "deposit",
                "amount": 9999.0,
                "description": "Too much"
            },
            headers=headers
        )

        assert res.status_code == 400
        assert res.json()["detail"] == "Insufficient balance"

    def test_invalid_type(
        self,
        client,
        get_user_token,
        get_destiny_user,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            f"/transactions/{get_destiny_user['number']}",
            json={
                "type": "withdrawal",
                "amount": 100.0,
                "description": "Invalid"
            },
            headers=headers
        )

        assert res.status_code == 422

    def test_destiny_account_not_found(
        self,
        client,
        get_user_token,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            "/transactions/999999999",
            json={
                "type": "deposit",
                "amount": 100.0,
                "description": "Invalid account"
            },
            headers=headers
        )

        assert res.status_code == 404

    def test_transaction_appears_in_get(
        self,
        client,
        get_user_token,
        get_destiny_user,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        client.post(
            f"/transactions/{get_destiny_user['number']}",
            json={
                "type": "deposit",
                "amount": 100.0,
                "description": "Transfer"
            },
            headers=headers
        )

        res = client.get("/transactions/", headers=headers)

        assert res.status_code == 200
        assert len(res.json()) == 1

    def test_deposit_to_self_success(
        self,
        client,
        get_user_token,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            "/transactions/",
            json={
                "type": "deposit",
                "amount": 150.0,
                "description": "Self deposit"
            },
            headers=headers
        )

        assert res.status_code == 201
        data = res.json()
        assert data["amount"] == 150.0
        assert data["type"] == "deposit"
        assert data["balance_after"] == 1150.0

    def test_deposit_to_self_without_description(self,
        client,
        get_user_token,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            "/transactions/",
            json={
                "type": "deposit",
                "amount": 120.0
            },
            headers=headers
        )

        assert res.status_code == 201
        data = res.json()
        assert data["amount"] == 120.0
        assert data["type"] == "deposit"
        assert data["balance_after"] == 1120.0

    def test_withdrawal_to_self_success(
        self,
        client,
        get_user_token,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            "/transactions/",
            json={
                "type": "withdrawal",
                "amount": 250.0,
                "description": "Self withdrawal"
            },
            headers=headers
        )

        assert res.status_code == 201
        data = res.json()
        assert data["amount"] == 250.0
        assert data["type"] == "withdrawal"
        assert data["balance_after"] == 750.0

    def test_withdrawal_to_self_insufficient_balance(
        self,
        client,
        get_user_token,
    ):
        headers = {"Authorization": f"Bearer {get_user_token['token']}"}

        res = client.post(
            "/transactions/",
            json={
                "type": "withdrawal",
                "amount": 2500.0,
                "description": "Too much withdrawal"
            },
            headers=headers
        )

        assert res.status_code == 400
        assert res.json()["detail"] == "Insufficient balance"

    def test_unauthorized(
        self,
        client,
        get_destiny_user
    ):
        res = client.post(
            f"/transactions/{get_destiny_user['number']}",
            json={
                "type": "deposit",
                "amount": 100.0,
                "description": "Unauthorized"
            }
        )

        assert res.status_code == 401