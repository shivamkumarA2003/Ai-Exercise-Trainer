from __future__ import annotations

from dataclasses import dataclass, field

from backend.models.schemas import FeedbackMessage


@dataclass
class FeedbackCooldown:
    cooldown_seconds: float = 4
    last_spoken: dict[str, float] = field(default_factory=dict)

    def filter(self, session_id: str, messages: list[FeedbackMessage], timestamp: float) -> list[FeedbackMessage]:
        allowed: list[FeedbackMessage] = []
        for message in messages:
            key = f"{session_id}:{message.code}"
            if timestamp - self.last_spoken.get(key, -999) >= self.cooldown_seconds:
                self.last_spoken[key] = timestamp
                allowed.append(message)
        return allowed
