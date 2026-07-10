from __future__ import annotations

from dataclasses import dataclass, field

from backend.models.schemas import ExerciseType, Landmark
from backend.utils.geometry import angle, landmark_map, midpoint


@dataclass
class CounterState:
    repetitions: int = 0
    incorrect_repetitions: int = 0
    phase: str = "up"
    started_at: float | None = None
    last_timestamp: float = 0
    last_rep_timestamp: float = 0
    exercise: ExerciseType = ExerciseType.unknown


@dataclass
class RepCounterRegistry:
    sessions: dict[str, CounterState] = field(default_factory=dict)

    def update(
        self,
        session_id: str,
        exercise: ExerciseType,
        landmarks: list[Landmark],
        timestamp: float,
        posture_ok: bool,
        motion_signal: str | None = None,
        motion_confidence: float = 0,
    ) -> CounterState:
        state = self.sessions.setdefault(session_id, CounterState(started_at=timestamp, exercise=exercise))
        if state.exercise != exercise and exercise != ExerciseType.unknown:
            state.exercise = exercise
            state.phase = "up"
        state.last_timestamp = timestamp
        signal = motion_signal if motion_signal and motion_confidence >= 0.45 else _movement_signal(exercise, landmarks)
        if signal == "down" and state.phase == "up":
            state.phase = "down"
        elif signal == "up" and state.phase == "down" and timestamp - state.last_rep_timestamp >= 0.65:
            state.phase = "up"
            state.repetitions += 1
            state.last_rep_timestamp = timestamp
            if not posture_ok:
                state.incorrect_repetitions += 1
        return state


def _movement_signal(exercise: ExerciseType, landmarks: list[Landmark]) -> str:
    points = landmark_map(landmarks)
    if exercise in {ExerciseType.squat, ExerciseType.lunge}:
        knee = min(_ang(points, "left_hip", "left_knee", "left_ankle"), _ang(points, "right_hip", "right_knee", "right_ankle"))
        return "down" if knee < 105 else "up" if knee > 155 else "mid"
    if exercise in {ExerciseType.push_up, ExerciseType.bicep_curl}:
        elbow = min(_ang(points, "left_shoulder", "left_elbow", "left_wrist"), _ang(points, "right_shoulder", "right_elbow", "right_wrist"))
        return "down" if elbow < 85 else "up" if elbow > 155 else "mid"
    if exercise == ExerciseType.shoulder_press:
        if "left_wrist" in points and "right_wrist" in points and "left_shoulder" in points and "right_shoulder" in points:
            return "up" if points["left_wrist"].y < points["left_shoulder"].y and points["right_wrist"].y < points["right_shoulder"].y else "down"
    if exercise == ExerciseType.jumping_jack:
        if {"left_ankle", "right_ankle", "left_shoulder", "right_shoulder"}.issubset(points):
            ankle_width = abs(points["left_ankle"].x - points["right_ankle"].x)
            shoulder_width = abs(points["left_shoulder"].x - points["right_shoulder"].x)
            return "down" if ankle_width > shoulder_width * 1.4 else "up"
    if exercise == ExerciseType.plank:
        return "down"
    return "mid"


def _ang(points: dict[str, Landmark], a: str, b: str, c: str) -> float:
    if not {a, b, c}.issubset(points):
        return 180
    return angle(points[a], points[b], points[c])
