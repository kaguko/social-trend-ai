# 🔎 Social Trend AI

Hệ thống AI phân tích **xu hướng và cảnh báo sớm** từ mạng xã hội / báo chí tiếng Việt.
Pipeline hoàn chỉnh: **Thu thập dữ liệu → Phân tích cảm xúc (AI) → Trực quan hóa Dashboard**.

---

## 🏗️ Kiến trúc hệ thống

```
[1. Thu thập dữ liệu]  →  [2. Phân tích bằng AI]  →  [3. Hiển thị Dashboard]
   Crawler (VnExpress,      Sentiment Analysis          Streamlit + Plotly
   YouTube API)             + Topic Modeling
```

| Bước | Module | Công nghệ |
|---|---|---|
| Thu thập | `src/crawler/` | `requests`, `BeautifulSoup4`, YouTube Data API v3 |
| Tiền xử lý | `src/preprocessing/` | Python, `pandas` |
| Phân tích cảm xúc | `src/nlp/sentiment_analyzer.py` | `transformers` — model `cardiffnlp/twitter-xlm-roberta-base-sentiment` |
| Gom cụm chủ đề | `src/nlp/topic_detector.py` | `BERTopic` |
| Phát hiện xu hướng | `src/trend_detection/trend_analyzer.py` | Z-score, custom Python |
| Khuyến nghị | `src/decision/recommender.py` | Rule-based |
| Dashboard | `dashboard/app.py` | `Streamlit`, `Plotly` |

---

## ⚙️ Công nghệ sử dụng

- **Ngôn ngữ:** Python 3.10
- **Crawler:** `requests`, `BeautifulSoup4`, YouTube Data API v3
- **AI / NLP:** `transformers` (HuggingFace), `BERTopic`
- **Dashboard:** `Streamlit`, `Plotly`
- **Dữ liệu:** `pandas`
- **Cấu hình / bảo mật:** `python-dotenv` (`.env`)
- **Môi trường:** virtualenv (`.venv`) trên Windows
- **Quản lý mã nguồn:** Git + GitHub

---

## 🚀 Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/kaguko/social-trend-ai.git
cd social-trend-ai

# 2. Tạo & kích hoạt virtual env (Windows)
python -m venv .venv
.venv\Scripts\activate

# 3. Cài thư viện
pip install -r requirements.txt

# 4. Tạo file .env từ template và điền API key
copy .env.example .env
```

Trong file `.env`, điền YouTube API key (lấy miễn phí tại [Google Cloud Console](https://console.cloud.google.com)):

```
YOUTUBE_API_KEY=AIzaSy...key_của_bạn
```

---

## 📖 Chu trình sử dụng (từng bước)

### Bước 1 — Thu thập dữ liệu

**Crawl VnExpress** (không cần API key):
```bash
python src/crawler/news_crawler.py --keyword "AI" --pages 2
```

**Crawl YouTube comments** (cần API key trong `.env`):
```bash
python src/crawler/youtube_crawler.py --search "AI Việt Nam" --max_videos 2 --max_comments 50
```

→ Dữ liệu lưu vào `data/processed/youtube_comments.csv`.

### Bước 2 — Phân tích cảm xúc

```bash
# Test nhanh một câu
python src/nlp/sentiment_analyzer.py --text "Video này hay quá!"

# Phân tích toàn bộ file CSV
python src/nlp/sentiment_analyzer.py --input data/processed/youtube_comments.csv
```

→ Kết quả lưu vào `data/processed/youtube_comments_sentiment.csv` với 2 cột mới: `sentiment` và `confidence`.

### Bước 3 — Xem Dashboard

```bash
python -m streamlit run dashboard/app.py
```

→ Mở trình duyệt tại `http://localhost:8501`. Dashboard hiển thị:
- KPI: tổng số comment, tỷ lệ tiêu cực, chủ đề nổi bật
- Biểu đồ tròn & cột phân bố cảm xúc
- Top 10 từ khóa nổi bật
- Xu hướng thảo luận theo thời gian
- Cảnh báo tự động + bảng bình luận tiêu cực nổi bật

---

## 🔄 Luồng dữ liệu tổng thể

```
youtube_comments.csv
        ↓ sentiment_analyzer.py
youtube_comments_sentiment.csv
        ↓ topic_detector.py (tùy chọn)
youtube_comments_topics.csv
        ↓ streamlit dashboard
📊 Biểu đồ cảm xúc + xu hướng + cảnh báo
```

---

## 🔐 Bảo mật

- **KHÔNG BAO GIỜ** hardcode API key trong file `.py` — luôn dùng `.env`.
- `.gitignore` đã chặn `.env`, `data/raw/`, `data/processed/`, model weights nặng và `.venv/`.
- File `.env.example` được push để hướng dẫn người khác biết cần key gì.

---

## 📂 Cấu trúc thư mục

```
social-trend-ai/
├── dashboard/
│   └── app.py                  # Streamlit dashboard
├── data/
│   ├── raw/                    # Dữ liệu thô (bị .gitignore)
│   └── processed/              # Dữ liệu đã xử lý (bị .gitignore)
├── models/                     # Model weights (bị .gitignore)
├── notebooks/
│   ├── 01_eda.ipynb
│   ├── 02_sentiment.ipynb
│   └── 03_trend_detection.ipynb
├── src/
│   ├── crawler/                # Thu thập dữ liệu
│   ├── preprocessing/          # Tiền xử lý văn bản
│   ├── nlp/                    # Sentiment + Topic modeling
│   ├── trend_detection/        # Phát hiện xu hướng
│   └── decision/               # Khuyến nghị
├── tests/
├── .env.example
├── .gitignore
├── requirements.txt
└── README.md
```

---

## 📝 Ghi chú

- Lần đầu chạy `sentiment_analyzer.py` sẽ tải model (~1.1GB). Có thể tải trước rồi trỏ vào folder local nếu mạng không ổn định.
- Trên Windows nếu gặp lỗi symlink của HuggingFace: bật **Developer Mode** hoặc chạy PowerShell **as Administrator**.
- Dự án phục vụ mục đích học tập / luận văn.
