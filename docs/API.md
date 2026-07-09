# API Documentation

Base URL: `http://localhost:8000/api`

## Health
`GET /health`

Returns:
```json
{ "status": "ok" }
```

## Analyze Pose
`POST /pose/analyze`

Accepts a webcam frame, client-provided landmarks, or both. If landmarks are omitted, the backend attempts MediaPipe Pose extraction from `frameBase64`.

```json
{
  "sessionId": "session-uuid",
  "frameBase64": "data:image/jpeg;base64,...",
  "timestamp": 1760000000.12
}
```

Returns:
```json
{
  "exercise": "squat",
  "confidence": 0.82,
  "repetitions": 4,
  "incorrectRepetitions": 1,
  "accuracy": 75,
  "calories": 1.3,
  "durationSeconds": 42,
  "fps": 18.4,
  "feedback": [{ "code": "squat_chest", "message": "Raise your chest.", "severity": "warning" }],
  "landmarks": []
}
```

## Create Workout
`POST /workouts`

Stores a completed workout in Supabase when configured, otherwise stores it in process memory for local demos.

## List Workouts
`GET /workouts?userId=demo-user`

Returns workout reports ordered by start time when Supabase is configured.
