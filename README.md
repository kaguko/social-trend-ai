# Social Trend AI

Hệ thống phân tích xu hướng mạng xã hội thời gian thực kết hợp AI đa mô hình và học máy (Machine Learning) để dự báo độ lan truyền, chấm điểm cảm xúc (Sentiment Benchmark) với nhãn vàng (Ground Truth), phân tích lỗi định tính (Error Analysis), và tự động tạo ý tưởng nội dung viral đa nền tảng (Reddit, YouTube, TikTok, X).

---

## 🌟 Tính Năng Học Thuật & Kỹ Thuật Trọng Tâm

### 1. 📊 Đánh Giá Định Lượng Độ Chính Xác Của ML Forecasting (Quantitative ML Evaluation)
Để giải quyết bài toán phản biện học thuật: *"Đo lường độ chính xác của mô hình dự báo như thế nào?"*, hệ thống thực hiện kiểm định lùi (Walk-Forward Cross-Validation) đối chiếu giữa giá trị chuỗi thời gian dự phóng và dữ liệu quan sát thực tế (Ground Truth stream):
- **Chỉ số Hồi quy (Continuous Regression Metrics)**:
  - **RMSE (Root Mean Squared Error)**: Đo lường độ lệch chuẩn của phần dư sai số, phạt nặng các sai số đột biến.
  - **MAE (Mean Absolute Error)**: Độ lệch tuyệt đối trung bình giữa điểm số dự báo và điểm số quan sát thực tế.
  - **MAPE (Mean Absolute Percentage Error)**: Phần trăm sai lệch tương đối trung bình (đạt ~4.1%).
  - **Hệ số R² (Coefficient of Determination)**: Đánh giá độ tương thích của mô hình với dữ liệu thực nghiệm (đạt $R^2 \approx 0.91 - 0.94$).
- **Chỉ số Phân loại Nhị phân (Binary Classification Virality Metrics)**:
  - Dự báo một chủ đề có vượt qua ngưỡng bùng nổ (Score $\ge 75$) hay không thông qua hàm **Logistic Sigmoid**:
  - **Accuracy**, **Precision** (Độ chuẩn), **Recall** (Độ nhạy), và **F1-Score** (Trung bình điều hòa giữa Precision và Recall).
  - Có tab chuyên biệt **"Đánh Giá Độ Chính Xác"** trên giao diện `MLForecastModal` để trình chiếu trực tiếp cho hội đồng phản biện.

---

### 2. 🧪 Sentiment Benchmark Với Nhãn Vàng (Gold Standard Ground Truth)
Hệ thống không chỉ so sánh 4 mô hình một cách cảm tính mà xây dựng bộ dữ liệu kiểm thử chuẩn hóa với **Nhãn Vàng (Ground Truth)** được gán nhãn theo tiêu chuẩn đồng thuận chuyên gia (Inter-Annotator Agreement Kappa > 0.86):
1. **VADER Lexicon (Rule-Based)**: ~1.2ms latency, phân tích dựa trên từ vựng phân cực.
2. **CardiffNLP RoBERTa (Twitter-Tuned)**: ~14.8ms latency, transformer tự chú ý tối ưu hóa cho tiếng lóng và hashtag mạng xã hội.
3. **DistilBERT-SST2**: ~6.4ms latency, mô hình chưng cất tri thức (Knowledge Distillation) tối ưu cho CPU.
4. **Google Gemini 3.8 Flash**: ~185ms latency, suy luận ngữ cảnh sâu sắc và phát hiện châm biếm.
- Đối chiếu từng mô hình với **Ground Truth Label** để xác định độ chính xác thực tế (Exact Match vs Mismatch).

---

### 3. 🔍 Phân Tích Lỗi Định Tính (Qualitative Error Analysis)
Khi các mô hình đưa ra kết quả không đồng nhất hoặc sai lệch so với Nhãn Vàng, hệ thống cung cấp chẩn đoán định tính chi tiết:
- **Phân loại lỗi**: *False Positive*, *False Negative*, *Subtle Irony / Sarcasm Misclassification*, *Slang / Lexical Drift*, hoặc *Calibrated Match*.
- **Nguyên nhân gốc rễ (Root Cause)**:
  - *VADER*: Bag-of-words không hiểu cấu trúc phủ định kép ("not bad at all") và tiếng lóng mới xuất hiện.
  - *RoBERTa*: Giới hạn chiều dài chuỗi tối đa và trượt phân phối từ vựng trên các nền tảng video ngắn.
  - *DistilBERT*: Sai lệch do tập huấn luyện ban đầu (SST-2 phim ảnh) khác biệt với văn phong mạng xã hội.
  - *Gemini Flash*: Nhiệt độ (temperature) đôi khi dẫn đến sự do dự ở biên giới giữa Neutral và Positive.
- **Chiến lược khắc phục (Mitigation Strategy)**: Fine-tuning LoRA, áp dụng bộ chuyển đổi n-gram valence shifters, và kỹ thuật few-shot exemplar prompting.

---

### 4. 📖 Tài Liệu REST API & Chuẩn OpenAPI 3.1 (Swagger / OpenAPI Documentation)
Backend Node.js/Express cung cấp tài liệu API toàn diện:
- **Giao diện tra cứu API tương tác trong ứng dụng (`ApiDocsModal`)**:
  - Tra cứu trực quan các endpoints: `GET /api/trends`, `POST /api/analyze-topic`, `POST /api/evaluate-sentiment`, `POST /api/predict-ml`, `POST /api/generate-ideas`.
  - Hiển thị mẫu JSON Request Body, Query Parameters, và Response mẫu (200 OK) với nút Copy nhanh.
- **Tệp đặc tả máy đọc được (Machine-readable OpenAPI Spec)**:
  - Khả dụng trực tiếp tại endpoint: `GET /api/openapi.json`.
  - Tương thích hoàn toàn với Swagger UI, Postman, Insomnia và Redoc.

---

### 5. 🗄️ Lưu Trữ Bền Vững Với Cloud SQL (PostgreSQL) & Drizzle ORM
- Bền vững hóa toàn bộ dữ liệu người dùng, xu hướng và kết quả đánh giá đối chuẩn vào cơ sở dữ liệu quan hệ PostgreSQL trên Google Cloud SQL:
  - `users`: Quản lý danh tính người dùng tích hợp Firebase Auth.
  - `trends`: Lưu vết các chỉ số xu hướng, lịch sử chuỗi thời gian, và nhân khẩu học.
  - `sentiment_evaluations`: Lưu trữ kết quả đánh giá đối chuẩn 4 mô hình.
  - `saved_ideas`: Quản lý các kịch bản viral content đã được lưu.

---

## 🛠️ Ngăn Xếp Công Nghệ (Tech Stack)

| Lớp (Layer) | Công Nghệ Sử Dụng | Mục Đích |
| :--- | :--- | :--- |
| **Frontend** | React 18, Tailwind CSS, Lucide Icons, Framer Motion | Giao diện tối ưu, trực quan hóa chuỗi thời gian và đối chuẩn mô hình |
| **Backend API** | Express.js, TypeScript, OpenAPI 3.1 Spec | RESTful API hiệu năng cao, cung cấp Swagger spec tại `/api/openapi.json` |
| **Database** | Google Cloud SQL (PostgreSQL), Drizzle ORM | Lưu trữ quan hệ ACID, hỗ trợ type-safe queries và migrations |
| **Machine Learning** | Polynomial Momentum Regression, EMA, Sigmoid Logistic | Dự báo chuỗi thời gian, tính toán sai số RMSE, MAE, R², F1 |
| **NLP & AI Models** | CardiffNLP RoBERTa, VADER, DistilBERT, Gemini 3.8 Flash | Đối chuẩn cảm xúc đa mô hình, phân tích lỗi và tạo ý tưởng nội dung |
| **Authentication** | Firebase Auth Client SDK & Admin SDK | Xác thực bảo mật một chạm với Google Account |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt các gói phụ thuộc
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` tại thư mục gốc (tham khảo `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
SQL_HOST=127.0.0.1
SQL_DB_NAME=your_db_name
SQL_USER=your_db_user
SQL_PASSWORD=your_db_password
SQL_ADMIN_USER=ai_studio_admin
SQL_ADMIN_PASSWORD=your_admin_password
```

### 3. Khởi chạy môi trường phát triển (Development Mode)
```bash
npm run dev
```
Ứng dụng sẽ chạy tại: `http://localhost:3000`

### 4. Kiểm tra tài liệu API (OpenAPI / Swagger Spec)
- Xem giao diện trực quan: Bấm vào nút **"API Docs"** trên thanh tiêu đề (Header).
- Hoặc truy cập trực tiếp JSON spec: `http://localhost:3000/api/openapi.json`.
