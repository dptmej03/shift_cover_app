from pydantic import BaseModel, EmailStr
from typing import Optional, List
from enum import Enum


class UserRole(str, Enum):
    manager = "manager"
    employee = "employee"


class ApplicationStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class ShiftStatus(str, Enum):
    open = "open"
    closed = "closed"


# ── Auth ──────────────────────────────────────────────────────────────────────
class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    store_id: Optional[int] = None

    class Config:
        from_attributes = True


# ── Store ─────────────────────────────────────────────────────────────────────
class StoreCreate(BaseModel):
    store_name: str


class StoreJoin(BaseModel):
    invite_code: str


class StoreResponse(BaseModel):
    id: int
    store_name: str
    invite_code: str
    owner_id: int

    class Config:
        from_attributes = True


# ── ShiftRequest ──────────────────────────────────────────────────────────────
class ShiftCreate(BaseModel):
    date: str          # "YYYY-MM-DD"
    start_time: str    # "HH:MM"
    end_time: str      # "HH:MM"


class ShiftResponse(BaseModel):
    id: int
    store_id: int
    date: str
    start_time: str
    end_time: str
    status: ShiftStatus
    created_by: int
    applicant_count: Optional[int] = 0

    class Config:
        from_attributes = True


# ── Application ───────────────────────────────────────────────────────────────
class ApplicationCreate(BaseModel):
    request_id: int
    memo: Optional[str] = None  # 선택 사항: 사장님께 문의/메모


class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    request_id: int
    employee_id: int
    status: ApplicationStatus
    employee_name: Optional[str] = None
    memo: Optional[str] = None

    class Config:
        from_attributes = True
