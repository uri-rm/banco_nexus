from datetime import datetime, timezone, timedelta
from decimal import Decimal
from sqlmodel import Session, select
from sqlalchemy import delete
from backend.db import engine, create_db
from backend.models.models import User, Transaction, DestinyAccount, AuditLog
from backend.models.schemas import TransactionType, EventAction, EventStatus
from backend.security.hasher import hash_password


def generate_account_number(user_id: int) -> str:
    base = f"180{user_id:06d}"
    check_digit = sum(int(d) for d in base) % 10
    return base + str(check_digit)


def utc(days_ago: int, hour: int = 10, minute: int = 0) -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=days_ago, hours=-hour, minutes=-minute)


def seed():
    create_db()

    with Session(engine) as session:
        # Limpia tablas en orden correcto (FK: audit_logs y transactions antes que users)
        session.execute(delete(AuditLog))
        session.execute(delete(Transaction))
        session.execute(delete(DestinyAccount))
        session.execute(delete(User))
        session.commit()

        # --- Usuarios ---
        usuarios_data = [
            {"username": "ana_ruiz",      "email": "ana@nexus.com",      "password": "Ana1234!",    "balance": 5000.00},
            {"username": "luis_perez",    "email": "luis@nexus.com",     "password": "Luis1234!",   "balance": 8000.00},
            {"username": "maria_gzz",     "email": "maria@nexus.com",    "password": "Maria1234!",  "balance": 12000.00},
            {"username": "carlos_hdz",    "email": "carlos@nexus.com",   "password": "Carlos1234!", "balance": 3500.00},
            {"username": "sofia_torres",  "email": "sofia@nexus.com",    "password": "Sofia1234!",  "balance": 7200.00},
        ]

        users = []
        for data in usuarios_data:
            user = User(
                username=data["username"],
                email=data["email"],
                password=hash_password(data["password"]),
                number="pending",
                balance=data["balance"],
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            user.number = generate_account_number(user.id)
            session.commit()
            session.refresh(user)
            users.append(user)

        ana, luis, maria, carlos, sofia = users

        # --- Cuentas destino (contactos guardados) ---
        destiny_accounts = [
            DestinyAccount(name="Luis Pérez",    number_user=luis.number,   user_id=ana.id),
            DestinyAccount(name="María González", number_user=maria.number,  user_id=ana.id),
            DestinyAccount(name="Ana Ruiz",       number_user=ana.number,    user_id=luis.id),
            DestinyAccount(name="Carlos Hdz",     number_user=carlos.number, user_id=sofia.id),
        ]
        for da in destiny_accounts:
            session.add(da)
        session.commit()

        # --- Transacciones ---
        transactions = [
            # Ana: depósito inicial + transferencia a Luis
            Transaction(user_id=ana.id, type=TransactionType.DEPOSIT,    amount=Decimal("2500"), balance_after=Decimal("5000"), description="Depósito nómina",        date=utc(10)),
            Transaction(user_id=ana.id, type=TransactionType.WITHDRAWAL,  amount=Decimal("400"),  balance_after=Decimal("4600"), description="Pago de servicios",      date=utc(8)),
            Transaction(user_id=ana.id, type=TransactionType.TRANSFER,    amount=Decimal("500"),  balance_after=Decimal("4100"), description=f"Transferencia a {luis.number}", date=utc(5), target_user_id=luis.id),

            # Luis: recibe transferencia + retiro
            Transaction(user_id=luis.id, type=TransactionType.DEPOSIT,   amount=Decimal("3000"), balance_after=Decimal("8000"), description="Depósito nómina",        date=utc(12)),
            Transaction(user_id=luis.id, type=TransactionType.TRANSFER,   amount=Decimal("500"),  balance_after=Decimal("8500"), description=f"Recibido de {ana.number}", date=utc(5), target_user_id=ana.id),
            Transaction(user_id=luis.id, type=TransactionType.WITHDRAWAL, amount=Decimal("650"),  balance_after=Decimal("7850"), description="Compra en tienda",       date=utc(3)),

            # María
            Transaction(user_id=maria.id, type=TransactionType.DEPOSIT,  amount=Decimal("5000"), balance_after=Decimal("12000"), description="Depósito nómina",       date=utc(15)),
            Transaction(user_id=maria.id, type=TransactionType.WITHDRAWAL,amount=Decimal("800"),  balance_after=Decimal("11200"), description="Pago renta",            date=utc(7)),
            Transaction(user_id=maria.id, type=TransactionType.WITHDRAWAL,amount=Decimal("300"),  balance_after=Decimal("10900"), description="Restaurante",           date=utc(2)),

            # Carlos
            Transaction(user_id=carlos.id, type=TransactionType.DEPOSIT, amount=Decimal("1500"), balance_after=Decimal("3500"), description="Depósito en ventanilla", date=utc(9)),
            Transaction(user_id=carlos.id, type=TransactionType.WITHDRAWAL,amount=Decimal("200"), balance_after=Decimal("3300"), description="Retiro en cajero",       date=utc(6)),

            # Sofía
            Transaction(user_id=sofia.id, type=TransactionType.DEPOSIT,  amount=Decimal("2200"), balance_after=Decimal("7200"), description="Transferencia recibida",  date=utc(11)),
            Transaction(user_id=sofia.id, type=TransactionType.WITHDRAWAL,amount=Decimal("500"),  balance_after=Decimal("6700"), description="Compra en línea",        date=utc(4)),
        ]
        for tx in transactions:
            session.add(tx)
        session.commit()

        # --- Audit logs ---
        audit_logs = [
            AuditLog(user_id=ana.id,    username=ana.username,    action=EventAction.ACCOUNT_CREATED,   status=EventStatus.SUCCESS, detail="Cuenta creada",             timestamp=utc(10)),
            AuditLog(user_id=luis.id,   username=luis.username,   action=EventAction.ACCOUNT_CREATED,   status=EventStatus.SUCCESS, detail="Cuenta creada",             timestamp=utc(12)),
            AuditLog(user_id=maria.id,  username=maria.username,  action=EventAction.ACCOUNT_CREATED,   status=EventStatus.SUCCESS, detail="Cuenta creada",             timestamp=utc(15)),
            AuditLog(user_id=carlos.id, username=carlos.username, action=EventAction.ACCOUNT_CREATED,   status=EventStatus.SUCCESS, detail="Cuenta creada",             timestamp=utc(9)),
            AuditLog(user_id=sofia.id,  username=sofia.username,  action=EventAction.ACCOUNT_CREATED,   status=EventStatus.SUCCESS, detail="Cuenta creada",             timestamp=utc(11)),
            AuditLog(user_id=ana.id,    username=ana.username,    action=EventAction.LOGIN_SUCCESS,      status=EventStatus.SUCCESS, detail="Login exitoso",             timestamp=utc(5)),
            AuditLog(user_id=ana.id,    username=ana.username,    action=EventAction.TRANSFER_APPROVED,  status=EventStatus.SUCCESS, detail=f"Transferencia a {luis.number}", user_involved=luis.username, timestamp=utc(5)),
            AuditLog(user_id=luis.id,   username=luis.username,   action=EventAction.LOGIN_SUCCESS,      status=EventStatus.SUCCESS, detail="Login exitoso",             timestamp=utc(3)),
            AuditLog(user_id=maria.id,  username=maria.username,  action=EventAction.LOGIN_FAILED,       status=EventStatus.FAILED,  detail="Contraseña incorrecta",     timestamp=utc(1)),
            AuditLog(user_id=maria.id,  username=maria.username,  action=EventAction.LOGIN_SUCCESS,      status=EventStatus.SUCCESS, detail="Login exitoso",             timestamp=utc(1)),
        ]
        for log in audit_logs:
            session.add(log)
        session.commit()

        print("\nSeed completado:")
        print(f"  {len(users)} usuarios")
        print(f"  {len(destiny_accounts)} cuentas destino")
        print(f"  {len(transactions)} transacciones")
        print(f"  {len(audit_logs)} registros de auditoría")
        print("\nCredenciales de prueba:")
        for u, d in zip(users, usuarios_data):
            print(f"  {u.email} / {d['password']}  (cuenta: {u.number})")


if __name__ == "__main__":
    seed()
