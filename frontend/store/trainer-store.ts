"use client";

import { create } from "zustand";
import type { PoseAnalysisResponse, UserSettings, WorkoutStatus } from "@/types/workout";

interface TrainerState {
  sessionId: string;
  status: WorkoutStatus;
  latest?: PoseAnalysisResponse;
  settings: UserSettings;
  setStatus: (status: WorkoutStatus) => void;
  setLatest: (latest: PoseAnalysisResponse) => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
  resetSession: () => void;
}

const defaultSettings: UserSettings = {
  voiceEnabled: true,
  speechRate: 0.95,
  theme: "system",
  difficulty: "beginner",
  sensitivity: 0.65,
  units: "kg",
};

export const useTrainerStore = create<TrainerState>((set) => ({
  sessionId: crypto.randomUUID(),
  status: "idle",
  settings: defaultSettings,
  setStatus: (status) => set({ status }),
  setLatest: (latest) => set({ latest }),
  updateSettings: (settings) => set((state) => ({ settings: { ...state.settings, ...settings } })),
  resetSession: () => set({ sessionId: crypto.randomUUID(), latest: undefined, status: "idle" }),
}));
