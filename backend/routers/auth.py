from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from backend.db import get_db
from backend.models.schemas import LoginRequest, RegisterRequest, UserResponse, TokenResponse, UserCreatedResponse
from backend.models.models import User
from sqlmodel import Session, select
from backend.security.hasher import verify_password, hash_password
from backend.security.auth import create_access_token
from backend.helpers.validation import validate_email
from backend.services.audit_service import AuditService

router = APIRouter(prefix="/auth")

# Helpers
def generate_account_number(user_id: int) -> str:
    base = f"180{user_id:06d}"
    check_digit = sum(int(d) for d in base) % 10
    return base + str(check_digit)

# Routes
@router.post("/token", status_code=200, response_model=TokenResponse)
async def auth(data: LoginRequest,
               background_tasks: BackgroundTasks,
               session: Session = Depends(get_db)):
    audit = AuditService(session)

    user = session.exec(select(User).where(User.email == data.email)).first()
    if not user:
        raise HTTPException(detail="User doesn't exist", status_code=404)

    if not verify_password(data.password, user.password):
        audit.login_failed(data.email)
        raise HTTPException(detail="Invalid credentials", status_code=401)

    token = create_access_token(data={"sub": user.email})
    background_tasks.add_task(audit.login_success, user)

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            number=user.number,
            balance=user.balance
        )
    )

@router.post("/register", status_code=201, response_model=UserCreatedResponse)
async def register(data: RegisterRequest,
                   background_tasks: BackgroundTasks,
                   session: Session = Depends(get_db)):
    audit = AuditService(session)

    existing = session.exec(select(User).where(User.email == data.email)).first()
    if existing:
        raise HTTPException(detail="User already exists", status_code=409)

    if not validate_email(data.email):
        raise HTTPException(detail="Invalid email", status_code=422)

    new_user = User(
        username=data.username,
        email=data.email,
        password=hash_password(data.password),
        number="pending",
        balance=0.0
    )
    session.add(new_user)
    session.commit()
    session.refresh(new_user)

    new_user.number = generate_account_number(new_user.id)
    session.commit()
    session.refresh(new_user)

    background_tasks.add_task(audit.account_created, new_user)

    return UserCreatedResponse(
        id=new_user.id,
        username=new_user.username,
        email=new_user.email,
        number=new_user.number,
        balance=new_user.balance
    )