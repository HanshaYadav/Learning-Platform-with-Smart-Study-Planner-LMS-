from sqlalchemy import (
    Column, Integer, String, Enum, Text, Date, DateTime,
    ForeignKey, SmallInteger, func
)
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False)
    email      = Column(String(150), nullable=False, unique=True, index=True)
    password   = Column(String(255), nullable=False)
    role       = Column(Enum("student", "admin"), nullable=False, default="student")
    streak     = Column(Integer, nullable=False, default=0)
    xp         = Column(Integer, nullable=False, default=0)
    joined     = Column(Date, nullable=False, server_default=func.curdate())
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # relationships
    tasks           = relationship("Task",          back_populates="student", cascade="all, delete-orphan")
    student_courses = relationship("StudentCourse", back_populates="student", cascade="all, delete-orphan")
    student_quizzes = relationship("StudentQuiz",   back_populates="student", cascade="all, delete-orphan")
    student_notes   = relationship("StudentNote",   back_populates="student", cascade="all, delete-orphan")
    study_sessions  = relationship("StudySession",  back_populates="student", cascade="all, delete-orphan")
