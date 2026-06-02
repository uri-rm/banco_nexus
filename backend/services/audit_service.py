import json
from sqlalchemy.orm import Session
from backend.models.models import AuditLog
from backend.models.schemas import EventAction, EventStatus, AuditLogCreate

class AuditService:
    def __init__(self, db: Session):
        self.db = db

    def log(self, event: AuditLog):
        audit = AuditLog(
            user_id=event.user_id,
            username=event.username,
            action=event.action,
            status=event.status,
            detail=event.detail,
            user_involved=event.user_involved
        )
        self.db.add(audit)
        self.db.commit()

    def login_failed(self, username: str, **client):
        self.log(AuditLogCreate(
            action=EventAction.LOGIN_FAILED,
            status=EventStatus.FAILED,
            username=username,
            detail="credenciales inválidas",
            **client
        ))

    def login_success(self, user, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.LOGIN_SUCCESS,
            status=EventStatus.SUCCESS,
            **client
        ))

    def logout(self, user, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.LOGOUT,
            status=EventStatus.SUCCESS,
            **client
        ))

    def account_created(self, user, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.ACCOUNT_CREATED,
            status=EventStatus.SUCCESS,
            **client
        ))

    def transfer_failed(self, user, detail: str, **client):
        self.log(AuditLogCreate(
            user_id=user.id if user else None,
            username=user.username if user else None,
            action=EventAction.TRANSFER_REJECTED,
            status=EventStatus.FAILED,
            detail=detail,
            **client
        ))

    def transfer_approved(self, user, detail: dict, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.TRANSFER_APPROVED,
            status=EventStatus.SUCCESS,
            detail=detail,
            **client
        ))

    def transfer_accepted(self, user, detail: dict, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.TRANSFER_ACCEPTED,
            status=EventStatus.SUCCESS,
            detail=detail,
            **client
        ))
        
    def deposit(self, user, detail: str, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.DEPOSIT,
            status=EventStatus.SUCCESS,
            detail=detail,
            **client
        ))

    def withdrawal(self, user, detail: str, **client):
        self.log(AuditLogCreate(
            user_id=user.id,
            username=user.username,
            action=EventAction.WITHDRAWAL,
            status=EventStatus.SUCCESS,
            detail=detail,
            **client
        ))