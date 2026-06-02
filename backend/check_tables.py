from backend.db import engine, create_db
from backend.models.models import User, Transaction, DestinyAccount, AuditLog
from sqlmodel import Session, select
from sqlalchemy import text

create_db()

with engine.connect() as conn:
    rows = conn.execute(text("SHOW TABLES;")).fetchall()
    print(f"\nTablas en Aiven ({len(rows)} encontradas):")
    for row in rows:
        print(f"  - {row[0]}")

with Session(engine) as s:
    users        = s.exec(select(User)).all()
    transactions = s.exec(select(Transaction)).all()
    destinos     = s.exec(select(DestinyAccount)).all()
    audits       = s.exec(select(AuditLog)).all()

    print(f"\nRegistros:")
    print(f"  Usuarios:      {len(users)}")
    print(f"  Transacciones: {len(transactions)}")
    print(f"  Destinos:      {len(destinos)}")
    print(f"  Auditoría:     {len(audits)}")

    if users:
        print(f"\nUsuarios:")
        for u in users:
            print(f"  {u.email}  cuenta:{u.number}  saldo:{u.balance}")
