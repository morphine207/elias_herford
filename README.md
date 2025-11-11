# Kreis Herford Learning Platform

An adaptive learning prototype for Kreis Herford that combines a **React + Vite** frontend with a **FastAPI** backend. The platform personalises course content, surfaces relevant technical news, and captures feedback to improve learning outcomes.

---

## Table of Contents

1. [Key Features](#key-features)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Setup & Installation](#setup--installation)
   - [Backend (FastAPI)](#backend-fastapi)
   - [Frontend (React + Vite)](#frontend-react--vite)
6. [Running the App](#running-the-app)
7. [Environment Variables](#environment-variables)
8. [API Overview](#api-overview)
9. [Data Sources](#data-sources)
10. [Development Tips](#development-tips)
11. [Next Steps & Ideas](#next-steps--ideas)

---

## Key Features

- **Learning Preferences Prompt** – collects learning style, role, preferred depth, and news opt-in.
- **Adaptive Course Player** – renders slides with visuals, text, and audio cues based on the selected style.
- **Contextual News Feed** – fetches concise news summaries for the current slide topic via the backend.
- **AI Assistant Panel** – displays an animated assistant with hooks for future chat/voice enhancements.
- **Feedback Modal** – captures per-slide feedback and posts it back to the backend API for storage.

---

## System Architecture

```
React + Vite + Tailwind (frontend)
         │
         ├── REST calls
         │
FastAPI (backend)
         │
         ├── JSON data (course, feedback, news)
         └── OpenAI API (news summarisation)
```

- **Frontend:** Handles routing, course flow, and UI interactions.
- **Backend:** Serves course content, manages feedback, and generates topical news summaries.
- **External Services:** OpenAI `gpt-4o-mini` for curated, concise news items.

---

## Project Structure

```
├── backend/
│   ├── data/
│   │   ├── course_1.json
│   │   ├── feedback.json
│   │   └── news.json
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CoursePlayer.tsx
│   │   │   ├── PreferencesPrompt.tsx
│   │   │   ├── NewsBox.tsx
│   │   │   ├── FeedbackModal.tsx
│   │   │   └── ui/...
│   │   ├── pages/
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── README.md
└── .gitignore
```

---

## Prerequisites

| Layer     | Requirement            |
|-----------|------------------------|
| Backend   | Python 3.10+           |
| Frontend  | Node.js 18+ (with npm) |
| Services  | OpenAI API key         |

---

## Setup & Installation

### Backend (FastAPI)

```bash
cd backend
python -m venv venv
venv\Scripts\activate           # Windows
# source venv/bin/activate        # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env` with your OpenAI credentials:

```
OPENAI_API_KEY=sk-********************************
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
```

(Optional) create `frontend/.env` if you need to override defaults—see [Environment Variables](#environment-variables).

---

## Running the App

### 1. Start the backend

```bash
cd backend
venv\Scripts\activate           # or source venv/bin/activate
uvicorn main:app --reload
```

Backend available at `http://127.0.0.1:8000`.

### 2. Start the frontend

```bash
cd frontend
npm run dev
```

Frontend available at `http://localhost:8080` (configured in `vite.config.ts`).

---

## Environment Variables

| Location         | Variable            | Description                                           |
|------------------|---------------------|-------------------------------------------------------|
| `backend/.env`   | `OPENAI_API_KEY`    | Required for AI-powered news summaries                |
| `frontend/.env`  | `VITE_API_BASE_URL` | Optional override for the backend base URL (defaults to proxy) |

The frontend dev server proxy routes `/api` and `/static` requests to `http://localhost:8000`. Set `VITE_API_BASE_URL` only when the backend runs elsewhere (production, Docker, etc.).

---

## API Overview

| Endpoint                          | Method | Description                                                |
|----------------------------------|--------|------------------------------------------------------------|
| `/api/course/{id}`               | GET    | Returns course data (`course_{id}.json`)                   |
| `/api/news?keywords=...`         | GET    | Generates concise news summaries for supplied keywords     |
| `/api/feedback`                  | POST   | Appends learner feedback to `feedback.json`                |

All responses are JSON. Errors are returned with standard HTTP codes.

---

## Data Sources

- `backend/data/course_1.json` – slide content, topics, and quiz stubs.
- `backend/data/news.json` – optional seed items; AI fills gaps with real summaries.
- `backend/data/feedback.json` – appended feedback entries (json list). Delete to reset.

---

## Development Tips

- **Linting / Formatting**
  - Frontend: `npm run lint`
  - Backend: add `ruff` or `black` for consistent formatting
- **Hot Reload**
  - `uvicorn --reload` for backend
  - `npm run dev` for frontend
- **Proxy**
  - Keep both servers running to avoid CORS issues during development.

---

## Next Steps & Ideas

- Persist users and course progress in a database.
- Add quiz evaluation and scoring UX.
- Extend the AI assistant with chat history and voice playback.
- Support additional courses and localisation options.
- Deploy: FastAPI (Railway, Azure, AWS) + Frontend (Vercel, Netlify).

---

Feel free to open issues or submit PRs. Contributions are welcome! 😊