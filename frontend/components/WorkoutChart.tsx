"use client";

import { Bar } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import type { WorkoutReport } from "@/types/workout";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function WorkoutChart({ reports }: { reports: WorkoutReport[] }) {
  const recent = reports.slice(-7);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 font-semibold text-ink">Weekly Progress</h2>
      <Bar
        data={{
          labels: recent.map((item) => new Date(item.startedAt).toLocaleDateString()),
          datasets: [
            { label: "Reps", data: recent.map((item) => item.repetitions), backgroundColor: "#0f766e" },
            { label: "Accuracy", data: recent.map((item) => item.accuracy), backgroundColor: "#bef264" },
          ],
        }}
        options={{ responsive: true, plugins: { legend: { position: "bottom" } } }}
      />
    </div>
  );
}
