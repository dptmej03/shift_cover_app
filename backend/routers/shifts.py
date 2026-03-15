from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/shifts", tags=["shifts"])


@router.post("", response_model=schemas.ShiftResponse, status_code=201)
def create_shift(
    req: schemas.ShiftCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 대타 요청을 생성할 수 있습니다.")
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="먼저 매장을 생성해주세요.")

    shift = models.ShiftRequest(
        store_id=current_user.store_id,
        date=req.date,
        start_time=req.start_time,
        end_time=req.end_time,
        status=models.ShiftStatus.open,
        created_by=current_user.id,
    )
    db.add(shift)
    db.commit()
    db.refresh(shift)

    result = schemas.ShiftResponse.model_validate(shift)
    result.applicant_count = len(shift.applications)
    return result


@router.get("", response_model=List[schemas.ShiftResponse])
def list_shifts(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="소속된 매장이 없습니다.")

    shifts = db.query(models.ShiftRequest).filter(
        models.ShiftRequest.store_id == current_user.store_id
    ).order_by(models.ShiftRequest.date, models.ShiftRequest.start_time).all()

    result = []
    for s in shifts:
        r = schemas.ShiftResponse.model_validate(s)
        r.applicant_count = len(s.applications)
        result.append(r)
    return result


@router.get("/{shift_id}", response_model=schemas.ShiftResponse)
def get_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    shift = db.query(models.ShiftRequest).filter(models.ShiftRequest.id == shift_id).first()
    if not shift or shift.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")

    result = schemas.ShiftResponse.model_validate(shift)
    result.applicant_count = len(shift.applications)
    return result
