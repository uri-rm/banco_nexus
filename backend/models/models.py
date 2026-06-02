from datetime import datetime, timezone
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
import enum
from sqlalchemy import Enum as SAEnum, Text, Column
from .schemas import EventAction, EventStatus, TransactionType
from decimal import Decimal
from sqlalchemy import Numeric

class User(SQLModel, table=True):
    __tablename__ = "users"

    id:       Optional[int] = Field(default=None, primary_key=True)
    username: Optional[str] = Field(index=True)
    email:    str           = Field(unique=True, index=True)
    password: str
    number: Optional[str] = Field(default=None, unique=True, index=True)
    balance:  float         = Field(default=0.0)
    
    transactions: list["Transaction"] = Relationship(
        back_populates="user_rel",
        sa_relationship_kwargs={
            "foreign_keys": "Transaction.user_id",   
            "primaryjoin": "User.id == Transaction.user_id",
        },
    )

    destiny_accounts: list["DestinyAccount"] = Relationship(
        back_populates="user_rel",
        sa_relationship_kwargs={
            "foreign_keys": "DestinyAccount.user_id",
            "primaryjoin": "User.id == DestinyAccount.user_id",
        },
    )
    
class DestinyAccount(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str 
    number_user: str = Field(unique=True, index=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    
    user_rel: Optional[User] = Relationship(
        back_populates="destiny_accounts",
        sa_relationship_kwargs={
            "foreign_keys": "DestinyAccount.user_id",   
            "primaryjoin": "User.id == DestinyAccount.user_id",
        },
    )

class Transaction(SQLModel, table=True):
    __tablename__ = "transactions"

    id:            Optional[int]          = Field(default=None, primary_key=True)
    user_id:       int                    = Field(foreign_key="users.id", index=True)
    target_user_id: Optional[int]         = Field(default=None, foreign_key="users.id", index=True)
    type:          TransactionType
    amount:        Decimal                = Field(sa_column=Column(Numeric(18, 2)))
    balance_after: Decimal                = Field(sa_column=Column(Numeric(18, 2)))
    description:   str
    date:          datetime               = Field(default_factory=lambda: datetime.now(timezone.utc))

    user_rel: Optional[User] = Relationship(
        back_populates="transactions",
        sa_relationship_kwargs={
            "foreign_keys": "Transaction.user_id",   
            "primaryjoin": "User.id == Transaction.user_id",
        },
    )
    
class AuditLog(SQLModel, table=True):
    __tablename__ = "audit_logs"

    id:         Optional[int]      = Field(default=None, primary_key=True)
    timestamp:  datetime           = Field(default_factory=lambda: datetime.now(timezone.utc), index=True)
    user_id:    Optional[int]      = Field(default=None, index=True) # usuario que realiza la accion
    username:   Optional[str]      = Field(default=None, max_length=100)
    action:     EventAction        = Field(sa_column=Column(SAEnum(EventAction), nullable=False, index=True))
    status:     EventStatus        = Field(sa_column=Column(SAEnum(EventStatus), nullable=False))
    detail:     Optional[str]      = Field(default=None, sa_column=Column(Text, nullable=True))
    user_involved: Optional[str]      = Field(default=None, max_length=255) # usuario involucrado en una transferencia