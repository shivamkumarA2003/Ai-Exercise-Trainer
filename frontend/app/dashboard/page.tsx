"use client";

import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { MetricCard } from "@/components/MetricCard";
import { WorkoutChart } from "@/components/WorkoutChart";
import { listWorkouts } from "@/services/api";
import type { WorkoutReport } from "@/types/workout";

export default function DashboardPage() {
  const [reports, setReports] = useState<WorkoutReport[]>([]);
  useEffect(() => { listWorkouts().then(setReports); }, []);
  const totalReps = reports.reduce((sum, item) => sum + item.repetitions, 0);
  const totalCalories = reports.reduce((sum, item) => sum + item.calories, 0);
  const duration = reports.reduce((sum, item) => sum + item.durationSeconds, 0);
  const accuracy = reports.length ? Math.round(reports.reduce((sum, item) => sum + item.accuracy, 0) / reports.length) : 100;

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-medium uppercase tracking-wide text-ocean">Today&apos;s workout</p>
        <h1 className="text-3xl font-semibold text-ink">Train with real-time posture feedback</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Workouts" value={reports.length} detail="Saved sessions" />
        <MetricCard label="Total Repetitions" value={totalReps} detail="Across all exercises" />
        <MetricCard label="Accuracy" value={`${accuracy}%`} detail="Average form score" />
        <MetricCard label="Calories" value={totalCalories.toFixed(1)} detail={`${Math.round(duration / 60)} active minutes`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <WorkoutChart reports={reports} />
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-semibold text-ink">Workout Streak</h2>
          <p className="mt-3 text-5xl font-semibold text-ocean">{reports.length ? Math.min(reports.length, 7) : 0}</p>
          <p className="mt-2 text-sm text-slate-500">Consistent training days estimated from recent saved sessions.</p>
        </section>
      </div>
    </AppShell>
  );
}
