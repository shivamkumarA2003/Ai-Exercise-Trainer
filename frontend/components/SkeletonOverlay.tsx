"use client";

import type { Landmark } from "@/types/workout";

const edges = [
  ["left_shoulder", "right_shoulder"], ["left_shoulder", "left_elbow"], ["left_elbow", "left_wrist"],
  ["right_shoulder", "right_elbow"], ["right_elbow", "right_wrist"], ["left_shoulder", "left_hip"],
  ["right_shoulder", "right_hip"], ["left_hip", "right_hip"], ["left_hip", "left_knee"],
  ["left_knee", "left_ankle"], ["right_hip", "right_knee"], ["right_knee", "right_ankle"],
];

export function SkeletonOverlay({ landmarks }: { landmarks: Landmark[] }) {
  const map = Object.fromEntries(landmarks.map((item) => [item.name, item]));
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 1 1" preserveAspectRatio="none">
      {edges.map(([a, b]) => map[a] && map[b] ? (
        <line key={`${a}-${b}`} x1={map[a].x} y1={map[a].y} x2={map[b].x} y2={map[b].y} stroke="#bef264" strokeWidth="0.008" />
      ) : null)}
      {landmarks.map((item) => (
        <circle key={item.name} cx={item.x} cy={item.y} r="0.01" fill="#0f766e" />
      ))}
    </svg>
  );
}
