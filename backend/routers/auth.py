import random
import string

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
import models, schemas, auth as auth_utils

router = APIRouter(prefix="/auth", tags=["auth"])


def _generate_invite_code(db: Session, length=6) -> str:
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
        if not db.query(models.Store).filter(models.Store.invite_code == code).first():
            return code


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(req: schemas.RegisterRequest, db: Session = Depends(get_db)):
    # 이메일 중복 확인
    if db.query(models.User).filter(models.User.email == req.email).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 이메일입니다.")

    # 사장님: store_name 필수
    if req.role == models.UserRole.manager and not req.store_name:
        raise HTTPException(status_code=400, detail="사장님은 매장명을 입력해야 합니다.")

    # 알바생: invite_code 필수
    if req.role == models.UserRole.employee and not req.invite_code:
        raise HTTPException(status_code=400, detail="알바생은 초대 코드를 입력해야 합니다.")

    # 알바생: 초대코드 유효성 검사 (회원 생성 전에)
    store = None
    if req.role == models.UserRole.employee:
        store = db.query(models.Store).filter(
            models.Store.invite_code == req.invite_code.upper()
        ).first()
        if not store:
            raise HTTPException(status_code=404, detail="유효하지 않은 초대 코드입니다.")

    # 사용자 생성
    user = models.User(
        name=req.name,
        email=req.email,
        password_hash=auth_utils.hash_password(req.password),
        role=req.role,
    )
    db.add(user)
    db.flush()  # id 획득

    if req.role == models.UserRole.manager:
        # 매장 자동 생성
        invite_code = _generate_invite_code(db)
        new_store = models.Store(
            store_name=req.store_name,
            invite_code=invite_code,
            owner_id=user.id,
        )
        db.add(new_store)
        db.flush()
        user.store_id = new_store.id
    else:
        # 알바생은 초대코드 매장에 자동 연결
        user.store_id = store.id

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
