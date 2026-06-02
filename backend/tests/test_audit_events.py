import pytest
from unittest.mock import MagicMock
from backend.services.audit_service import AuditService
from backend.models.schemas import EventAction, EventStatus

# Fixtures
@pytest.fixture()
def db():
    return MagicMock()

@pytest.fixture()
def service(db):
    return AuditService(db)

@pytest.fixture()
def fake_user():
    user = MagicMock()
    user.id = 1
    user.username = "juan"
    return user

# Tests
class TestLog:
    def test_adds_and_commits(self, service, db, fake_user):
        service.login_success(fake_user)
        db.add.assert_called_once()
        db.commit.assert_called_once()


class TestLoginFailed:
    def test_action_and_status(self, service, db):
        service.login_failed("juan")
        saved = db.add.call_args[0][0]
        assert saved.action   == EventAction.LOGIN_FAILED
        assert saved.status   == EventStatus.FAILED
        assert saved.username == "juan"

    def test_detail(self, service, db):
        service.login_failed("juan")
        saved = db.add.call_args[0][0]
        assert saved.detail == "credenciales inválidas"


class TestLoginSuccess:
    def test_action_and_status(self, service, db, fake_user):
        service.login_success(fake_user)
        saved = db.add.call_args[0][0]
        assert saved.action   == EventAction.LOGIN_SUCCESS
        assert saved.status   == EventStatus.SUCCESS
        assert saved.user_id  == fake_user.id
        assert saved.username == fake_user.username


class TestLogout:
    def test_action_and_status(self, service, db, fake_user):
        service.logout(fake_user)
        saved = db.add.call_args[0][0]
        assert saved.action  == EventAction.LOGOUT
        assert saved.status  == EventStatus.SUCCESS
        assert saved.user_id == fake_user.id


class TestAccountCreated:
    def test_action_and_status(self, service, db, fake_user):
        service.account_created(fake_user)
        saved = db.add.call_args[0][0]
        assert saved.action  == EventAction.ACCOUNT_CREATED
        assert saved.status  == EventStatus.SUCCESS
        assert saved.user_id == fake_user.id


class TestTransferApproved:
    def test_action_and_status(self, service, db, fake_user):
        service.transfer_approved(fake_user, "500.0 a acc_002")
        saved = db.add.call_args[0][0]
        assert saved.action == EventAction.TRANSFER_APPROVED
        assert saved.status == EventStatus.SUCCESS

    def test_detail(self, service, db, fake_user):
        service.transfer_approved(fake_user, "500.0 a acc_002")
        saved = db.add.call_args[0][0]
        assert saved.detail == "500.0 a acc_002"


class TestTransferAccepted:
    def test_action_and_status(self, service, db, fake_user):
        service.transfer_accepted(fake_user, "200.0 de acc_001")
        saved = db.add.call_args[0][0]
        assert saved.action == EventAction.TRANSFER_ACCEPTED
        assert saved.status == EventStatus.SUCCESS

    def test_detail(self, service, db, fake_user):
        service.transfer_accepted(fake_user, "200.0 de acc_001")
        saved = db.add.call_args[0][0]
        assert saved.detail == "200.0 de acc_001"