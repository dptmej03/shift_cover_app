from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from database import Base
import enum


class UserRole(str, enum.Enum):
    manager = "manager"
    employee = "employee"


class ApplicationStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class ShiftStatus(str, enum.Enum):
    open = "open"
    closed = "closed"


class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, nullable=False)
    invite_code = Column(String, unique=True, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", foreign_keys=[owner_id], back_populates="owned_store")
    members = relationship("User", foreign_keys="User.store_id", back_populates="store")
    shift_requests = relationship("ShiftRequest", back_populates="store")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=True)

    store = relationship("Store", foreign_keys=[store_id], back_populates="members")
    owned_store = relationship("Store", foreign_keys="Store.owner_id", back_populates="owner", uselist=False)
    applications = relationship("Application", back_populates="employee")


class ShiftRequest(Base):
    __tablename__ = "shift_requests"

    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(Integer, ForeignKey("stores.id"), nullable=False)
    date = Column(String, nullable=False)   # "YYYY-MM-DD"
    start_time = Column(String, nullable=False)  # "HH:MM"
    end_time = Column(String, nullable=False)    # "HH:MM"
    status = Column(SAEnum(ShiftStatus), default=ShiftStatus.open, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)

    store = relationship("Store", back_populates="shift_requests")
    creator = relationship("User", foreign_keys=[created_by])
    applications = relationship("Application", back_populates="shift_request")


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("shift_requests.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.pending, nullable=False)
    memo = Column(String, nullable=True)  # 알바생이 사장님께 남기는 메모/문의사항

    shift_request = relationship("ShiftRequest", back_populates="applications")
    employee = relationship("User", back_populates="applications")
