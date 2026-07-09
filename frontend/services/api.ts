import type { PoseAnalysisRequest, PoseAnalysisResponse, WorkoutReport } from "@/types/workout";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

export async function analyzePose(payload: PoseAnalysisRequest): Promise<PoseAnalysisResponse> {
  const response = await fetch(`${API_URL}/pose/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error("Pose analysis failed");
  return response.json();
}

export async function listWorkouts(userId = "demo-user"): Promise<WorkoutReport[]> {
  const response = await fetch(`${API_URL}/workouts?userId=${encodeURIComponent(userId)}`);
  if (!response.ok) return [];
  return response.json();
}

export async function saveWorkout(report: Omit<WorkoutReport, "id">): Promise<WorkoutReport> {
  const response = await fetch(`${API_URL}/workouts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
  });
  if (!response.ok) throw new Error("Workout save failed");
  return response.json();
}
