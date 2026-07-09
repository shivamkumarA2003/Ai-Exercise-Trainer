"use client";

import { useEffect, useRef } from "react";
import type { FeedbackMessage } from "@/types/workout";

export function useSpeechCoach(messages: FeedbackMessage[] = [], enabled: boolean, rate: number) {
  const spoken = useRef<string>("");

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const message = messages[0]?.message;
    if (!message || spoken.current === message) return;
    spoken.current = message;
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = rate;
    utterance.pitch = 0.95;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [enabled, messages, rate]);
}
