from __future__ import annotations

from fastapi import APIRouter, Query

from backend.models.schemas import PoseAnalysisRequest, PoseAnalysisResponse, WorkoutCreate, WorkoutReport
from backend.services.workout_analyzer import WorkoutAnalyzer
from backend.services.workouts import WorkoutRepository

router = APIRouter()
analyzer = WorkoutAnalyzer()
repo = WorkoutRepository()


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/pose/analyze", response_model=PoseAnalysisResponse)
def analyze_pose(payload: PoseAnalysisRequest) -> PoseAnalysisResponse:
    return analyzer.analyze(payload)


@router.post("/workouts", response_model=WorkoutReport)
def create_workout(payload: WorkoutCreate) -> WorkoutReport:
    return repo.create(payload)


@router.get("/workouts", response_model=list[WorkoutReport])
def list_workouts(user_id: str | None = Query(default=None, alias="userId")) -> list[WorkoutReport]:
    return repo.list(user_id)
