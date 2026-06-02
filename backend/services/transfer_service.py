from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from backend.models.models import EventAction, EventStatus, User, Transaction
from backend.models.schemas import TransferStatus

class InsufficientFundsError(Exception):
    pass

class AccountNotFoundError(Exception):
    pass

class TransferService:
    def __init__(self, db: Session):
        self.db = db

    def execute(
        self,
        source_account_id: int,
        target_account_id: int,
        balance_user: int,
        amount: Decimal,
        description: str,
        type_movment: str
    ) -> Transaction:
        """
        Toda la operación ocurre dentro de una sola transacción.
        Si cualquier paso falla, SQLAlchemy hace rollback automático.
        """
        
        try:
            # Bloquear filas con SELECT FOR UPDATE 
            source = (
                self.db.execute(
                    select(User)
                    .where(User.id == source_account_id)
                    .with_for_update()         
                )
                .scalars()
                .first()
            )
            target = (
                self.db.execute(
                    select(User)
                    .where(User.id == target_account_id)
                    .with_for_update()
                )
                .scalars()
                .first()
            )

            # Validaciones 
            if not source:
                raise AccountNotFoundError(f"Cuenta origen {source_account_id} no existe")
            if not target:
                raise AccountNotFoundError(f"Cuenta destino {target_account_id} no existe")
            if amount <= 0:
                raise ValueError("El monto debe ser mayor a cero")
            if source.balance < amount:
                raise InsufficientFundsError(
                    f"Saldo insuficiente: disponible {source.balance}, requerido {amount}"
                )

            # Operación atómica: restar y sumar 
            source.balance -= amount
            target.balance += amount

            # Registrar la transferencia 
            transfer = Transaction(
                user_id = source_account_id,
                target_user_id = target_account_id,
                amount = amount,
                balance_after = balance_user - amount,
                description = description,
                type = type_movment
            )
            self.db.add(transfer)

            # Commit
            self.db.commit()
            self.db.refresh(transfer)
            return transfer

        except (InsufficientFundsError, AccountNotFoundError, ValueError):
            self.db.rollback()
            raise  

        except Exception as e:
            self.db.rollback()
            raise RuntimeError(f"Error inesperado en transferencia: {e}") from e