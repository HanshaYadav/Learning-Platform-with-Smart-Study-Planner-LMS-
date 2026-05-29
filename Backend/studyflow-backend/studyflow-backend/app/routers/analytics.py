from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.models import Task, StudentQuiz, StudySession, StudentCourse, Course
from app.schemas.schemas import AnalyticsOut, WeeklyHours, StudySessionCreate, StudySessionOut

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/{student_id}", response_model=AnalyticsOut)
def get_analytics(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    today = date.today()
    monday = today - timedelta(days=today.weekday())

    # Weekly study hours from study_sessions
    DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    daily_map: dict[int, float] = {i: 0.0 for i in range(7)}

    sessions = db.query(StudySession).filter(
        StudySession.student_id == student_id,
        StudySession.date >= monday,
        StudySession.date <= today,
    ).all()

    for s in sessions:
        day_idx = (s.date - monday).days
        if 0 <= day_idx <= 6:
            daily_map[day_idx] += round(s.duration / 60, 2)

    weekly_hours = [
        WeeklyHours(day=DAY_NAMES[i], hours=daily_map[i]) for i in range(7)
    ]
    total_hours = round(sum(d.hours for d in weekly_hours), 1)

    # Quiz average
    quizzes = db.query(StudentQuiz).filter(
        StudentQuiz.student_id == student_id,
        StudentQuiz.status == "Completed",
    ).all()
    avg_score = (
        round(sum(q.score for q in quizzes) / len(quizzes), 1) if quizzes else 0.0
    )

    # Task counts
    all_tasks = db.query(Task).filter(Task.student_id == student_id).all()
    completed = sum(1 for t in all_tasks if t.completed)
    pending = len(all_tasks) - completed

    # Course progress
    rows = (
        db.query(StudentCourse, Course)
        .join(Course, StudentCourse.course_id == Course.id)
        .filter(StudentCourse.student_id == student_id)
        .all()
    )
    course_progress = {c.name: sc.progress for sc, c in rows}

    return AnalyticsOut(
        weekly_hours=weekly_hours,
        total_hours_week=total_hours,
        avg_quiz_score=avg_score,
        completed_tasks=completed,
        pending_tasks=pending,
        course_progress=course_progress,
    )


# ── Log a study session ───────────────────────────────────────

@router.post("/{student_id}/sessions", response_model=StudySessionOut, status_code=201)
def log_study_session(
    student_id: int,
    payload: StudySessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    from app.models.models import StudySession
    session = StudySession(
        student_id=student_id,
        course_id=payload.course_id,
        date=payload.date or date.today(),
        duration=payload.duration,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
