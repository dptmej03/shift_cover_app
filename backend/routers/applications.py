from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=schemas.ApplicationResponse, status_code=201)
def apply_for_shift(
    req: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.employee:
        raise HTTPException(status_code=403, detail="알바생만 대타 신청을 할 수 있습니다.")

    shift = db.query(models.ShiftRequest).filter(models.ShiftRequest.id == req.request_id).first()
    if not shift:
        raise HTTPException(status_code=404, detail="대타 요청을 찾을 수 없습니다.")
    if shift.store_id != current_user.store_id:
        raise HTTPException(status_code=403, detail="소속 매장의 요청에만 신청할 수 있습니다.")
    if shift.status == models.ShiftStatus.closed:
        raise HTTPException(status_code=400, detail="이미 마감된 요청입니다.")

    existing = db.query(models.Application).filter(
        models.Application.request_id == req.request_id,
        models.Application.employee_id == current_user.id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="이미 신청한 대타입니다.")

    application = models.Application(
        request_id=req.request_id,
        employee_id=current_user.id,
        status=models.ApplicationStatus.pending,
        memo=req.memo,
    )
    db.add(application)
    db.commit()
    db.refresh(application)

    result = schemas.ApplicationResponse.model_validate(application)
    result.employee_name = current_user.name
    return result


@router.get("/shift/{shift_id}", response_model=List[schemas.ApplicationResponse])
def list_applicants(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 신청자 목록을 볼 수 있습니다.")

    shift = db.query(models.ShiftRequest).filter(models.ShiftRequest.id == shift_id).first()
    if not shift or shift.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="요청을 찾을 수 없습니다.")

    applications = db.query(models.Application).filter(
        models.Application.request_id == shift_id
    ).all()

    result = []
    for app in applications:
        r = schemas.ApplicationResponse.model_validate(app)
        r.employee_name = app.employee.name if app.employee else None
        result.append(r)
    return result


@router.patch("/{app_id}", response_model=schemas.ApplicationResponse)
def update_application_status(
    app_id: int,
    req: schemas.ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 신청을 처리할 수 있습니다.")

    application = db.query(models.Application).filter(models.Application.id == app_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="신청을 찾을 수 없습니다.")

    shift = application.shift_request
    if shift.store_id != current_user.store_id:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")

    application.status = req.status

    # 승인 시 해당 shift를 closed로, 다른 신청은 rejected로, WorkSchedule 자동 생성
    if req.status == models.ApplicationStatus.accepted:
        shift.status = models.ShiftStatus.closed
        others = db.query(models.Application).filter(
            models.Application.request_id == shift.id,
            models.Application.id != app_id,
            models.Application.status == models.ApplicationStatus.pending,
        ).all()
        for other in others:
            other.status = models.ApplicationStatus.rejected

        # 대타 근무 일정 자동 생성 (캘린더+급여 자동 반영)
        work_schedule = models.WorkSchedule(
            store_id=shift.store_id,
            employee_id=application.employee_id,
            date=shift.date,
            start_time=shift.start_time,
            end_time=shift.end_time,
            schedule_type=models.ScheduleType.substitute,
            shift_request_id=shift.id,
        )
        db.add(work_schedule)

    db.commit()
    db.refresh(application)

    result = schemas.ApplicationResponse.model_validate(application)
    result.employee_name = application.employee.name if application.employee else None
    return result


@router.get("/my", response_model=List[schemas.ApplicationResponse])
def my_applications(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.role != models.UserRole.employee:
        raise HTTPException(status_code=403, detail="알바생만 이용 가능합니다.")

    applications = db.query(models.Application).filter(
        models.Application.employee_id == current_user.id
    ).all()

    result = []
    for app in applications:
        r = schemas.ApplicationResponse.model_validate(app)
        r.employee_name = current_user.name
        result.append(r)
    return result
