export type ExerciseType =
  | "push_up"
  | "squat"
  | "bicep_curl"
  | "shoulder_press"
  | "lunge"
  | "jumping_jack"
  | "plank"
  | "unknown";

export type WorkoutStatus = "idle" | "running" | "paused" | "stopped";

export interface Landmark {
  name: string;
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export interface FeedbackMessage {
  code: string;
  message: string;
  severity: "success" | "info" | "warning" | "danger";
}

export interface PoseAnalysisRequest {
  sessionId: string;
  frameBase64?: string;
  landmarks?: Landmark[];
  timestamp: number;
}

export interface PoseAnalysisResponse {
  exercise: ExerciseType;
  confidence: number;
  repetitions: number;
  incorrectRepetitions: number;
  accuracy: number;
  calories: number;
  durationSeconds: number;
  fps: number;
  feedback: FeedbackMessage[];
  landmarks: Landmark[];
}

export interface WorkoutReport {
  id: string;
  userId: string;
  exercise: ExerciseType;
  startedAt: string;
  endedAt: string;
  repetitions: number;
  incorrectRepetitions: number;
  accuracy: number;
  calories: number;
  durationSeconds: number;
}

export interface UserSettings {
  voiceEnabled: boolean;
  speechRate: number;
  theme: "light" | "dark" | "system";
  difficulty: "beginner" | "intermediate" | "advanced";
  sensitivity: number;
  units: "kg" | "lb";
  cameraDeviceId?: string;
}
