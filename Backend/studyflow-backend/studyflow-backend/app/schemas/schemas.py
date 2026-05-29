from __future__ import annotations
from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, field_validator


# ═══════════════════════════════════════════════════
#  AUTH
# ═══════════════════════════════════════════════════

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ═══════════════════════════════════════════════════
#  USER
# ═══════════════════════════════════════════════════

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    streak: int
    xp: int
    joined: date

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    streak: Optional[int] = None
    xp: Optional[int] = None


# ═══════════════════════════════════════════════════
#  COURSE
# ═══════════════════════════════════════════════════

class CourseBase(BaseModel):
    name: str
    color: str = "#6c63ff"
    category: str = "General"
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    category: Optional[str] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None
    description: Optional[str] = None
    file_url: Optional[str] = None
    file_name: Optional[str] = None


class CourseOut(CourseBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class StudentCourseOut(BaseModel):
    id: int
    course_id: int
    name: str
    color: str
    category: str
    difficulty: str
    description: Optional[str] = None
    progress: int
    total_tasks: int
    completed_tasks: int
    file_url: Optional[str] = None
    file_name: Optional[str] = None

    model_config = {"from_attributes": True}


class StudentCourseProgressUpdate(BaseModel):
    progress: Optional[int] = None
    total_tasks: Optional[int] = None
    completed_tasks: Optional[int] = None


# ═══════════════════════════════════════════════════
#  TASK
# ═══════════════════════════════════════════════════

class TaskBase(BaseModel):
    title: str
    course_name: str
    priority: Literal["High", "Medium", "Low"] = "Medium"
    deadline: Optional[date] = None
    duration: int = 60
    notes: Optional[str] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    course_name: Optional[str] = None
    priority: Optional[Literal["High", "Medium", "Low"]] = None
    deadline: Optional[date] = None
    duration: Optional[int] = None
    completed: Optional[bool] = None
    notes: Optional[str] = None


class TaskOut(TaskBase):
    id: int
    student_id: int
    completed: bool
    assigned_by: str
    created_at: Optional[datetime] = None

    @field_validator("completed", mode="before")
    @classmethod
    def coerce_completed(cls, v):
        return bool(v)

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════
#  NOTE
# ═══════════════════════════════════════════════════

class NoteBase(BaseModel):
    title: str
    course_name: str
    file_type: str = "PDF"
    file_size: str = "0 KB"
    file_url: Optional[str] = None
    shared: bool = False


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    course_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size: Optional[str] = None
    shared: Optional[bool] = None


class NoteOut(NoteBase):
    id: int
    added_by: Optional[int] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════
#  GLOBAL QUIZ
# ═══════════════════════════════════════════════════

class GlobalQuizBase(BaseModel):
    title: str
    course_name: str
    questions: int = 10
    duration: int = 20
    difficulty: Literal["Easy", "Medium", "Hard"] = "Medium"


class GlobalQuizCreate(GlobalQuizBase):
    pass


class GlobalQuizUpdate(BaseModel):
    title: Optional[str] = None
    course_name: Optional[str] = None
    questions: Optional[int] = None
    duration: Optional[int] = None
    difficulty: Optional[Literal["Easy", "Medium", "Hard"]] = None


class GlobalQuizOut(GlobalQuizBase):
    id: int
    created_at: Optional[date] = None

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════
#  STUDENT QUIZ
# ═══════════════════════════════════════════════════

class StudentQuizBase(BaseModel):
    title: str
    course_name: str
    score: int
    total_marks: int = 100
    status: Literal["Completed", "Pending", "In Progress"] = "Completed"
    quiz_id: Optional[int] = None


class StudentQuizCreate(StudentQuizBase):
    pass


class StudentQuizUpdate(BaseModel):
    title: Optional[str] = None
    course_name: Optional[str] = None
    score: Optional[int] = None
    total_marks: Optional[int] = None
    status: Optional[Literal["Completed", "Pending", "In Progress"]] = None


class StudentQuizOut(StudentQuizBase):
    id: int
    student_id: int
    date: Optional[str] = None

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date(cls, v):
        if v is None:
            return None
        return str(v)

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════
#  STUDY SESSION
# ═══════════════════════════════════════════════════

class StudySessionCreate(BaseModel):
    course_id: Optional[int] = None
    date: Optional[date] = None

    @field_validator("date", mode="before")
    @classmethod
    def coerce_date(cls, v):
        return v
    duration: int  # minutes


class StudySessionOut(BaseModel):
    id: int
    student_id: int
    course_id: Optional[int] = None
    date: date
    duration: int

    model_config = {"from_attributes": True}


# ═══════════════════════════════════════════════════
#  ANALYTICS
# ═══════════════════════════════════════════════════

class WeeklyHours(BaseModel):
    day: str
    hours: float


class AnalyticsOut(BaseModel):
    weekly_hours: list[WeeklyHours]
    total_hours_week: float
    avg_quiz_score: float
    completed_tasks: int
    pending_tasks: int
    course_progress: dict[str, int]