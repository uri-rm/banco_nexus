from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from backend.db import get_db
from backend.models.schemas import TransactionResponse, TransactionRequest
from backend.models.models import Transaction, User
from sqlmodel import Session, select
from backend.security.auth import get_current_user
from backend.services.transfer_service import TransferService
from backend.services.audit_service import AuditService
from backend.helpers.validation import validate_account_number

router = APIRouter(prefix="/transactions")

@router.get("/", status_code=200, response_model=list[TransactionResponse])
async def read_transactions(session: Session = Depends(get_db),
                            current_user: User = Depends(get_current_user)):
    transactions = session.exec(
        select(Transaction).where(Transaction.user_id == current_user.id)
    ).all()
    return transactions

@router.post("/{num_destiny_account}", status_code=201, response_model=TransactionResponse)
async def write_transaction_for_another_user(data: TransactionRequest,
                            num_destiny_account: str,   
                             background_tasks: BackgroundTasks,
                             session: Session = Depends(get_db),
                             current_user: User = Depends(get_current_user)):
    audit = AuditService(session)

    if not validate_account_number(num_destiny_account):
        user = session.get(User, current_user.id)
        audit.transfer_failed(user, f"cuenta destino mal formada: {num_destiny_account}")
        raise HTTPException(detail="Número de cuenta inválido", status_code=400)

    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(detail="User not found", status_code=404)

    destiny_user = session.exec(
        select(User).where(User.number == num_destiny_account)
    ).first()
    if not destiny_user:
        audit.transfer_failed(user, f"cuenta destino no encontrada: {num_destiny_account}")
        raise HTTPException(detail="Num typed doesnt correspond to any user", status_code=404)

    if user.balance < data.amount:
        audit.transfer_failed(user, f"saldo insuficiente: monto {data.amount}, saldo {user.balance}")
        raise HTTPException(detail="Insufficient balance", status_code=400)

    new_transaction = None
    if data.type == "deposit":
        ts = TransferService(session)
        new_transaction = ts.execute(
            target_account_id=destiny_user.id,
            source_account_id=user.id,
            amount=data.amount,
            balance_user=user.balance,
            description=data.description,
            type_movment=data.type
        )
    else:
        audit.transfer_failed(user, f"tipo de operación inválido: {data.type}")
        raise HTTPException(detail="Type of action invalid", status_code=422)

    detail = f"{data.type} de {data.amount} - balance: {user.balance}"
    background_tasks.add_task(audit.transfer_approved, user, detail)

    return new_transaction


@router.post("/", status_code=201, response_model=TransactionResponse)
async def write_transaction_for_same_user(data: TransactionRequest,
                            background_tasks: BackgroundTasks,
                             session: Session = Depends(get_db),
                             current_user: User = Depends(get_current_user)):
    audit = AuditService(session)

    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(detail="User not found", status_code=404)

    if data.type == "deposit":
        user.balance += data.amount
    elif data.type == "withdrawal":
        if user.balance < data.amount:
            audit.transfer_failed(user, f"saldo insuficiente: monto {data.amount}, saldo {user.balance}")
            raise HTTPException(detail="Insufficient balance", status_code=400)
        user.balance -= data.amount
    else:
        audit.transfer_failed(user, f"tipo de operación inválido: {data.type}")
        raise HTTPException(detail="Type of action invalid", status_code=422)

    new_transaction = Transaction(
        amount=data.amount,
        description=data.description or f"{data.type} a mi mismo",
        type=data.type,
        balance_after=user.balance,
        user_id=user.id
    )
    session.add(new_transaction)
    session.commit()
    session.refresh(new_transaction)

    detail = f"{data.type} de {data.amount} - balance: {user.balance}"
    background_tasks.add_task(audit.transfer_approved, user, detail)

    return new_transaction