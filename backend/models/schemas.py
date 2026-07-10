from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Literal

from pydantic import BaseModel, Field


class ExerciseType(StrEnum):
    push_up = "push_up"
    squat = "squat"
    bicep_curl = "bicep_curl"
    shoulder_press = "shoulder_press"
    lunge = "lunge"
    jumping_jack = "jumping_jack"
    plank = "plank"
    unknown = "unknown"


class Landmark(BaseModel):
    name: str
    x: float
    y: float
    z: float = 0
    visibility: float = 1


class FeedbackMessage(BaseModel):
    code: str
    message: str
    severity: Literal["success", "info", "warning", "danger"] = "info"


class PoseAnalysisRequest(BaseModel):
    session_id: str = Field(alias="sessionId")
    frame_base64: str | None = Field(default=None, alias="frameBase64")
    landmarks: list[Landmark] | None = None
    selected_exercise: ExerciseType | None = Field(default=None, alias="selectedExercise")
    motion_signal: Literal["up", "down", "mid"] | None = Field(default=None, alias="motionSignal")
    motion_confidence: float = Field(default=0, alias="motionConfidence")
    timestamp: float

    model_config = {"populate_by_name": True}


class PoseAnalysisResponse(BaseModel):
    exercise: ExerciseType
    confidence: float
    repetitions: int
    incorrect_repetitions: int = Field(alias="incorrectRepetitions")
    accuracy: float
    calories: float
    duration_seconds: int = Field(alias="durationSeconds")
    fps: float
    feedback: list[FeedbackMessage]
    landmarks: list[Landmark]

    model_config = {"populate_by_name": True}


class WorkoutCreate(BaseModel):
    user_id: str = Field(alias="userId")
    exercise: ExerciseType
    started_at: datetime = Field(alias="startedAt")
    ended_at: datetime = Field(alias="endedAt")
    repetitions: int
    incorrect_repetitions: int = Field(alias="incorrectRepetitions")
    accuracy: float
    calories: float
    duration_seconds: int = Field(alias="durationSeconds")

    model_config = {"populate_by_name": True}


class WorkoutReport(WorkoutCreate):
    id: str
