"""
Phân tích cảm xúc tiếng Việt.
Dùng mô hình pretrained ViSoBERT hoặc PhoBERT fine-tuned.
Output: {label: positive/neutral/negative, score: float}
"""

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification


class SentimentAnalyzer:
    MODEL_NAME = "5CD-AI/Vietnamese-Sentiment-visobert"

    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        self.model = AutoModelForSequenceClassification.from_pretrained(self.MODEL_NAME)
        self.pipe = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer,
            device=-1  # CPU; đổi sang 0 nếu có GPU
        )

    def predict(self, text: str) -> dict:
        """Trả về nhãn và độ tự tin."""
        result = self.pipe(text[:512], truncation=True)[0]
        return {
            "label": result["label"].lower(),
            "score": round(result["score"], 4)
        }

    def batch_predict(self, texts: list[str]) -> list[dict]:
        """Phân tích hàng loạt."""
        return [self.predict(t) for t in texts]
