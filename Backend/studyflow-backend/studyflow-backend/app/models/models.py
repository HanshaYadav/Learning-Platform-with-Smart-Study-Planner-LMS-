from sqlalchemy import (
    Column, Integer, String, Enum, Text, Date, DateTime,
    ForeignKey, SmallInteger, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class Course(Base):
    __tablename__ = "courses"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(100), nullable=False, unique=True)
    color       = Column(String(20), nullable=False, default="#6c63ff")
    category    = Column(String(60), nullable=False, default="General")
    difficulty  = Column(Enum("Easy", "Medium", "Hard"), nullable=False, default="Medium")
    description = Column(Text)
    file_url    = Column(String(500), nullable=True)
    file_name   = Column(String(200), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    student_courses = relationship("StudentCourse", back_populates="course", cascade="all, delete-orphan")
    tasks           = relationship("Task",          back_populates="course")
    global_quizzes  = relationship("GlobalQuiz",    back_populates="course")
    notes           = relationship("Note",           back_populates="course")


class StudentCourse(Base):
    __tablename__ = "student_courses"

    id               = Column(Integer, primary_key=True, index=True)
    student_id       = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    course_id        = Column(Integer, ForeignKey("courses.id",  ondelete="CASCADE"), nullable=False)
    progress         = Column(Integer, nullable=False, default=0)
    total_tasks      = Column(Integer, nullable=False, default=0)
    completed_tasks  = Column(Integer, nullable=False, default=0)

    student = relationship("User",   back_populates="student_courses")
    course  = relationship("Course", back_populates="student_courses")


class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id",  ondelete="SET NULL"), nullable=True)
    course_name = Column(String(100), nullable=False)
    title       = Column(String(200), nullable=False)
    priority    = Column(Enum("High", "Medium", "Low"), nullable=False, default="Medium")
    deadline    = Column(Date)
    duration    = Column(Integer, nullable=False, default=60)
    completed   = Column(SmallInteger, nullable=False, default=0)
    notes       = Column(Text)
    assigned_by = Column(Enum("student", "admin"), nullable=False, default="student")
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    student = relationship("User",   back_populates="tasks")
    course  = relationship("Course", back_populates="tasks")


class Note(Base):
    __tablename__ = "notes"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    course_name = Column(String(100), nullable=False)
    file_type   = Column(String(20), nullable=False, default="PDF")
    file_size   = Column(String(20), nullable=False, default="0 KB")
    file_url    = Column(String(500))
    shared      = Column(SmallInteger, nullable=False, default=0)
    added_by    = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at  = Column(DateTime, server_default=func.now())
    updated_at  = Column(DateTime, server_default=func.now(), onupdate=func.now())

    course        = relationship("Course",      back_populates="notes")
    student_notes = relationship("StudentNote", back_populates="note", cascade="all, delete-orphan")


class StudentNote(Base):
    __tablename__ = "student_notes"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id",  ondelete="CASCADE"), nullable=False)
    note_id    = Column(Integer, ForeignKey("notes.id",  ondelete="CASCADE"), nullable=False)

    student = relationship("User", back_populates="student_notes")
    note    = relationship("Note", back_populates="student_notes")


class GlobalQuiz(Base):
    __tablename__ = "global_quizzes"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False)
    course_id   = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    course_name = Column(String(100), nullable=False)
    questions   = Column(Integer, nullable=False, default=10)
    duration    = Column(Integer, nullable=False, default=20)
    difficulty  = Column(Enum("Easy", "Medium", "Hard"), nullable=False, default="Medium")
    created_by  = Column(Integer, ForeignKey("users.id",   ondelete="SET NULL"), nullable=True)
    created_at  = Column(Date, server_default=func.curdate())

    course          = relationship("Course", back_populates="global_quizzes")
    student_quizzes = relationship("StudentQuiz", back_populates="quiz")


class StudentQuiz(Base):
    __tablename__ = "student_quizzes"

    id          = Column(Integer, primary_key=True, index=True)
    student_id  = Column(Integer, ForeignKey("users.id",          ondelete="CASCADE"), nullable=False)
    quiz_id     = Column(Integer, ForeignKey("global_quizzes.id", ondelete="SET NULL"), nullable=True)
    title       = Column(String(200), nullable=False)
    course_name = Column(String(100), nullable=False)
    score       = Column(Integer, nullable=False, default=0)
    total_marks = Column(Integer, nullable=False, default=100)
    status      = Column(Enum("Completed", "Pending", "In Progress"), nullable=False, default="Completed")
    date        = Column(Date, server_default=func.curdate())
    created_at  = Column(DateTime, server_default=func.now())

    student = relationship("User",       back_populates="student_quizzes")
    quiz    = relationship("GlobalQuiz", back_populates="student_quizzes")


class StudySession(Base):
    __tablename__ = "study_sessions"

    id         = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id",    ondelete="CASCADE"), nullable=False)
    course_id  = Column(Integer, ForeignKey("courses.id",  ondelete="SET NULL"), nullable=True)
    date       = Column(Date, nullable=False, server_default=func.curdate())
    duration   = Column(Integer, nullable=False, default=0)

    student = relationship("User",   back_populates="study_sessions")
    course  = relationship("Course")