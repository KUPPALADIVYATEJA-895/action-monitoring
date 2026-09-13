"""
Face Quality Analyzer Module
Evaluates face image resolution, blur, occlusion, and lighting clarity.
"""

from typing import Dict, Any

class FaceQualityAnalyzer:
    def __init__(
        self,
        min_width: int = 60,
        min_height: int = 60,
        min_confidence: float = 0.70
    ):
        self.min_width = min_width
        self.min_height = min_height
        self.min_confidence = min_confidence

    def evaluate(self, face_bbox: Dict[str, float], confidence: float, blur_metric: float = 1.0) -> Dict[str, Any]:
        """
        Evaluates face quality.
        Returns:
        {
            "usable": bool,
            "quality_score": float,
            "reason": str
        }
        """
        w = face_bbox.get("width", 0)
        h = face_bbox.get("height", 0)

        if w < self.min_width or h < self.min_height:
            return {
                "usable": False,
                "quality_score": round(max(0.1, (w / self.min_width) * 0.4), 2),
                "reason": f"Face too small ({int(w)}x{int(h)} < {self.min_width}x{self.min_height})"
            }

        if confidence < self.min_confidence:
            return {
                "usable": False,
                "quality_score": round(confidence * 0.7, 2),
                "reason": f"Face detection confidence below threshold ({int(confidence * 100)}% < {int(self.min_confidence * 100)}%)"
            }

        if blur_metric < 0.3:
            return {
                "usable": False,
                "quality_score": 0.35,
                "reason": "Face image motion blur or out-of-focus"
            }

        score = min(0.99, 0.5 * confidence + 0.3 * min(1.0, w / 120.0) + 0.2 * blur_metric)
        return {
            "usable": True,
            "quality_score": round(score, 2),
            "reason": "good"
        }
