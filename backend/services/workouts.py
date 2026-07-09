from __future__ import annotations

from uuid import uuid4

from backend.database.client import get_supabase
from backend.models.schemas import WorkoutCreate, WorkoutReport

_memory_reports: list[WorkoutReport] = []


class WorkoutRepository:
    def create(self, payload: WorkoutCreate) -> WorkoutReport:
        report = WorkoutReport(id=str(uuid4()), **payload.model_dump(by_alias=False))
        client = get_supabase()
        if client:
            data = report.model_dump(mode="json", by_alias=False)
            client.table("workouts").insert(data).execute()
        else:
            _memory_reports.append(report)
        return report

    def list(self, user_id: str | None = None) -> list[WorkoutReport]:
        client = get_supabase()
        if client and user_id:
            result = client.table("workouts").select("*").eq("user_id", user_id).order("started_at", desc=True).execute()
            return [WorkoutReport(**item) for item in result.data]
        return [item for item in _memory_reports if user_id is None or item.user_id == user_id]
