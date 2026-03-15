from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(models.User).filter(models.User.email == req.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    user = models.User(
        name=req.name,
        email=req.email,
        password_hash=auth_utils.hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == req.email).first()
    if not user or not auth_utils.verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")

    token = auth_utils.create_access_token({"sub": str(user.id)})
    return {"access_token": token}


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user
