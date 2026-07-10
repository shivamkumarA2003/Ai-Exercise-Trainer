"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { MutableRefObject } from "react";
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

const dailyFlow = [
  { day: "Mon", title: "Strength Base", focus: "Squat + Push-up", target: "3 sets x 12 reps" },
  { day: "Tue", title: "Upper Body", focus: "Curl + Shoulder press", target: "4 sets x 10 reps" },
  { day: "Wed", title: "Core Control", focus: "Plank + Mobility", target: "5 rounds" },
  { day: "Thu", title: "Leg Power", focus: "Lunge + Squat", target: "3 sets x 14 reps" },
  { day: "Fri", title: "Cardio Burn", focus: "Jumping jack", target: "8 min flow" },
  { day: "Sat", title: "Full Body AI", focus: "Auto detect", target: "20 min" },
  { day: "Sun", title: "Recovery", focus: "Light movement", target: "Stretch" },
];

type MotionSignal = "up" | "down" | "mid";

export function CameraTrainer() {
  const webcamRef = useRef<Webcam>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previousFrameRef = useRef<Uint8ClampedArray | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | "auto">("squat");
  const [motionStatus, setMotionStatus] = useState<{ signal: MotionSignal; confidence: number }>({ signal: "mid", confidence: 0 });
  const { sessionId, status, setStatus, latest, setLatest, settings, resetSession } = useTrainerStore();
  useSpeechCoach(latest?.feedback, settings.voiceEnabled, settings.speechRate);

  const capture = useCallback(async () => {
    const frameBase64 = webcamRef.current?.getScreenshot();
    const motion = estimateMotionSignal(webcamRef.current?.video ?? null, canvasRef, previousFrameRef);
    setMotionStatus(motion);
    try {
      const result = await analyzePose({
        sessionId,
        frameBase64: frameBase64 ?? undefined,
        selectedExercise: selectedExercise === "auto" ? undefined : selectedExercise,
        motionSignal: motion.signal,
        motionConfidence: motion.confidence,
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
    <div className="space-y-6">
      <section className="rounded-lg bg-gradient-to-br from-ink via-slate-900 to-ocean p-5 text-white shadow-xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-limefit">AI live coaching</p>
            <h1 className="mt-1 text-3xl font-semibold">Exercise Trainer Studio</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-200">Select your exercise, start the camera, and let computer vision track motion, reps, calories, accuracy, and coaching cues.</p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-3 text-right backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-300">Session status</p>
            <p className="text-2xl font-semibold capitalize">{status}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="relative overflow-hidden rounded-lg bg-ink shadow-lg">
          <Webcam ref={webcamRef} mirrored audio={false} screenshotFormat="image/jpeg" className="aspect-video w-full object-cover" videoConstraints={{ deviceId: settings.cameraDeviceId }} />
          <canvas ref={canvasRef} className="hidden" />
          {latest?.landmarks ? <SkeletonOverlay landmarks={latest.landmarks} /> : null}
          <div className="absolute left-4 top-4 flex flex-wrap gap-2 text-sm text-white">
            <span className="rounded-md bg-black/60 px-3 py-2">FPS {latest?.fps ?? "--"}</span>
            <span className="rounded-md bg-black/60 px-3 py-2">Motion {motionStatus.signal} {Math.round(motionStatus.confidence * 100)}%</span>
          </div>
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <GlassStat label="Reps" value={latest?.repetitions ?? 0} />
            <GlassStat label="Calories" value={latest?.calories ?? 0} />
            <GlassStat label="Accuracy" value={`${latest?.accuracy ?? 100}%`} />
            <GlassStat label="Time" value={`${latest?.durationSeconds ?? 0}s`} />
          </div>
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
          <h2 className="mt-1 text-3xl font-semibold capitalize text-ink">{latest?.exercise?.replace("_", " ") ?? "Waiting"}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {latest?.landmarks?.length ? `Tracking ${latest.landmarks.length} body landmarks with MediaPipe` : "Using camera motion fallback until body landmarks are detected"}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button onClick={() => setStatus("running")} className="rounded-md bg-ocean px-4 py-2 font-medium text-white shadow-sm">Start</button>
            <button onClick={() => setStatus("paused")} className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-700">Pause</button>
            <button onClick={stopWorkout} className="rounded-md bg-ink px-4 py-2 font-medium text-white">Stop</button>
            <button onClick={resetSession} className="rounded-md bg-slate-100 px-4 py-2 font-medium text-slate-700">Reset</button>
          </div>

          {error ? <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}

          <div className="mt-5 space-y-2">
            {(latest?.feedback?.length ? latest.feedback : [{ code: "ready", message: "Choose an exercise and press Start.", severity: "info" as const }]).map((item) => (
              <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} key={item.code} className="rounded-md bg-limefit/30 p-3 text-sm text-ink">
                {item.message}
              </motion.p>
            ))}
          </div>
        </aside>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-ocean">AI exercise flow</p>
            <h2 className="text-2xl font-semibold text-ink">Day-wise training plan</h2>
          </div>
          <span className="rounded-full bg-limefit/40 px-3 py-1 text-sm font-medium text-ink">Beginner friendly</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-7">
          {dailyFlow.map((item) => (
            <div key={item.day} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-ocean">{item.day}</p>
              <h3 className="mt-2 font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{item.focus}</p>
              <p className="mt-3 rounded-md bg-white px-2 py-1 text-xs font-medium text-slate-600">{item.target}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function GlassStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/85 p-3 text-ink shadow-sm backdrop-blur">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function estimateMotionSignal(
  video: HTMLVideoElement | null,
  canvasRef: MutableRefObject<HTMLCanvasElement | null>,
  previousFrameRef: MutableRefObject<Uint8ClampedArray | null>,
): { signal: MotionSignal; confidence: number } {
  if (!video || video.readyState < 2) return { signal: "mid", confidence: 0 };
  const canvas = canvasRef.current ?? document.createElement("canvas");
  canvasRef.current = canvas;
  canvas.width = 48;
  canvas.height = 36;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return { signal: "mid", confidence: 0 };
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const previous = previousFrameRef.current;
  const gray = new Uint8ClampedArray(canvas.width * canvas.height);
  let changed = 0;
  let weightedY = 0;

  for (let index = 0; index < gray.length; index += 1) {
    const dataIndex = index * 4;
    const value = Math.round((data[dataIndex] + data[dataIndex + 1] + data[dataIndex + 2]) / 3);
    gray[index] = value;
    if (previous) {
      const delta = Math.abs(value - previous[index]);
      if (delta > 18) {
        const y = Math.floor(index / canvas.width) / canvas.height;
        changed += delta;
        weightedY += y * delta;
      }
    }
  }

  previousFrameRef.current = gray;
  if (!previous || changed < 2200) return { signal: "mid", confidence: 0 };
  const centerY = weightedY / changed;
  const confidence = Math.min(1, changed / 16000);
  if (centerY > 0.56) return { signal: "down", confidence };
  if (centerY < 0.44) return { signal: "up", confidence };
  return { signal: "mid", confidence: confidence * 0.6 };
}
