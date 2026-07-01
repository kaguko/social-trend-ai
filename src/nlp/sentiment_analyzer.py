"""
Phân tích cảm xúc tiếng Việt.
Dùng mô hình pretrained ViSoBERT.

Cách dùng:
    # Chạy trực tiếp với file CSV
    python src/nlp/sentiment_analyzer.py --input data/processed/youtube_comments.csv --text_col text

    # Hoặc thử nhanh với câu bất kỳ
    python src/nlp/sentiment_analyzer.py --text "Video này hay quá!"
"""

import argparse
import pandas as pd
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification


class SentimentAnalyzer:
    MODEL_NAME = "5CD-AI/Vietnamese-Sentiment-visobert"

    def __init__(self):
        print(f"[⏳] Đang tải mô hình {self.MODEL_NAME} (lần đầu có thể mất vài phút)...")
        self.tokenizer = AutoTokenizer.from_pretrained(self.MODEL_NAME)
        self.model     = AutoModelForSequenceClassification.from_pretrained(self.MODEL_NAME)
        self.pipe      = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer,
            device=-1  # CPU; đổi sang 0 nếu có GPU
        )
        print("✅ Mô hình sẵn sàng!")

    def predict(self, text: str) -> dict:
        """Phân tích một câu, trả về nhãn và độ tự tin."""
        result = self.pipe(str(text)[:512], truncation=True)[0]
        return {
            "label": result["label"].lower(),
            "score": round(result["score"], 4)
        }

    def batch_predict(self, texts: list[str]) -> list[dict]:
        """Phân tích hàng loạt."""
        return [self.predict(t) for t in texts]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Phân tích cảm xúc tiếng Việt")
    parser.add_argument("--input",    type=str, help="Đường dẫn file CSV đầu vào")
    parser.add_argument("--text_col", type=str, default="text", help="Tên cột chứa văn bản")
    parser.add_argument("--output",   type=str, help="Lưu kết quả ra CSV (tuỳ chọn)")
    parser.add_argument("--text",     type=str, help="Thử phân tích một câu trực tiếp")
    args = parser.parse_args()

    analyzer = SentimentAnalyzer()

    # --- Chế độ 1: thử một câu nhanh ---
    if args.text:
        result = analyzer.predict(args.text)
        print(f"\nVăn bản : {args.text}")
        print(f"Cảm xúc : {result['label'].upper()}")
        print(f"Độ tin cậy: {result['score']*100:.1f}%")

    # --- Chế độ 2: phân tích toàn bộ file CSV ---
    elif args.input:
        df = pd.read_csv(args.input)
        if args.text_col not in df.columns:
            print(f"[!] Không tìm thấy cột '{args.text_col}'. Các cột hiện có: {list(df.columns)}")
            exit(1)

        print(f"\n[*] Phân tích {len(df)} dòng...")
        results = analyzer.batch_predict(df[args.text_col].fillna("").tolist())

        df["sentiment"] = [r["label"] for r in results]
        df["confidence"] = [r["score"] for r in results]

        # In tổng kết
        print("\n--- Kết quả tổng hợp ---")
        print(df["sentiment"].value_counts().to_string())
        print(f"\n--- Preview 5 dòng đầu ---")
        print(df[[args.text_col, "sentiment", "confidence"]].head().to_string(index=False))

        # Lưu nếu có --output
        if args.output:
            df.to_csv(args.output, index=False, encoding="utf-8-sig")
            print(f"\n💾 Đã lưu vào: {args.output}")
        else:
            # Tự động lưu bên cạnh file gốc
            out = args.input.replace(".csv", "_sentiment.csv")
            df.to_csv(out, index=False, encoding="utf-8-sig")
            print(f"\n💾 Đã lưu vào: {out}")
    else:
        print("Dùng --text '...' để thử nhanh, hoặc --input file.csv để phân tích toàn bộ.")
        print("Ví dụ:")
        print('  python src/nlp/sentiment_analyzer.py --text "Video này hay quá!"')
        print('  python src/nlp/sentiment_analyzer.py --input data/processed/youtube_comments.csv')
