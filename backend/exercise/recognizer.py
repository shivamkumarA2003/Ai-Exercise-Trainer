from __future__ import annotations

from dataclasses import dataclass

from backend.models.schemas import ExerciseType, Landmark
from backend.utils.geometry import angle, distance, landmark_map, midpoint


@dataclass(frozen=True)
class ExercisePrediction:
    exercise: ExerciseType
    confidence: float


class ExerciseRecognizer:
    def predict(self, landmarks: list[Landmark]) -> ExercisePrediction:
        points = landmark_map(landmarks)
        required = {"left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_knee", "right_knee"}
        if not required.issubset(points):
            return ExercisePrediction(ExerciseType.unknown, 0)

        left_elbow = _safe_angle(points, "left_shoulder", "left_elbow", "left_wrist")
        right_elbow = _safe_angle(points, "right_shoulder", "right_elbow", "right_wrist")
        left_knee = _safe_angle(points, "left_hip", "left_knee", "left_ankle")
        right_knee = _safe_angle(points, "right_hip", "right_knee", "right_ankle")

        shoulder = midpoint("shoulder_mid", points["left_shoulder"], points["right_shoulder"])
        hip = midpoint("hip_mid", points["left_hip"], points["right_hip"])
        vertical_span = max(distance(shoulder, hip), 0.01)
        torso_slope = abs(shoulder.y - hip.y) / vertical_span
        wrist_overhead = _wrist_overhead(points)

        if wrist_overhead and left_elbow > 130 and right_elbow > 130:
            return ExercisePrediction(ExerciseType.shoulder_press, 0.74)
        if left_knee < 135 and right_knee < 135 and torso_slope > 0.35:
            return ExercisePrediction(ExerciseType.squat, 0.82)
        if left_elbow < 120 or right_elbow < 120:
            wrists_near_shoulders = _wrists_near_shoulders(points)
            if wrists_near_shoulders:
                return ExercisePrediction(ExerciseType.bicep_curl, 0.76)
            return ExercisePrediction(ExerciseType.push_up, 0.68)
        if _feet_wide(points) and wrist_overhead:
            return ExercisePrediction(ExerciseType.jumping_jack, 0.72)
        if abs(left_knee - right_knee) > 35:
            return ExercisePrediction(ExerciseType.lunge, 0.7)
        if torso_slope < 0.2:
            return ExercisePrediction(ExerciseType.plank, 0.64)
        return ExercisePrediction(ExerciseType.unknown, 0.2)


def _safe_angle(points: dict[str, Landmark], a: str, b: str, c: str) -> float:
    if a not in points or b not in points or c not in points:
        return 180
    return angle(points[a], points[b], points[c])


def _wrist_overhead(points: dict[str, Landmark]) -> bool:
    return (
        "left_wrist" in points
        and "right_wrist" in points
        and points["left_wrist"].y < points["left_shoulder"].y
        and points["right_wrist"].y < points["right_shoulder"].y
    )


def _wrists_near_shoulders(points: dict[str, Landmark]) -> bool:
    return all(key in points for key in ["left_wrist", "right_wrist"]) and (
        distance(points["left_wrist"], points["left_shoulder"]) < 0.35
        or distance(points["right_wrist"], points["right_shoulder"]) < 0.35
    )


def _feet_wide(points: dict[str, Landmark]) -> bool:
    if "left_ankle" not in points or "right_ankle" not in points or "left_shoulder" not in points or "right_shoulder" not in points:
        return False
    return distance(points["left_ankle"], points["right_ankle"]) > distance(points["left_shoulder"], points["right_shoulder"]) * 1.35
