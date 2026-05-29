import os
import shutil
import time

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.models import Course, StudentCourse
from app.schemas.schemas import (
    CourseCreate, CourseUpdate, CourseOut,
    StudentCourseOut, StudentCourseProgressUpdate,
)

router = APIRouter(prefix="/api/courses", tags=["Courses"])

UPLOAD_DIR = "uploads/courses"
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ── File Upload ───────────────────────────────────────────────

@router.post("/upload")
async def upload_course_file(
    file: UploadFile = File(...),
    _admin: User = Depends(get_current_admin),
):
    allowed = {".pdf", ".docx", ".ppt", ".pptx", ".mp4", ".zip", ".txt"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(status_code=400, detail="File type not allowed")

    safe_name = f"{int(time.time())}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    return {
        "file_url": f"/uploads/courses/{safe_name}",
        "file_name": file.filename,
    }


# ── Global course catalog (admin manages) ─────────────────────

@router.get("/", response_model=list[CourseOut])
def list_courses(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(Course).all()


@router.post("/", response_model=CourseOut, status_code=201)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    if db.query(Course).filter(Course.name == payload.name).first():
        raise HTTPException(status_code=400, detail="Course name already exists")
    course = Course(**payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.put("/{course_id}", response_model=CourseOut)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(course, field, value)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=204)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()


# ── Student-specific course enrollments ───────────────────────

@router.get("/student/{student_id}", response_model=list[StudentCourseOut])
def student_courses(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    rows = (
        db.query(StudentCourse, Course)
        .join(Course, StudentCourse.course_id == Course.id)
        .filter(StudentCourse.student_id == student_id)
        .all()
    )

    result = []
    for sc, c in rows:
        result.append(StudentCourseOut(
            id=sc.id,
            course_id=c.id,
            name=c.name,
            color=c.color,
            category=c.category,
            difficulty=c.difficulty,
            description=c.description,
            progress=sc.progress,
            total_tasks=sc.total_tasks,
            completed_tasks=sc.completed_tasks,
            file_url=c.file_url,
            file_name=c.file_name,
        ))
    return result


@router.post("/student/{student_id}/enroll/{course_id}", status_code=201)
def enroll_student(
    student_id: int,
    course_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    if not db.query(Course).filter(Course.id == course_id).first():
        raise HTTPException(status_code=404, detail="Course not found")
    existing = db.query(StudentCourse).filter(
        StudentCourse.student_id == student_id,
        StudentCourse.course_id == course_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")
    db.add(StudentCourse(student_id=student_id, course_id=course_id))
    db.commit()
    return {"message": "Enrolled successfully"}


@router.patch("/student/{student_id}/progress/{enrollment_id}", response_model=StudentCourseOut)
def update_progress(
    student_id: int,
    enrollment_id: int,
    payload: StudentCourseProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    sc = db.query(StudentCourse).filter(
        StudentCourse.id == enrollment_id,
        StudentCourse.student_id == student_id,
    ).first()
    if not sc:
        raise HTTPException(status_code=404, detail="Enrollment not found")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(sc, field, value)
    db.commit()
    db.refresh(sc)

    c = sc.course
    return StudentCourseOut(
        id=sc.id, course_id=c.id, name=c.name, color=c.color,
        category=c.category, difficulty=c.difficulty, description=c.description,
        progress=sc.progress, total_tasks=sc.total_tasks, completed_tasks=sc.completed_tasks,
        file_url=c.file_url, file_name=c.file_name,
    )