"""
Phân tích cảm xúc tiếng Việt.
Dùng mô hình cardiffnlp/twitter-xlm-roberta-base-sentiment
- Ổn định trên mọi phiên bản transformers
- Hỗ trợ 100+ ngôn ngữ bao gồm tiếng Việt
- Nhãn: Negative / Neutral / Positive

Cách dùng:
    python src/nlp/sentiment_analyzer.py --text "Video này hay quá!"
    python src/nlp/sentiment_analyzer.py --input data/processed/youtube_comments.csv
"""

import argparse
import pandas as pd
from transformers import pipeline


class SentimentAnalyzer:
    MODEL_NAME = "cardiffnlp/twitter-xlm-roberta-base-sentiment"

    def __init__(self):
        print(f"[⏳] Đang tải mô hình {self.MODEL_NAME}...")
        self.pipe = pipeline(
            "text-classification",
            model=self.MODEL_NAME,
            tokenizer=self.MODEL_NAME,
            device=-1  # CPU
        )
        print("✅ Mô hình sẵn sàng!")

    def predict(self, text: str) -> dict:
        result = self.pipe(str(text)[:512], truncation=True)[0]
        label_map = {"negative": "negative", "neutral": "neutral", "positive": "positive",
                     "LABEL_0": "negative", "LABEL_1": "neutral", "LABEL_2": "positive"}
        label = label_map.get(result["label"].lower(), result["label"].lower())
        return {"label": label, "score": round(result["score"], 4)}

    def batch_predict(self, texts: list) -> list:
        return [self.predict(t) for t in texts]


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input",    type=str, help="File CSV đầu vào")
    parser.add_argument("--text_col", type=str, default="text")
    parser.add_argument("--output",   type=str)
    parser.add_argument("--text",     type=str, help="Thử một câu nhanh")
    args = parser.parse_args()

    analyzer = SentimentAnalyzer()

    if args.text:
        result = analyzer.predict(args.text)
        print(f"\nVăn bản   : {args.text}")
        print(f"Cảm xúc   : {result['label'].upper()}")
        print(f"Độ tin cậy: {result['score']*100:.1f}%")

    elif args.input:
        df = pd.read_csv(args.input)
        if args.text_col not in df.columns:
            print(f"[!] Không tìm thấy cột '{args.text_col}'")
            print(f"Các cột hiện có: {list(df.columns)}")
            exit(1)

        print(f"\n[*] Phân tích {len(df)} dòng...")
        results = analyzer.batch_predict(df[args.text_col].fillna("").tolist())
        df["sentiment"]  = [r["label"] for r in results]
        df["confidence"] = [r["score"] for r in results]

        print("\n--- Tổng kết ---")
        print(df["sentiment"].value_counts().to_string())
        print(f"\n--- Preview 5 dòng đầu ---")
        print(df[[args.text_col, "sentiment", "confidence"]].head().to_string(index=False))

        out = args.output or args.input.replace(".csv", "_sentiment.csv")
        df.to_csv(out, index=False, encoding="utf-8-sig")
        print(f"\n💾 Đã lưu vào: {out}")
    else:
        print("Ví dụ:")
        print('  python src/nlp/sentiment_analyzer.py --text "Video này hay quá!"')
        print('  python src/nlp/sentiment_analyzer.py --input data/processed/youtube_comments.csv')
