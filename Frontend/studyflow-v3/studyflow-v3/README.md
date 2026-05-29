# 🎓 StudyFlow — Smart Learning Platform

A full-featured learning platform with Admin Dashboard built with React.js.

## 🚀 Quick Setup (No Errors)

### Step 1 — Install Node.js
Download and install Node.js (v16 or higher) from: https://nodejs.org

### Step 2 — Open Terminal in project folder
```
cd studyflow-updated
```

### Step 3 — Install dependencies
```
npm install
```

### Step 4 — Start the app
```
npm start
```

The app opens at **http://localhost:3000**

---

## 🔑 Demo Login Accounts

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@platform.com | Admin@123 | Admin |
| Hansha Yadav | hansha@example.com | Pass@123 | Student |
| Arjun Sharma | arjun@example.com | Test@456 | Student |
| Priya Patel | priya@example.com | Hello@789 | Student |

---

## 📦 Dependencies Used

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^18.2.0 | Core UI library |
| react-dom | ^18.2.0 | DOM rendering |
| react-scripts | 5.0.1 | Build tooling (CRA) |
| recharts | ^2.12.0 | Charts & graphs |
| react-router-dom | ^6.22.0 | Routing |

---

## 🗂️ Folder Structure

```
studyflow-updated/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Sidebar.jsx
│   ├── context/
│   │   └── AppContext.jsx       ← Global state
│   ├── pages/
│   │   ├── Login.jsx            ← Auth page
│   │   ├── Dashboard.jsx        ← Home dashboard
│   │   ├── Admin.jsx            ← Full admin panel ★
│   │   ├── Planner.jsx          ← Study task planner
│   │   ├── Courses.jsx          ← Course management
│   │   ├── Quiz.jsx             ← Quiz system
│   │   ├── Notes.jsx            ← Notes management
│   │   ├── Progress.jsx         ← Progress tracking
│   │   └── Analytics.jsx        ← Analytics
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── .env                         ← SKIP_PREFLIGHT_CHECK=true
├── .gitignore
└── package.json
```

---

## ✨ Features

### Admin Dashboard (login as admin)
- **Overview** — Stats, charts, activity graphs
- **Students** — Search any student → full performance report, add quiz results, assign notes
- **Users** — Add, edit, delete users
- **Courses** — Add, edit, delete courses

### Student Features
- Study Planner with task add/edit/delete
- Quiz system with auto-grading
- Notes upload and management
- Progress tracking with charts
- Analytics dashboard

---

## ⚠️ Common Errors & Fixes

### Error: `npm install` fails
- Make sure Node.js v16+ is installed: `node --version`
- Try: `npm install --legacy-peer-deps`

### Error: Port 3000 already in use
- Run on different port: `PORT=3001 npm start`

### Error: Cannot find module 'recharts'
- Run `npm install recharts` manually

