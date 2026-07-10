from __future__ import annotations

from time import perf_counter

from backend.counter.rep_counter import RepCounterRegistry
from backend.exercise.recognizer import ExercisePrediction, ExerciseRecognizer
from backend.models.schemas import ExerciseType, PoseAnalysisRequest, PoseAnalysisResponse
from backend.pose.mediapipe_pose import detect_landmarks
from backend.posture.rules import PostureEvaluator
from backend.voice.feedback import FeedbackCooldown


class WorkoutAnalyzer:
    def __init__(self) -> None:
        self.recognizer = ExerciseRecognizer()
        self.posture = PostureEvaluator()
        self.counters = RepCounterRegistry()
        self.feedback = FeedbackCooldown()

    def analyze(self, payload: PoseAnalysisRequest) -> PoseAnalysisResponse:
        start = perf_counter()
        landmarks = payload.landmarks or detect_landmarks(payload.frame_base64)
        prediction = self._predict_exercise(payload, landmarks)
        posture_ok, raw_feedback = self.posture.evaluate(prediction.exercise, landmarks)
        state = self.counters.update(
            payload.session_id,
            prediction.exercise,
            landmarks,
            payload.timestamp,
            posture_ok,
            payload.motion_signal,
            payload.motion_confidence,
        )
        duration = int(max(0, payload.timestamp - (state.started_at or payload.timestamp)))
        incorrect = state.incorrect_repetitions
        reps = state.repetitions
        accuracy = round(100 * (1 - incorrect / reps), 1) if reps else 100
        calories = round(reps * _calories_per_rep(prediction.exercise), 1)
        elapsed = max(perf_counter() - start, 0.001)
        return PoseAnalysisResponse(
            exercise=prediction.exercise,
            confidence=prediction.confidence,
            repetitions=reps,
            incorrectRepetitions=incorrect,
            accuracy=accuracy,
            calories=calories,
            durationSeconds=duration,
            fps=round(1 / elapsed, 1),
            feedback=self.feedback.filter(payload.session_id, raw_feedback, payload.timestamp),
            landmarks=landmarks,
        )

    def _predict_exercise(self, payload: PoseAnalysisRequest, landmarks) -> ExercisePrediction:
        if payload.selected_exercise and payload.selected_exercise != ExerciseType.unknown:
            confidence = 0.95 if landmarks else 0.4
            return ExercisePrediction(payload.selected_exercise, confidence)
        return self.recognizer.predict(landmarks)


def _calories_per_rep(exercise) -> float:
    return {
        "push_up": 0.35,
        "squat": 0.32,
        "bicep_curl": 0.18,
        "shoulder_press": 0.28,
        "lunge": 0.3,
        "jumping_jack": 0.2,
        "plank": 0.05,
    }.get(str(exercise), 0.15)
