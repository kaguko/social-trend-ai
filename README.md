# 🔍 Social Trend AI

> Hệ thống AI hỗ trợ điều tra xu hướng và cảnh báo sớm từ dữ liệu mạng xã hội tiếng Việt

---

## 📌 Giới thiệu

Hệ thống phân tích dữ liệu mạng xã hội (Facebook, YouTube, báo điện tử...) để:
- Phát hiện **xu hướng nổi lên sớm**
- Phân tích **cảm xúc cộng đồng** theo thời gian
- Phát hiện **dấu hiệu khủng hoảng / tin đồn**
- Đưa ra **khuyến nghị hành động** cụ thể

---

## 🏗️ Kiến trúc hệ thống

```
social-trend-ai/
├── data/                  # Dữ liệu thô và đã xử lý
│   ├── raw/
│   └── processed/
├── src/
│   ├── crawler/           # Thu thập dữ liệu
│   ├── preprocessing/     # Tiền xử lý tiếng Việt
│   ├── nlp/               # Phân tích NLP (sentiment, topic)
│   ├── trend_detection/   # Phát hiện xu hướng & bất thường
│   └── decision/          # Mô-đun khuyến nghị quyết định
├── notebooks/             # Jupyter notebooks thí nghiệm
├── dashboard/             # Web dashboard hiển thị kết quả
├── models/                # Mô hình đã train/fine-tune
├── tests/                 # Unit tests
├── requirements.txt
└── README.md
```

---

## 🔬 Các tác vụ chính

| Tác vụ | Mô tả | Công nghệ dự kiến |
|--------|-------|-------------------|
| Thu thập dữ liệu | Crawl bài đăng, bình luận theo từ khóa | Selenium, Requests, API |
| Tiền xử lý | Chuẩn hoá tiếng Việt, tách từ | underthesea, pyvi |
| Phân tích cảm xúc | Phân loại Positive/Neutral/Negative | PhoBERT, ViSoBERT |
| Phát hiện chủ đề | Gom cụm chủ đề nổi bật | LDA, BERTopic |
| Phát hiện xu hướng | Đo tốc độ tăng thảo luận, bất thường | Time series, anomaly detection |
| Ra quyết định | Gắn nhãn mức độ ưu tiên, khuyến nghị | Rule-based + ML |

---

## 🗓️ Timeline (8 tuần)

| Tuần | Công việc |
|------|-----------|
| 1–2 | Thu thập & làm sạch dữ liệu |
| 3 | Tiền xử lý, phân tích cảm xúc |
| 4 | Phát hiện chủ đề (BERTopic/LDA) |
| 5 | Phát hiện xu hướng & bất thường |
| 6 | Mô-đun khuyến nghị quyết định |
| 7 | Dashboard & API |
| 8 | Viết báo cáo & bảo vệ |

---

## 📦 Cài đặt

```bash
git clone https://github.com/kaguko/social-trend-ai.git
cd social-trend-ai
pip install -r requirements.txt
```

---

## 📚 Dataset

- [UIT-VSFC](https://github.com/AIVIUVN/UIT-VSFC) — Phân tích cảm xúc tiếng Việt
- [VFND](https://github.com/VFND) — Phát hiện tin giả tiếng Việt
- [ViFN](https://github.com/huynhtuan0106/ViFN-Vietnamese_Fake_New_Datasets_Ver1) — Tin tức thật/giả tiếng Việt
- Vietnamese Social Media Sentiment (Hugging Face)

---

## 🙋 Tác giả

**Lê Quang Huy** — Sinh viên CNTT, TP.HCM  
GitHub: [@kaguko](https://github.com/kaguko)

---

## 📄 License

MIT License
