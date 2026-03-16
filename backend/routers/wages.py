from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
import models, schemas
from auth import get_current_user

router = APIRouter(prefix="/wages", tags=["wages"])


def _calc_minutes(start_time: str, end_time: str) -> int:
    """HH:MM 형식의 두 시간 사이의 분 수를 계산합니다."""
    try:
        sh, sm = map(int, start_time.split(":"))
        eh, em = map(int, end_time.split(":"))
        return max(0, (eh * 60 + em) - (sh * 60 + sm))
    except Exception:
        return 0


@router.get("/monthly", response_model=List[schemas.EmployeeWageSummary])
def get_monthly_wages(
    month: str,  # "YYYY-MM"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님: 이번 달 알바생별 총 근무시간 + 급여 계산"""
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 조회할 수 있습니다.")
    if not current_user.store_id:
        raise HTTPException(status_code=400, detail="매장이 없습니다.")

    # 같은 매장의 알바생 목록
    employees = (
        db.query(models.User)
        .filter(
            models.User.store_id == current_user.store_id,
            models.User.role == models.UserRole.employee,
        )
        .all()
    )

    result = []
    for emp in employees:
        schedules = (
            db.query(models.WorkSchedule)
            .filter(
                models.WorkSchedule.employee_id == emp.id,
                models.WorkSchedule.date.startswith(month),
            )
            .all()
        )

        total_minutes = sum(_calc_minutes(s.start_time, s.end_time) for s in schedules)
        total_hours = round(total_minutes / 60, 1)
        estimated = int(emp.hourly_wage * total_hours) if emp.hourly_wage else None

        result.append(schemas.EmployeeWageSummary(
            employee_id=emp.id,
            employee_name=emp.name,
            hourly_wage=emp.hourly_wage,
            total_minutes=total_minutes,
            total_hours=total_hours,
            estimated_wage=estimated,
        ))
    return result


@router.get("/my", response_model=schemas.MyWageSummary)
def get_my_wage(
    month: str,  # "YYYY-MM"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """알바생: 이번 달 내 총 근무시간 + 예상 급여"""
    schedules = (
        db.query(models.WorkSchedule)
        .filter(
            models.WorkSchedule.employee_id == current_user.id,
            models.WorkSchedule.date.startswith(month),
        )
        .all()
    )

    total_minutes = sum(_calc_minutes(s.start_time, s.end_time) for s in schedules)
    total_hours = round(total_minutes / 60, 1)
    wage = current_user.hourly_wage
    estimated = int(wage * total_hours) if wage else None

    return schemas.MyWageSummary(
        month=month,
        total_minutes=total_minutes,
        total_hours=total_hours,
        hourly_wage=wage,
        estimated_wage=estimated,
    )


@router.patch("/hourly/{employee_id}", response_model=schemas.UserResponse)
def set_hourly_wage(
    employee_id: int,
    req: schemas.HourlyWageUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    """사장님: 알바생의 시급을 설정합니다."""
    if current_user.role != models.UserRole.manager:
        raise HTTPException(status_code=403, detail="사장님만 시급을 설정할 수 있습니다.")

    employee = db.query(models.User).filter(models.User.id == employee_id).first()
    if not employee or employee.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="해당 매장의 알바생이 아닙니다.")

    employee.hourly_wage = req.hourly_wage
    db.commit()
    db.refresh(employee)
    return employee
