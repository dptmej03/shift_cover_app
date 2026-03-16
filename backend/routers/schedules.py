from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/schedules", tags=["schedules"])


@router.post("", response_model=schemas.WorkScheduleResponse, status_code=201)
def create_schedule(
    req: schemas.WorkScheduleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님이 알바생의 고정 근무를 등록합니다."""
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 근무 일정을 등록할 수 있습니다.")
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="매장이 없습니다.")

    # 해당 알바생이 같은 매장 소속인지 확인
    employee = db.query(models.User).filter(models.User.id == req.employee_id).first()
    if not employee or employee.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="해당 매장의 알바생이 아닙니다.")

    schedule = models.WorkSchedule(
        store_id=current_user.store_id,
        employee_id=req.employee_id,
        date=req.date,
        start_time=req.start_time,
        end_time=req.end_time,
        schedule_type=models.ScheduleType.fixed,
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    result = schemas.WorkScheduleResponse(
        id=schedule.id,
        store_id=schedule.store_id,
        employee_id=schedule.employee_id,
        employee_name=employee.name,
        date=schedule.date,
        start_time=schedule.start_time,
        end_time=schedule.end_time,
        schedule_type=schedule.schedule_type,
    )
    return result


@router.get("/daily", response_model=List[schemas.WorkScheduleResponse])
def get_daily_schedules(
    date: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님: 특정 날짜의 전체 알바생 근무 목록을 반환합니다."""
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 조회할 수 있습니다.")
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="매장이 없습니다.")

    schedules = (
        db.query(models.WorkSchedule)
        .filter(
            models.WorkSchedule.store_id == current_user.store_id,
            models.WorkSchedule.date == date,
        )
        .all()
    )

    result = []
    for s in schedules:
        result.append(schemas.WorkScheduleResponse(
            id=s.id,
            store_id=s.store_id,
            employee_id=s.employee_id,
            employee_name=s.employee.name if s.employee else None,
            date=s.date,
            start_time=s.start_time,
            end_time=s.end_time,
            schedule_type=s.schedule_type,
            shift_request_id=s.shift_request_id,
        ))
    return result


@router.get("/my", response_model=List[schemas.WorkScheduleResponse])
def get_my_schedules(
    month: Optional[str] = None,  # "YYYY-MM" 형식, 없으면 전체
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """알바생: 본인의 근무 일정 목록을 반환합니다."""
    query = db.query(models.WorkSchedule).filter(
        models.WorkSchedule.employee_id == current_user.id
    )
    if month:
        query = query.filter(models.WorkSchedule.date.startswith(month))

    schedules = query.order_by(models.WorkSchedule.date).all()

    result = []
    for s in schedules:
        result.append(schemas.WorkScheduleResponse(
            id=s.id,
            store_id=s.store_id,
            employee_id=s.employee_id,
            employee_name=current_user.name,
            date=s.date,
            start_time=s.start_time,
            end_time=s.end_time,
            schedule_type=s.schedule_type,
            shift_request_id=s.shift_request_id,
        ))
    return result


@router.get("/store", response_model=List[schemas.WorkScheduleResponse])
def get_store_schedules(
    month: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님: 매장 전체 월별 근무 일정 조회 (캘린더 마킹용)"""
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 조회할 수 있습니다.")
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="매장이 없습니다.")

    query = db.query(models.WorkSchedule).filter(
        models.WorkSchedule.store_id == current_user.store_id
    )
    if month:
        query = query.filter(models.WorkSchedule.date.startswith(month))

    schedules = query.order_by(models.WorkSchedule.date).all()

    result = []
    for s in schedules:
        result.append(schemas.WorkScheduleResponse(
            id=s.id,
            store_id=s.store_id,
            employee_id=s.employee_id,
            employee_name=s.employee.name if s.employee else None,
            date=s.date,
            start_time=s.start_time,
            end_time=s.end_time,
            schedule_type=s.schedule_type,
            shift_request_id=s.shift_request_id,
        ))
    return result


@router.delete("/{schedule_id}", status_code=204)
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님: 고정 근무 삭제"""
    schedule = db.query(models.WorkSchedule).filter(models.WorkSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="근무 일정을 찾을 수 없습니다.")
    if schedule.store_id != current_user.store_id:
        raise HTTPException(status_code=403, detail="권한이 없습니다.")

    db.delete(schedule)
    db.commit()
