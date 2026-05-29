-- ============================================================
--  StudyFlow Database Schema
--  MySQL 8.0+
--  Run: mysql -u root -p < database.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS studyflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE studyflow;

-- ────────────────────────────────────────────────────────────
-- 1. USERS
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100)  NOT NULL,
    email        VARCHAR(150)  NOT NULL UNIQUE,
    password     VARCHAR(255)  NOT NULL,          -- bcrypt hash
    role         ENUM('student','admin') NOT NULL DEFAULT 'student',
    streak       INT           NOT NULL DEFAULT 0,
    xp           INT           NOT NULL DEFAULT 0,
    joined       DATE          NOT NULL DEFAULT (CURDATE()),
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────
-- 2. COURSES  (global — admin manages; students see all)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(100)  NOT NULL UNIQUE,
    color          VARCHAR(20)   NOT NULL DEFAULT '#6c63ff',
    category       VARCHAR(60)   NOT NULL DEFAULT 'General',
    difficulty     ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
    description    TEXT,
    created_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────
-- 3. STUDENT ↔ COURSE ENROLLMENT  (progress per student)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_courses (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    student_id       INT  NOT NULL,
    course_id        INT  NOT NULL,
    progress         INT  NOT NULL DEFAULT 0,
    total_tasks      INT  NOT NULL DEFAULT 0,
    completed_tasks  INT  NOT NULL DEFAULT 0,
    UNIQUE KEY uq_sc (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- 4. TASKS  (owned by a student; admin can also assign)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tasks (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    student_id   INT           NOT NULL,
    course_id    INT,                              -- nullable, linked by name
    course_name  VARCHAR(100)  NOT NULL,
    title        VARCHAR(200)  NOT NULL,
    priority     ENUM('High','Medium','Low') NOT NULL DEFAULT 'Medium',
    deadline     DATE,
    duration     INT           NOT NULL DEFAULT 60,  -- minutes
    completed    TINYINT(1)    NOT NULL DEFAULT 0,
    notes        TEXT,
    assigned_by  ENUM('student','admin') NOT NULL DEFAULT 'student',
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────
-- 5. NOTES  (admin uploads; students view)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)  NOT NULL,
    course_id    INT,
    course_name  VARCHAR(100)  NOT NULL,
    file_type    VARCHAR(20)   NOT NULL DEFAULT 'PDF',
    file_size    VARCHAR(20)   NOT NULL DEFAULT '0 KB',
    file_url     VARCHAR(500),                    -- path or cloud URL
    shared       TINYINT(1)    NOT NULL DEFAULT 0, -- global vs student-specific
    added_by     INT,                             -- user id (admin)
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id)  ON DELETE SET NULL,
    FOREIGN KEY (added_by)  REFERENCES users(id)    ON DELETE SET NULL
);

-- student ↔ note visibility (for non-shared notes)
CREATE TABLE IF NOT EXISTS student_notes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    note_id    INT NOT NULL,
    UNIQUE KEY uq_sn (student_id, note_id),
    FOREIGN KEY (student_id) REFERENCES users(id)  ON DELETE CASCADE,
    FOREIGN KEY (note_id)    REFERENCES notes(id)  ON DELETE CASCADE
);

-- ────────────────────────────────────────────────────────────
-- 6. GLOBAL QUIZZES  (admin defines; students attempt)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS global_quizzes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    title        VARCHAR(200)  NOT NULL,
    course_id    INT,
    course_name  VARCHAR(100)  NOT NULL,
    questions    INT           NOT NULL DEFAULT 10,
    duration     INT           NOT NULL DEFAULT 20,  -- minutes
    difficulty   ENUM('Easy','Medium','Hard') NOT NULL DEFAULT 'Medium',
    created_by   INT,
    created_at   DATE          NOT NULL DEFAULT (CURDATE()),
    FOREIGN KEY (course_id)  REFERENCES courses(id)  ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES users(id)    ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────
-- 7. STUDENT QUIZ RESULTS  (per-student quiz scores)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_quizzes (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    student_id   INT           NOT NULL,
    quiz_id      INT,                             -- if linked to global quiz
    title        VARCHAR(200)  NOT NULL,
    course_name  VARCHAR(100)  NOT NULL,
    score        INT           NOT NULL DEFAULT 0,
    total_marks  INT           NOT NULL DEFAULT 100,
    status       ENUM('Completed','Pending','In Progress') NOT NULL DEFAULT 'Completed',
    date         DATE          NOT NULL DEFAULT (CURDATE()),
    created_at   TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id)        ON DELETE CASCADE,
    FOREIGN KEY (quiz_id)    REFERENCES global_quizzes(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────
-- 8. STUDY SESSIONS  (for analytics / daily hours)
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS study_sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    student_id  INT  NOT NULL,
    course_id   INT,
    date        DATE NOT NULL DEFAULT (CURDATE()),
    duration    INT  NOT NULL DEFAULT 0,  -- minutes
    FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE SET NULL
);

-- ────────────────────────────────────────────────────────────
-- SEED DATA
-- ────────────────────────────────────────────────────────────

-- Admin user  (password: Admin@123)
INSERT INTO users (name, email, password, role, streak, xp, joined) VALUES
('Admin User', 'admin@platform.com',
 '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFHqMH9fNVm9m3e',
 'admin', 0, 0, '2024-01-01');

-- Students  (password hashes listed below)
-- Hansha  → Pass@123
-- Arjun   → Test@456
-- Priya   → Hello@789
INSERT INTO users (name, email, password, role, streak, xp, joined) VALUES
('Hansha Yadav', 'hansha@example.com',
 '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC02..0z.S6KFN1P9gmK',
 'student', 7, 1240, '2024-01-15'),
('Arjun Sharma', 'arjun@example.com',
 '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC02..0z.S6KFN1P9gmK',
 'student', 3, 860, '2024-02-03'),
('Priya Patel', 'priya@example.com',
 '$2b$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC02..0z.S6KFN1P9gmK',
 'student', 5, 940, '2024-02-20');

-- Courses
INSERT INTO courses (name, color, category, difficulty) VALUES
('Mathematics', '#6c63ff', 'Science',    'Hard'),
('Physics',     '#ff6584', 'Science',    'Hard'),
('Chemistry',   '#43e8c6', 'Science',    'Medium'),
('History',     '#ffb347', 'Humanities', 'Easy'),
('English',     '#a89dff', 'Humanities', 'Medium');

-- Student enrollments  (student_id 2=Hansha, 3=Arjun, 4=Priya)
INSERT INTO student_courses (student_id, course_id, progress, total_tasks, completed_tasks) VALUES
(2, 1, 72, 25, 18),(2, 2, 45, 30, 13),(2, 3, 60, 20, 12),(2, 4, 30, 15, 4),(2, 5, 50, 18, 9),
(3, 1, 58, 20, 12),(3, 2, 30, 15, 5),(3, 3, 40, 12, 5),(3, 4, 88, 15, 13),(3, 5, 55, 18, 10),
(4, 1, 50, 20, 10),(4, 2, 62, 25, 15),(4, 3, 78, 18, 14),(4, 4, 45, 15, 7),(4, 5, 35, 18, 6);

-- Global quizzes
INSERT INTO global_quizzes (title, course_id, course_name, questions, duration, difficulty, created_by, created_at) VALUES
('Math – Calculus Basics',          1, 'Mathematics', 20, 30, 'Medium', 1, '2025-05-10'),
('Physics – Wave Motion',            2, 'Physics',     15, 25, 'Hard',   1, '2025-05-08'),
('Chemistry – Organic Reactions',    3, 'Chemistry',   18, 35, 'Medium', 1, '2025-05-06'),
('History – Industrial Revolution',  4, 'History',     12, 20, 'Easy',   1, '2025-05-05');

-- Student quiz results
INSERT INTO student_quizzes (student_id, quiz_id, title, course_name, score, total_marks, status, date) VALUES
(2, 1, 'Math – Calculus Basics',       'Mathematics', 78, 100, 'Completed', '2025-05-10'),
(2, 2, 'Physics – Wave Motion',         'Physics',     62, 100, 'Completed', '2025-05-08'),
(2, 3, 'Chemistry – Organic Reactions', 'Chemistry',   85, 100, 'Completed', '2025-05-06'),
(3, 1, 'Math – Calculus Basics',       'Mathematics', 65, 100, 'Completed', '2025-05-10'),
(3, NULL, 'History – Industrial Era',  'History',     91, 100, 'Completed', '2025-05-09'),
(4, 3, 'Chemistry – Organic Reactions', 'Chemistry',   88, 100, 'Completed', '2025-05-07'),
(4, 2, 'Physics – Wave Motion',         'Physics',     74, 100, 'Completed', '2025-05-05');

-- Tasks
INSERT INTO tasks (student_id, course_id, course_name, title, priority, deadline, duration, completed, assigned_by) VALUES
(2, 1, 'Mathematics', 'Solve Calculus Practice Set',         'High',   '2025-05-14', 90,  0, 'student'),
(2, 2, 'Physics',     'Read Chapter 5: Thermodynamics',      'Medium', '2025-05-15', 60,  0, 'student'),
(2, 3, 'Chemistry',   'Lab Report — Titration Experiment',   'High',   '2025-05-13', 120, 1, 'student'),
(2, 4, 'History',     'Essay Draft: Industrial Revolution',  'Low',    '2025-05-17', 45,  0, 'student'),
(2, 5, 'English',     'Grammar Worksheet Unit 8',            'Medium', '2025-05-16', 30,  1, 'student'),
(2, 1, 'Mathematics', 'Solve Integration Problems',          'High',   '2025-05-18', 75,  0, 'student'),
(2, 1, 'Mathematics', 'Complete Integration Worksheet',      'High',   '2025-05-18', 60,  0, 'admin'),
(2, 2, 'Physics',     'Read Thermodynamics Chapter 6',       'Medium', '2025-05-20', 45,  0, 'admin'),
(3, 4, 'History',     'Write Essay on World War II',         'High',   '2025-05-19', 90,  0, 'admin');

-- Notes
INSERT INTO notes (title, course_id, course_name, file_type, file_size, shared, added_by) VALUES
('Differential Equations Summary', 1, 'Mathematics', 'PDF', '2.4 MB', 1, 1),
('Optics & Light Notes',           2, 'Physics',     'PDF', '1.8 MB', 1, 1),
('Organic Reactions Cheatsheet',   3, 'Chemistry',   'PDF', '0.9 MB', 0, 1);

-- Student-specific note access
INSERT INTO student_notes (student_id, note_id) VALUES
(2,1),(2,2),(3,3);
