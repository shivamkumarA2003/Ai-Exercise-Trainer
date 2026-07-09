from __future__ import annotations

import base64
import logging
from functools import lru_cache

import cv2
import numpy as np

from backend.models.schemas import Landmark
from backend.utils.config import get_settings

logger = logging.getLogger(__name__)

LANDMARK_NAMES = [
    "nose", "left_eye_inner", "left_eye", "left_eye_outer", "right_eye_inner",
    "right_eye", "right_eye_outer", "left_ear", "right_ear", "mouth_left",
    "mouth_right", "left_shoulder", "right_shoulder", "left_elbow", "right_elbow",
    "left_wrist", "right_wrist", "left_pinky", "right_pinky", "left_index",
    "right_index", "left_thumb", "right_thumb", "left_hip", "right_hip",
    "left_knee", "right_knee", "left_ankle", "right_ankle", "left_heel",
    "right_heel", "left_foot_index", "right_foot_index",
]


@lru_cache
def _pose_model():
    try:
        import mediapipe as mp

        settings = get_settings()
        return mp.solutions.pose.Pose(
            static_image_mode=False,
            model_complexity=settings.media_pipe_model_complexity,
            enable_segmentation=False,
            min_detection_confidence=0.5,
            min_tracking_confidence=0.5,
        )
    except Exception as exc:
        logger.warning("MediaPipe unavailable; accepting client landmarks only: %s", exc)
        return None


def decode_frame(frame_base64: str) -> np.ndarray:
    payload = frame_base64.split(",", 1)[-1]
    data = np.frombuffer(base64.b64decode(payload), dtype=np.uint8)
    frame = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if frame is None:
        raise ValueError("Could not decode frame")
    return frame


def detect_landmarks(frame_base64: str | None) -> list[Landmark]:
    if not frame_base64:
        return []
    model = _pose_model()
    if model is None:
        return []
    frame = decode_frame(frame_base64)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = model.process(rgb)
    if not result.pose_landmarks:
        return []
    return [
        Landmark(
            name=LANDMARK_NAMES[index],
            x=item.x,
            y=item.y,
            z=item.z,
            visibility=item.visibility,
        )
        for index, item in enumerate(result.pose_landmarks.landmark)
    ]
