from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, Text, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.core.database import Base, get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from pydantic import BaseModel
from typing import Optional
import datetime

# ── Model ──────────────────────────────────────────────────────
class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id          = Column(Integer, primary_key=True, index=True)
    quiz_id     = Column(Integer, ForeignKey("global_quizzes.id", ondelete="CASCADE"), nullable=False)
    question    = Column(Text, nullable=False)
    option_a    = Column(String(300), nullable=False)
    option_b    = Column(String(300), nullable=False)
    option_c    = Column(String(300), nullable=False)
    option_d    = Column(String(300), nullable=False)
    correct_ans = Column(String(1), nullable=False, default="A")
    created_at  = Column(DateTime, default=datetime.datetime.utcnow)

# ── Schemas ────────────────────────────────────────────────────
class QuestionCreate(BaseModel):
    question:    str
    option_a:    str
    option_b:    str
    option_c:    str
    option_d:    str
    correct_ans: str = "A"

class QuestionOut(QuestionCreate):
    id:      int
    quiz_id: int
    model_config = {"from_attributes": True}

# ── Router ─────────────────────────────────────────────────────
router = APIRouter(prefix="/api/quiz-questions", tags=["Quiz Questions"])

@router.get("/{quiz_id}", response_model=list[QuestionOut])
def get_questions(quiz_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()

@router.post("/{quiz_id}", response_model=QuestionOut, status_code=201)
def add_question(quiz_id: int, payload: QuestionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    q = QuizQuestion(quiz_id=quiz_id, **payload.model_dump())
    db.add(q)
    db.commit()
    db.refresh(q)
    return q

@router.put("/{quiz_id}/{question_id}", response_model=QuestionOut)
def update_question(quiz_id: int, question_id: int, payload: QuestionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    q = db.query(QuizQuestion).filter(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    for k, v in payload.model_dump().items():
        setattr(q, k, v)
    db.commit()
    db.refresh(q)
    return q

@router.delete("/{quiz_id}/{question_id}", status_code=204)
def delete_question(quiz_id: int, question_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    q = db.query(QuizQuestion).filter(QuizQuestion.id == question_id, QuizQuestion.quiz_id == quiz_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    db.delete(q)
    db.commit()