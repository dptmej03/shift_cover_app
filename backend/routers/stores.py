import random
import string

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/stores", tags=["stores"])


def generate_invite_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))


@router.post("", response_model=schemas.StoreResponse, status_code=201)
def create_store(
    req: schemas.StoreCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 매장을 생성할 수 있습니다.")
    if current_user.store_id:
        raise HTTPException(status_code=400, detail="이미 매장에 속해 있습니다.")

    code = generate_invite_code()
    while db.query(models.Store).filter(models.Store.invite_code == code).first():
        code = generate_invite_code()

    store = models.Store(
        store_name=req.store_name,
        invite_code=code,
        owner_id=current_user.id,
    )
    db.add(store)
    db.flush()

    current_user.store_id = store.id
    db.commit()
    db.refresh(store)
    return store


@router.post("/join", response_model=schemas.StoreResponse)
def join_store(
    req: schemas.StoreJoin,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.employee:
        raise HTTPException(status_code=403, detail="알바생만 매장에 참여할 수 있습니다.")
    if current_user.store_id:
        raise HTTPException(status_code=400, detail="이미 매장에 속해 있습니다.")

    store = db.query(models.Store).filter(models.Store.invite_code == req.invite_code.upper()).first()
    if not store:
        raise HTTPException(status_code=404, detail="유효하지 않은 초대 코드입니다.")

    current_user.store_id = store.id
    db.commit()
    db.refresh(store)
    return store


@router.get("/mine", response_model=schemas.StoreResponse)
def get_my_store(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.store_id:
        raise HTTPException(status_code=404, detail="소속된 매장이 없습니다.")
    store = db.query(models.Store).filter(models.Store.id == current_user.store_id).first()
    return store
