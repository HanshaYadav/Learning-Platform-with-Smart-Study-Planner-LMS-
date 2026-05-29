from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.models import GlobalQuiz, StudentQuiz
from app.schemas.schemas import (
    GlobalQuizCreate, GlobalQuizUpdate, GlobalQuizOut,
    StudentQuizCreate, StudentQuizUpdate, StudentQuizOut,
)

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])


# ── Admin: global quiz catalog ────────────────────────────────

@router.get("/global", response_model=list[GlobalQuizOut])
def list_global_quizzes(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(GlobalQuiz).order_by(GlobalQuiz.created_at.desc()).all()


@router.post("/global", response_model=GlobalQuizOut, status_code=201)
def create_global_quiz(
    payload: GlobalQuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    quiz = GlobalQuiz(**payload.model_dump(), created_by=current_user.id)
    db.add(quiz)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.put("/global/{quiz_id}", response_model=GlobalQuizOut)
def update_global_quiz(
    quiz_id: int,
    payload: GlobalQuizUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    quiz = db.query(GlobalQuiz).filter(GlobalQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(quiz, field, value)
    db.commit()
    db.refresh(quiz)
    return quiz


@router.delete("/global/{quiz_id}", status_code=204)
def delete_global_quiz(
    quiz_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    quiz = db.query(GlobalQuiz).filter(GlobalQuiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    db.delete(quiz)
    db.commit()


# ── Student quiz results ─────────────────────────────────────
@router.get("/student/{student_id}")
def list_student_quizzes(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return (
        db.query(StudentQuiz)
        .filter(StudentQuiz.student_id == student_id)
        .order_by(StudentQuiz.date.desc())
        .all()
    )


@router.post("/student/{student_id}", response_model=StudentQuizOut, status_code=201)
def add_student_quiz(
    student_id: int,
    payload: StudentQuizCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin adds result for any student; student can submit their own result."""
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    sq = StudentQuiz(student_id=student_id, **payload.model_dump())
    db.add(sq)
    db.commit()
    db.refresh(sq)
    return sq


@router.put("/student/{student_id}/{quiz_result_id}", response_model=StudentQuizOut)
def update_student_quiz(
    student_id: int,
    quiz_result_id: int,
    payload: StudentQuizUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    sq = db.query(StudentQuiz).filter(
        StudentQuiz.id == quiz_result_id,
        StudentQuiz.student_id == student_id,
    ).first()
    if not sq:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(sq, field, value)
    db.commit()
    db.refresh(sq)
    return sq


@router.delete("/student/{student_id}/{quiz_result_id}", status_code=204)
def delete_student_quiz(
    student_id: int,
    quiz_result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    sq = db.query(StudentQuiz).filter(
        StudentQuiz.id == quiz_result_id,
        StudentQuiz.student_id == student_id,
    ).first()
    if not sq:
        raise HTTPException(status_code=404, detail="Quiz result not found")
    db.delete(sq)
    db.commit()
