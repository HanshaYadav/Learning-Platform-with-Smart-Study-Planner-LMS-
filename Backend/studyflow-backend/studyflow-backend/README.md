# 🎓 StudyFlow — FastAPI Backend

Complete REST API backend for the StudyFlow learning platform.  
**Stack:** FastAPI · SQLAlchemy · MySQL · JWT Authentication · Bcrypt

---

## 📁 Project Structure

```
studyflow-backend/
├── main.py                      ← FastAPI app entry point
├── requirements.txt             ← Python dependencies
├── .env                         ← Environment variables (edit this!)
├── database.sql                 ← MySQL schema + seed data
└── app/
    ├── core/
    │   ├── config.py            ← Settings from .env
    │   ├── database.py          ← SQLAlchemy engine + session
    │   └── security.py          ← JWT + bcrypt + auth dependencies
    ├── models/
    │   ├── user.py              ← User ORM model
    │   └── models.py            ← All other ORM models
    ├── schemas/
    │   └── schemas.py           ← Pydantic request/response schemas
    └── routers/
        ├── auth.py              ← /api/auth/*
        ├── users.py             ← /api/users/*
        ├── courses.py           ← /api/courses/*
        ├── tasks.py             ← /api/tasks/*
        ├── notes.py             ← /api/notes/*
        ├── quizzes.py           ← /api/quizzes/*
        └── analytics.py        ← /api/analytics/*
```

---

## 🛠 Prerequisites — Install These First

### 1. Python 3.11+
```bash
# Check version
python --version

# Install via winget (Windows)
winget install Python.Python.3.11

# Install via brew (macOS)
brew install python@3.11
```

### 2. MySQL 8.0+
```bash
# Windows — download installer:
# https://dev.mysql.com/downloads/installer/

# macOS
brew install mysql
brew services start mysql

# Ubuntu/Debian
sudo apt update && sudo apt install mysql-server -y
sudo systemctl start mysql
```

### 3. Git (already installed if you have the frontend)

---

## ⚙️ Setup Steps

### Step 1 — Configure the database

```bash
# Log in to MySQL
mysql -u root -p

# Run the schema + seed script
mysql -u root -p < database.sql
```

This creates the `studyflow` database with all tables and seeds:
- 1 admin user (`admin@platform.com` / `Admin@123`)
- 3 student users (Hansha, Arjun, Priya)
- Courses, tasks, notes, quizzes

> ⚠️ **Note on seed passwords:** The seed data contains bcrypt hashes that
> match the passwords listed above. If you want to change them, use the
> `/api/auth/register` endpoint after setup.

---

### Step 2 — Configure environment variables

Edit the `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=studyflow
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE   ← change this

SECRET_KEY=generate_a_random_key_here  ← change this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

CORS_ORIGINS=http://localhost:3000
```

**Generate a strong SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

---

### Step 3 — Install Python dependencies

```bash
# Create virtual environment (recommended)
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install all packages
pip install -r requirements.txt
```

---

### Step 4 — Run the server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## 🔗 Connecting the React Frontend

In your React frontend (`studyflow-v3`), update `AppContext.jsx` to call the
API instead of using the mock data.

**Add a base URL constant** (or put it in `.env`):
```js
// src/api.js
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}
```

**Frontend `.env`:**
```
REACT_APP_API_URL=http://localhost:8000
```

---

## 📡 API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login → returns JWT token |
| POST | `/api/auth/register` | Register new student |
| GET | `/api/auth/me` | Get current user profile |

**Login request body:**
```json
{ "email": "hansha@example.com", "password": "Pass@123" }
```
**Response:** `{ "access_token": "...", "token_type": "bearer", "user": {...} }`

---

### Users (Admin only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/` | List all users |
| GET | `/api/users/students` | List students only |
| GET | `/api/users/{id}` | Get user by ID |
| PATCH | `/api/users/{id}` | Update user (name, streak, xp) |
| DELETE | `/api/users/{id}` | Delete user |

---

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses/` | List all courses (global) |
| POST | `/api/courses/` | Create course (admin) |
| PUT | `/api/courses/{id}` | Update course (admin) |
| DELETE | `/api/courses/{id}` | Delete course (admin) |
| GET | `/api/courses/student/{student_id}` | Get student's enrolled courses with progress |
| POST | `/api/courses/student/{student_id}/enroll/{course_id}` | Enroll student (admin) |
| PATCH | `/api/courses/student/{student_id}/progress/{enrollment_id}` | Update progress |

---

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/student/{student_id}` | Get student's tasks |
| POST | `/api/tasks/student/{student_id}` | Create task (student or admin) |
| PATCH | `/api/tasks/{task_id}` | Update task |
| PATCH | `/api/tasks/{task_id}/toggle` | Toggle complete + award XP |
| DELETE | `/api/tasks/{task_id}` | Delete task |

---

### Notes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notes/` | All notes (admin) |
| POST | `/api/notes/` | Create note (admin) |
| PUT | `/api/notes/{id}` | Update note (admin) |
| DELETE | `/api/notes/{id}` | Delete note (admin) |
| POST | `/api/notes/{note_id}/assign/{student_id}` | Assign note to student |
| DELETE | `/api/notes/{note_id}/assign/{student_id}` | Unassign note |
| GET | `/api/notes/student/{student_id}` | Student's notes (shared + assigned) |
| DELETE | `/api/notes/student/{student_id}/{note_id}` | Remove from student's view |

---

### Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quizzes/global` | List global quizzes |
| POST | `/api/quizzes/global` | Create global quiz (admin) |
| PUT | `/api/quizzes/global/{id}` | Update global quiz (admin) |
| DELETE | `/api/quizzes/global/{id}` | Delete global quiz (admin) |
| GET | `/api/quizzes/student/{student_id}` | Student quiz results |
| POST | `/api/quizzes/student/{student_id}` | Add quiz result |
| PUT | `/api/quizzes/student/{student_id}/{result_id}` | Update result |
| DELETE | `/api/quizzes/student/{student_id}/{result_id}` | Delete result |

---

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/{student_id}` | Full analytics (weekly hours, quiz avg, task counts, progress) |
| POST | `/api/analytics/{student_id}/sessions` | Log a study session |

---

## 🗄️ Database Tables

| Table | Description |
|-------|-------------|
| `users` | Students and admin accounts |
| `courses` | Global course catalog |
| `student_courses` | Enrollment + progress per student |
| `tasks` | Study tasks (student-created + admin-assigned) |
| `notes` | Study notes/materials |
| `student_notes` | Note-to-student assignments |
| `global_quizzes` | Admin-defined quiz catalog |
| `student_quizzes` | Per-student quiz results/scores |
| `study_sessions` | Logged study time for analytics |

---

## 🔐 Authentication Flow

1. Frontend calls `POST /api/auth/login` with email + password
2. Backend returns `access_token` (JWT, valid 24h)
3. Frontend stores token in `localStorage`
4. Every subsequent request includes: `Authorization: Bearer <token>`
5. Backend validates the token and identifies the user

---

## 🚀 Running in Production

```bash
# Install gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

For production, also:
- Set `APP_ENV=production` in `.env`
- Use a real `SECRET_KEY` (never the default)
- Restrict `CORS_ORIGINS` to your actual frontend domain
- Use environment variables instead of `.env` file on the server
