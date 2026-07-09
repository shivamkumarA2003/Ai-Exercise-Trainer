"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { listWorkouts } from "@/services/api";
import type { WorkoutReport } from "@/types/workout";

export default function HistoryPage() {
  const [reports, setReports] = useState<WorkoutReport[]>([]);
  const [exercise, setExercise] = useState("all");
  useEffect(() => { listWorkouts().then(setReports); }, []);
  const filtered = useMemo(() => reports.filter((item) => exercise === "all" || item.exercise === exercise), [reports, exercise]);

  return (
    <AppShell>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-ocean">History</p>
          <h1 className="text-3xl font-semibold text-ink">Previous workouts</h1>
        </div>
        <select value={exercise} onChange={(event) => setExercise(event.target.value)} className="rounded-md border border-slate-300 bg-white px-3 py-2">
          <option value="all">All exercises</option>
          {Array.from(new Set(reports.map((item) => item.exercise))).map((item) => <option key={item} value={item}>{item.replace("_", " ")}</option>)}
        </select>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr><th className="p-3">Exercise</th><th className="p-3">Date</th><th className="p-3">Reps</th><th className="p-3">Accuracy</th><th className="p-3">Duration</th></tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id} className="border-t border-slate-100">
                <td className="p-3 capitalize">{item.exercise.replace("_", " ")}</td>
                <td className="p-3">{new Date(item.startedAt).toLocaleString()}</td>
                <td className="p-3">{item.repetitions}</td>
                <td className="p-3">{item.accuracy}%</td>
                <td className="p-3">{item.durationSeconds}s</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length ? <p className="p-6 text-center text-slate-500">No workouts match the current filter.</p> : null}
      </div>
    </AppShell>
  );
}
