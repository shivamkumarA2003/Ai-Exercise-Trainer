from __future__ import annotations

from math import acos, degrees, sqrt

from backend.models.schemas import Landmark


def distance(a: Landmark, b: Landmark) -> float:
    return sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2 + (a.z - b.z) ** 2)


def angle(a: Landmark, b: Landmark, c: Landmark) -> float:
    ab = (a.x - b.x, a.y - b.y, a.z - b.z)
    cb = (c.x - b.x, c.y - b.y, c.z - b.z)
    dot = sum(x * y for x, y in zip(ab, cb))
    mag_ab = sqrt(sum(x * x for x in ab))
    mag_cb = sqrt(sum(x * x for x in cb))
    if mag_ab == 0 or mag_cb == 0:
        return 0
    cosine = max(-1, min(1, dot / (mag_ab * mag_cb)))
    return degrees(acos(cosine))


def landmark_map(landmarks: list[Landmark]) -> dict[str, Landmark]:
    return {item.name: item for item in landmarks}


def midpoint(name: str, a: Landmark, b: Landmark) -> Landmark:
    return Landmark(
        name=name,
        x=(a.x + b.x) / 2,
        y=(a.y + b.y) / 2,
        z=(a.z + b.z) / 2,
        visibility=min(a.visibility, b.visibility),
    )
