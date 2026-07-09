# AI Exercise Trainer Development Roadmap

## Phase 1: Foundation
- Create monorepo structure for `frontend`, `backend`, `shared`, `database`, and `docs`.
- Define shared workout, pose, feedback, and settings contracts.
- Add environment examples and deployment notes.

## Phase 2: Core AI Pipeline
- Accept webcam frames from the frontend.
- Run pose detection with MediaPipe when available.
- Normalize 33 pose landmarks into API-friendly structures.
- Calculate joint angles and movement features.
- Recognize exercise candidates automatically.
- Count reps with finite-state counters.
- Evaluate posture rules and return cooldown-safe feedback messages.

## Phase 3: Product Experience
- Implement dashboard, camera trainer, history, settings, and login views.
- Add speech synthesis controls, camera selection, sensitivity, difficulty, and theme settings.
- Persist workout summaries to Supabase through backend APIs.

## Phase 4: Production Hardening
- Add authentication middleware with Supabase JWT validation.
- Add integration tests for exercise recognition and rep counting.
- Add observability, request limits, and deployment health checks.
- Tune posture rules using real workout clips and user testing.

## Current Baseline
This repository includes a functional, deployment-ready scaffold with a simulated-safe fallback path when MediaPipe or a webcam is unavailable. The architecture keeps the AI pipeline modular so model-backed recognition can be upgraded independently.
