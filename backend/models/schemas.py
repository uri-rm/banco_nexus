from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import enum

# Requests
class LoginRequest(BaseModel):
    email:    str
    password: str

class RegisterRequest(BaseModel):
    username:     str
    email:    str
    password: str

# Responses
class UserResponse(BaseModel):
    id:      int
    username:    str
    email:   str
    number:  str
    balance: float

class UserCreatedResponse(BaseModel):
    id:      int
    username:    str
    email:   str
    number:  str
    balance: float

class DestinyAccountResponse(BaseModel):
    name: str
    number_user: str

class TokenResponse(BaseModel):
    access_token: str
    token_type:   str
    user:         UserResponse

class TransactionResponse(BaseModel):
    id:          int
    date:        datetime
    type:        str
    amount:      float
    balance_after:     float
    description: str
    
class UserUpdateRequest(BaseModel):
    username:     str = None
    email:    str = None
    password: str = None
    
class TransactionRequest(BaseModel):
    type:        str    # "deposit" | "withdrawal"
    amount:      float
    description: Optional[str] = None

class AddDestinyAccountRequest(BaseModel):
    name: str

class TransferStatus(str, enum.Enum):
    PENDING   = "pendiente"
    COMPLETED = "completada"
    FAILED    = "fallida"
    REVERSED  = "revertida"
    
class TransactionType(str, enum.Enum):
    DEPOSIT    = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER   = "transfer"

# Events 
class EventAction(str, enum.Enum):
    LOGIN_SUCCESS     = "login_exitoso"
    LOGIN_FAILED      = "login_fallido"
    TRANSFER_APPROVED  = "transferencia_aprobada"
    TRANSFER_ACCEPTED  = "transferencia_aceptada"
    TRANSFER_REJECTED  = "transferencia_rechazada"
    ACCOUNT_CREATED   = "alta_de_cuenta"
    LOGOUT            = "logout"
    DEPOSIT           = "deposito"
    WITHDRAWAL        = "retiro"
    
class EventStatus(str, enum.Enum):
    SUCCESS = "exitoso"
    FAILED  = "fallido"
    PENDING = "pendiente"
  
class AuditLogCreate(BaseModel):
    user_id:    Optional[int]    = None
    username:   Optional[str]    = None
    action:     EventAction
    status:     EventStatus
    detail:     Optional[str]    = None
    user_involved:         Optional[str]    = None

class AuditLogResponse(BaseModel):
    id:         int
    timestamp:  datetime
    user_id:    Optional[int]    = None
    username:   Optional[str]    = None
    action:     EventAction
    status:     EventStatus
    detail:     Optional[str]    = None
    user_involved:         Optional[str]    = None

    model_config = {"from_attributes": True}
    

