# AI Exercise Trainer

AI Exercise Trainer is a real-time fitness coaching web app. It uses a webcam, MediaPipe Pose, exercise recognition heuristics, repetition counters, posture rules, and browser speech synthesis to guide users through safer workouts.

## Stack

- Frontend: Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion, React Webcam, Zustand, Chart.js, Web Speech API
- Backend: FastAPI, OpenCV, MediaPipe Pose, NumPy, Pydantic, Supabase
- Database/Auth: Supabase PostgreSQL and Supabase Auth

## Project Structure

```text
frontend/   Next.js app, camera trainer, dashboard, history, settings, auth shell
backend/    FastAPI app, pose detection, exercise recognition, rep counter, posture rules
shared/     Shared TypeScript contracts
database/   Supabase schema and RLS policies
docs/       Roadmap, API, and deployment instructions
```

## Local Setup

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Core Flow

1. The camera screen captures webcam frames.
2. The frontend sends frames to `POST /api/pose/analyze`.
3. The backend extracts MediaPipe landmarks.
4. Exercise recognition picks the most likely movement.
5. The rep counter updates session state.
6. Posture rules emit feedback messages.
7. The browser speaks feedback with cooldown logic.
8. Completed workout reports are stored through `POST /api/workouts`.

## Notes

- Authentication wiring is Supabase-ready. Add project keys in `frontend/.env.local` and enable Google login in Supabase.
- The backend uses in-memory workout storage when Supabase is not configured, which keeps local demos simple.
- The current AI recognizer is modular and heuristic-based. It is designed to be replaced or augmented by a trained classifier without changing the API contract.
