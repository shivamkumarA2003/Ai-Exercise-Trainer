"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { motion } from "framer-motion";
import { analyzePose, saveWorkout } from "@/services/api";
import { useSpeechCoach } from "@/hooks/useSpeechCoach";
import { useTrainerStore } from "@/store/trainer-store";
import { SkeletonOverlay } from "@/components/SkeletonOverlay";
import type { ExerciseType } from "@/types/workout";

const exerciseOptions: Array<{ label: string; value: ExerciseType | "auto" }> = [
  { label: "Auto detect", value: "auto" },
  { label: "Squat", value: "squat" },
  { label: "Push-up", value: "push_up" },
  { label: "Bicep curl", value: "bicep_curl" },
  { label: "Shoulder press", value: "shoulder_press" },
  { label: "Lunge", value: "lunge" },
  { label: "Jumping jack", value: "jumping_jack" },
  { label: "Plank", value: "plank" },
];

export function CameraTrainer() {
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | "auto">("squat");
  const { sessionId, status, setStatus, latest, setLatest, settings, resetSession } = useTrainerStore();
  useSpeechCoach(latest?.feedback, settings.voiceEnabled, settings.speechRate);

  const capture = useCallback(async () => {
    const frameBase64 = webcamRef.current?.getScreenshot();
    try {
      const result = await analyzePose({
        sessionId,
        frameBase64: frameBase64 ?? undefined,
        selectedExercise: selectedExercise === "auto" ? undefined : selectedExercise,
        timestamp: Date.now() / 1000,
      });
      setLatest(result);
      setError("");
    } catch {
      setError("Pose service is unavailable. Start the FastAPI server and try again.");
    }
  }, [selectedExercise, sessionId, setLatest]);

  useEffect(() => {
    if (status === "running") intervalRef.current = setInterval(capture, 700);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [capture, status]);

  async function stopWorkout() {
    setStatus("stopped");
    if (latest) {
      const now = new Date();
      await saveWorkout({
        userId: "demo-user",
        exercise: latest.exercise,
        startedAt: new Date(now.getTime() - latest.durationSeconds * 1000).toISOString(),
        endedAt: now.toISOString(),
        repetitions: latest.repetitions,
        incorrectRepetitions: latest.incorrectRepetitions,
        accuracy: latest.accuracy,
        calories: latest.calories,
        durationSeconds: latest.durationSeconds,
      }).catch(() => undefined);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="relative overflow-hidden rounded-lg bg-ink">
        <Webcam ref={webcamRef} mirrored audio={false} screenshotFormat="image/jpeg" className="aspect-video w-full object-cover" videoConstraints={{ deviceId: settings.cameraDeviceId }} />
        {latest?.landmarks ? <SkeletonOverlay landmarks={latest.landmarks} /> : null}
        <div className="absolute left-4 top-4 rounded-md bg-black/60 px-3 py-2 text-sm text-white">FPS {latest?.fps ?? "--"}</div>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block">
          <span className="text-sm uppercase tracking-wide text-slate-500">Exercise you are doing</span>
          <select
            value={selectedExercise}
            onChange={(event) => setSelectedExercise(event.target.value as ExerciseType | "auto")}
            className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-ink"
          >
            {exerciseOptions.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </label>
        <p className="mt-5 text-sm uppercase tracking-wide text-slate-500">Computer vision result</p>
        <h1 className="mt-1 text-3xl font-semibold capitalize text-ink">{latest?.exercise?.replace("_", " ") ?? "Waiting"}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {latest?.landmarks?.length ? `Tracking ${latest.landmarks.length} body landmarks` : "Searching for body landmarks"}
        </p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Stat label="Reps" value={latest?.repetitions ?? 0} />
          <Stat label="Accuracy" value={`${latest?.accuracy ?? 100}%`} />
          <Stat label="Calories" value={latest?.calories ?? 0} />
          <Stat label="Duration" value={`${latest?.durationSeconds ?? 0}s`} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button onClick={() => setStatus("running")} className="rounded-md bg-ocean px-4 py-2 font-medium text-white">Start</button>
          <button onClick={() => setStatus("paused")} className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-700">Pause</button>
          <button onClick={stopWorkout} className="rounded-md bg-ink px-4 py-2 font-medium text-white">Stop</button>
          <button onClick={resetSession} className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-700">Reset</button>
        </div>
        {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
        <div className="mt-5 space-y-2">
          {(latest?.feedback ?? []).map((item) => (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={item.code} className="rounded-md bg-limefit/30 p-3 text-sm text-ink">
              {item.message}
            </motion.p>
          ))}
        </div>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-md bg-slate-50 p-3"><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-semibold text-ink">{value}</p></div>;
}
