from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.models import Task
from app.schemas.schemas import TaskCreate, TaskUpdate, TaskOut

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


def _get_task_or_404(task_id: int, db: Session) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


# ── Student tasks ─────────────────────────────────────────────

@router.get("/student/{student_id}", response_model=list[TaskOut])
def list_student_tasks(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(Task).filter(Task.student_id == student_id).order_by(Task.deadline).all()


@router.post("/student/{student_id}", response_model=TaskOut, status_code=201)
def create_task(
    student_id: int,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Students create their own tasks; admins can create tasks for any student."""
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    assigned_by = "admin" if current_user.role == "admin" else "student"
    task = Task(
        student_id=student_id,
        assigned_by=assigned_by,
        **payload.model_dump(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(task_id, db)
    if current_user.role != "admin" and current_user.id != task.student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(task, field, value)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/toggle", response_model=TaskOut)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Toggle task completed status and award XP."""
    task = _get_task_or_404(task_id, db)
    if current_user.role != "admin" and current_user.id != task.student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    task.completed = 0 if task.completed else 1
    if task.completed and current_user.role == "student":
        current_user.xp = (current_user.xp or 0) + 10
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(task_id, db)
    if current_user.role != "admin" and current_user.id != task.student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(task)
    db.commit()
