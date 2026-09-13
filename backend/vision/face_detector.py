"""
Dedicated Face Detector Module
Extracts face bounding boxes, dimensions, center points, and detection confidence.
"""

from typing import Dict, Any, List, Optional, Tuple

class FaceDetector:
    def __init__(self, min_confidence: float = 0.70):
        self.min_confidence = min_confidence

    def detect(self, image_data: Any, head_landmarks: Optional[List[Dict[str, float]]] = None) -> Dict[str, Any]:
        """
        Detects face from image or head landmarks.
        Returns:
            - Face bounding box: {"x": int, "y": int, "width": int, "height": int}
            - Face width / height
            - Face center: {"x": float, "y": float}
            - Detection confidence: float
        """
        if head_landmarks and len(head_landmarks) >= 2:
            xs = [p["x"] for p in head_landmarks if p.get("score", 0) > 0.25]
            ys = [p["y"] for p in head_landmarks if p.get("score", 0) > 0.25]
            if xs and ys:
                min_x, max_x = min(xs), max(xs)
                min_y, max_y = min(ys), max(ys)
                span_x = max(50.0, max_x - min_x)
                span_y = max(55.0, max_y - min_y)
                pad_x = span_x * 0.5
                pad_y = span_y * 0.6
                x = max(0.0, min_x - pad_x)
                y = max(0.0, min_y - pad_y)
                w = span_x + pad_x * 2
                h = span_y + pad_y * 2
                return {
                    "detected": True,
                    "bbox": {"x": round(x, 1), "y": round(y, 1), "width": round(w, 1), "height": round(h, 1)},
                    "width": round(w, 1),
                    "height": round(h, 1),
                    "center": {"x": round(x + w / 2, 1), "y": round(y + h / 2, 1)},
                    "confidence": round(sum(p.get("score", 0) for p in head_landmarks) / len(head_landmarks), 2)
                }

        return {
            "detected": False,
            "bbox": {"x": 0, "y": 0, "width": 0, "height": 0},
            "width": 0,
            "height": 0,
            "center": {"x": 0, "y": 0},
            "confidence": 0.0
        }
