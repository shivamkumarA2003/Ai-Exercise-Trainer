from __future__ import annotations

from backend.models.schemas import ExerciseType, FeedbackMessage, Landmark
from backend.utils.geometry import angle, landmark_map, midpoint


class PostureEvaluator:
    def evaluate(self, exercise: ExerciseType, landmarks: list[Landmark]) -> tuple[bool, list[FeedbackMessage]]:
        points = landmark_map(landmarks)
        messages: list[FeedbackMessage] = []
        if exercise == ExerciseType.push_up:
            messages.extend(_push_up(points))
        elif exercise == ExerciseType.squat:
            messages.extend(_squat(points))
        elif exercise == ExerciseType.bicep_curl:
            messages.extend(_bicep_curl(points))
        elif exercise == ExerciseType.plank:
            messages.extend(_plank(points))
        elif exercise != ExerciseType.unknown:
            messages.append(FeedbackMessage(code="steady", message="Good repetition.", severity="success"))
        else:
            messages.append(FeedbackMessage(code="detecting", message="Step into frame and start moving.", severity="info"))
        if not any(item.severity in {"warning", "danger"} for item in messages) and exercise != ExerciseType.unknown:
            messages.insert(0, FeedbackMessage(code="excellent", message="Excellent posture.", severity="success"))
        return not any(item.severity in {"warning", "danger"} for item in messages), messages


def _push_up(points: dict[str, Landmark]) -> list[FeedbackMessage]:
    out: list[FeedbackMessage] = []
    if {"left_shoulder", "right_shoulder", "left_hip", "right_hip", "left_knee", "right_knee"}.issubset(points):
        shoulder = midpoint("shoulder_mid", points["left_shoulder"], points["right_shoulder"])
        hip = midpoint("hip_mid", points["left_hip"], points["right_hip"])
        knee = midpoint("knee_mid", points["left_knee"], points["right_knee"])
        body_angle = angle(shoulder, hip, knee)
        if body_angle < 155:
            out.append(FeedbackMessage(code="pushup_back", message="Straighten your back.", severity="warning"))
        if hip.y < shoulder.y - 0.08:
            out.append(FeedbackMessage(code="pushup_hips_high", message="Lower your hips.", severity="warning"))
        if hip.y > shoulder.y + 0.16:
            out.append(FeedbackMessage(code="pushup_hips_low", message="Raise your hips slightly.", severity="warning"))
    return out


def _squat(points: dict[str, Landmark]) -> list[FeedbackMessage]:
    out: list[FeedbackMessage] = []
    if {"left_hip", "left_knee", "left_ankle", "right_hip", "right_knee", "right_ankle"}.issubset(points):
        depth = min(angle(points["left_hip"], points["left_knee"], points["left_ankle"]), angle(points["right_hip"], points["right_knee"], points["right_ankle"]))
        if depth > 125:
            out.append(FeedbackMessage(code="squat_depth", message="Squat a little deeper.", severity="warning"))
        if points["left_knee"].x < points["left_ankle"].x - 0.08 or points["right_knee"].x > points["right_ankle"].x + 0.08:
            out.append(FeedbackMessage(code="squat_knees", message="Keep your knees aligned with your feet.", severity="warning"))
    if {"left_shoulder", "right_shoulder", "left_hip", "right_hip"}.issubset(points):
        shoulder = midpoint("shoulder_mid", points["left_shoulder"], points["right_shoulder"])
        hip = midpoint("hip_mid", points["left_hip"], points["right_hip"])
        if abs(shoulder.x - hip.x) > 0.18:
            out.append(FeedbackMessage(code="squat_chest", message="Raise your chest.", severity="warning"))
    return out


def _bicep_curl(points: dict[str, Landmark]) -> list[FeedbackMessage]:
    out: list[FeedbackMessage] = []
    if {"left_elbow", "left_shoulder", "right_elbow", "right_shoulder"}.issubset(points):
        if abs(points["left_elbow"].x - points["left_shoulder"].x) > 0.16 or abs(points["right_elbow"].x - points["right_shoulder"].x) > 0.16:
            out.append(FeedbackMessage(code="curl_elbows", message="Keep your elbows close.", severity="warning"))
    return out


def _plank(points: dict[str, Landmark]) -> list[FeedbackMessage]:
    out = _push_up(points)
    if not out:
        out.append(FeedbackMessage(code="plank_hold", message="Hold steady and keep your neck neutral.", severity="info"))
    return out
