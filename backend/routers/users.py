from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from backend.db import get_db
from backend.models.schemas import AddDestinyAccountRequest, UserUpdateRequest, UserResponse, DestinyAccountResponse
from backend.models.models import User, DestinyAccount
from sqlmodel import Session, select
from backend.security.hasher import hash_password
from backend.security.auth import get_current_user
from backend.helpers.validation import validate_account_number

router = APIRouter(prefix="/users")

@router.get("/me", status_code=200, response_model=UserResponse)
async def read_user(session: Session = Depends(get_db),
                    current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", status_code=200, response_model=UserResponse)
async def update_user(data: UserUpdateRequest,
                      session: Session = Depends(get_db),
                      current_user: User = Depends(get_current_user)):
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(detail="User not found", status_code=404)

    if data.username: user.username = data.username
    if data.email:
        existing = session.exec(select(User).where(User.email == data.email)).first()
        if existing and existing.id != current_user.id:
            raise HTTPException(detail="Email already in use", status_code=409)
        user.email = data.email
    if data.password: user.password = hash_password(data.password)

    session.commit()
    session.refresh(user)
    return user

@router.post("/add_account/{num_destiny_account}", status_code=201, response_model=UserResponse)
async def add_destiny_account(num_destiny_account: str,
                              data: AddDestinyAccountRequest,
                              session: Session = Depends(get_db),
                              current_user: User = Depends(get_current_user)):
    if num_destiny_account == current_user.number:
        raise HTTPException(detail="No puedes agregar tu propia cuenta como destino", status_code=400)
    
    if not validate_account_number(num_destiny_account):
        raise HTTPException(detail="Invalid account number", status_code=400)

    destiny_user = session.exec(
        select(User).where(User.number == num_destiny_account)
    ).first()
    if not destiny_user:
        raise HTTPException(detail="Destiny account not found", status_code=404)

    existing_account = session.exec(
        select(DestinyAccount)
        .where(DestinyAccount.user_id == current_user.id)
        .where(DestinyAccount.number_user == num_destiny_account)
    ).first()
    if existing_account:
        raise HTTPException(detail="Destiny account already added", status_code=409)

    new_account = DestinyAccount(
        name=data.name.strip() or destiny_user.username or 'Cuenta destino',
        number_user=num_destiny_account,
        user_id=current_user.id,
    )
    session.add(new_account)
    session.commit()
    session.refresh(new_account)

    session.refresh(current_user)
    return current_user

@router.get("/destiny_accounts", status_code=200, response_model=list[DestinyAccountResponse])
async def get_destiny_accounts(session: Session = Depends(get_db),
                               current_user: User = Depends(get_current_user)):
    accounts = session.exec(
        select(DestinyAccount).where(DestinyAccount.user_id == current_user.id)
    ).all()
    return accounts

@router.delete("/remove_account/{num_destiny_account}", status_code=200, response_model=UserResponse)
async def remove_destiny_account(num_destiny_account: str, 
                                session: Session = Depends(get_db),
                                current_user: User = Depends(get_current_user)):
    account = session.exec(
        select(DestinyAccount)
        .where(DestinyAccount.user_id == current_user.id)
        .where(DestinyAccount.number_user == num_destiny_account)
    ).first()
    if not account:
        raise HTTPException(detail="Destiny account not found", status_code=404)

    session.delete(account)
    session.commit()
    session.refresh(current_user)
    return current_user

