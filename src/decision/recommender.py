"""
Mô-đun ra quyết định / khuyến nghị hành động.
Dựa trên kết hợp: sentiment, trend score, anomaly flag.

Các mức ưu tiên:
  HIGH   — Cần theo dõi ngay
  MEDIUM — Theo dõi trong 24 giờ
  LOW    — Bình thường, không cần hành động
"""


PRIORITY_HIGH = "HIGH"
PRIORITY_MEDIUM = "MEDIUM"
PRIORITY_LOW = "LOW"


class Recommender:
    def evaluate(self, topic: str, sentiment_neg_ratio: float,
                 growth_rate: float, has_anomaly: bool) -> dict:
        """
        topic: tên chủ đề
        sentiment_neg_ratio: tỷ lệ bài có cảm xúc tiêu cực (0-1)
        growth_rate: tốc độ tăng trưởng thảo luận
        has_anomaly: có bất thường về số lượng bài viết không
        """
        priority = self._compute_priority(sentiment_neg_ratio, growth_rate, has_anomaly)
        recommendation = self._generate_recommendation(priority, sentiment_neg_ratio, growth_rate)
        return {
            "topic": topic,
            "priority": priority,
            "sentiment_neg_ratio": round(sentiment_neg_ratio, 3),
            "growth_rate": round(growth_rate, 3),
            "has_anomaly": has_anomaly,
            "recommendation": recommendation
        }

    def _compute_priority(self, neg_ratio: float, growth: float, anomaly: bool) -> str:
        if anomaly and neg_ratio > 0.5:
            return PRIORITY_HIGH
        if neg_ratio > 0.4 or growth > 2.0 or anomaly:
            return PRIORITY_MEDIUM
        return PRIORITY_LOW

    def _generate_recommendation(self, priority: str, neg_ratio: float, growth: float) -> str:
        if priority == PRIORITY_HIGH:
            return (f"⚠️ Chủ đề có dấu hiệu khủng hoảng: cảm xúc tiêu cực cao ({neg_ratio:.0%}) "
                    f"và bất thường đột biến. Nên kiểm tra và phản hồi ngay.")
        if priority == PRIORITY_MEDIUM:
            if growth > 2.0:
                return f"📈 Xu hướng tăng mạnh ({growth:.1f}x). Theo dõi thêm trong 24 giờ."
            return f"🔎 Cảm xúc tiêu cực ({neg_ratio:.0%}) đáng chú ý. Theo dõi thêm."
        return "✅ Bình thường. Không cần hành động ngay."
