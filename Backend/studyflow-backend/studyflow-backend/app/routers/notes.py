from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pathlib import Path
import shutil, uuid, mimetypes
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin
from app.models.user import User
from app.models.models import Note, StudentNote
from app.schemas.schemas import NoteCreate, NoteUpdate, NoteOut

router = APIRouter(prefix="/api/notes", tags=["Notes"])


# ── Admin: global notes management ───────────────────────────

@router.get("/", response_model=list[NoteOut])
def list_all_notes(
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    return db.query(Note).order_by(Note.created_at.desc()).all()


@router.post("/", response_model=NoteOut, status_code=201)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    note = Note(**payload.model_dump(), added_by=current_user.id)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.put("/{note_id}", response_model=NoteOut)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(note, field, value)
    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}", status_code=204)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()


# ── Admin: assign note to specific student ────────────────────

@router.post("/{note_id}/assign/{student_id}", status_code=201)
def assign_note_to_student(
    note_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    if not db.query(Note).filter(Note.id == note_id).first():
        raise HTTPException(status_code=404, detail="Note not found")
    existing = db.query(StudentNote).filter(
        StudentNote.note_id == note_id,
        StudentNote.student_id == student_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already assigned")
    db.add(StudentNote(student_id=student_id, note_id=note_id))
    db.commit()
    return {"message": "Note assigned"}


@router.delete("/{note_id}/assign/{student_id}", status_code=204)
def unassign_note(
    note_id: int,
    student_id: int,
    db: Session = Depends(get_db),
    _admin: User = Depends(get_current_admin),
):
    sn = db.query(StudentNote).filter(
        StudentNote.note_id == note_id,
        StudentNote.student_id == student_id,
    ).first()
    if not sn:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(sn)
    db.commit()


# ── Student: view their notes ─────────────────────────────────

@router.get("/student/{student_id}", response_model=list[NoteOut])
def student_notes(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # shared notes + specifically assigned notes
    shared = db.query(Note).filter(Note.shared == 1).all()
    assigned_note_ids = (
        db.query(StudentNote.note_id)
        .filter(StudentNote.student_id == student_id)
        .subquery()
    )
    assigned = db.query(Note).filter(Note.id.in_(assigned_note_ids)).all()

    seen = set()
    result = []
    for n in shared + assigned:
        if n.id not in seen:
            seen.add(n.id)
            result.append(n)
    return result


@router.delete("/student/{student_id}/{note_id}", status_code=204)
def student_delete_note(
    student_id: int,
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Student removes note from their view (not the global note)."""
    if current_user.role != "admin" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    sn = db.query(StudentNote).filter(
        StudentNote.student_id == student_id,
        StudentNote.note_id == note_id,
    ).first()
    if sn:
        db.delete(sn)
        db.commit()
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    _admin: User = Depends(get_current_admin)
):
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)
    size_kb = dest.stat().st_size / 1024
    size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.1f} MB"
    return {
        "file_url": f"/uploads/{filename}",
        "file_size": size_str,
        "file_type": ext.replace(".", "").upper() or "PDF"
    }

@router.get("/view/{filename}")
async def view_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        headers={"Content-Disposition": "inline"}
    )
async def view_file(filename: str):
    file_path = UPLOAD_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    media_type = mimetypes.guess_type(str(file_path))[0] or "application/octet-stream"
    return FileResponse(
        path=str(file_path),
        media_type=media_type,
        headers={"Content-Disposition": "inline"}
    )
    ext = Path(file.filename).suffix
    filename = f"{uuid.uuid4()}{ext}"
    dest = UPLOAD_DIR / filename
    with dest.open("wb") as buf:
        shutil.copyfileobj(file.file, buf)
    size_kb = dest.stat().st_size / 1024
    size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{size_kb/1024:.1f} MB"
    return {
        "file_url": f"/uploads/{filename}",
        "file_size": size_str,
        "file_type": ext.replace(".", "").upper() or "PDF"
    }