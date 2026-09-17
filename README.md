# Social Trend AI

Hệ thống phân tích xu hướng mạng xã hội thời gian thực kết hợp AI đa mô hình và học máy (Machine Learning) để dự báo độ lan truyền, chấm điểm cảm xúc (Sentiment Benchmark) và tự động tạo ý tưởng nội dung viral đa nền tảng (Reddit, YouTube, TikTok, X).

---

## 🌟 Tính Năng Chính

### 1. 🗄️ Lưu Trữ Dữ Liệu Bền Vững Với Cloud SQL (PostgreSQL) & Drizzle ORM
- Thay thế hoàn toàn lưu trữ CSV/in-memory bằng cơ sở dữ liệu quan hệ **PostgreSQL** trên Google Cloud SQL.
- Quản lý lược đồ kiểu an toàn (Type-safe) với **Drizzle ORM**:
  - `users`: Quản trị thông tin định danh và xác thực qua Firebase Auth.
  - `trends`: Lưu vết các xu hướng thị trường, điểm số, lịch sử tăng trưởng, và chỉ số nhân khẩu học.
  - `sentiment_evaluations`: Bảng lưu kết quả so chuẩn đối chiếu giữa các mô hình phân tích cảm xúc.
  - `saved_ideas`: Kho lưu trữ kịch bản và ý tưởng sáng tạo do AI đề xuất.

### 2. 🧪 Đánh Giá Đối Chuẩn Cảm Xúc Đa Mô Hình (Multi-Model Sentiment Benchmark)
So sánh song song 4 kiến trúc NLP & AI khác nhau trên cùng một ngữ cảnh xu hướng:
1. **VADER Lexicon (Rule-Based)**: Độ trễ siêu thấp (~1.2ms), quét từ vựng và dấu câu phân cực.
2. **CardiffNLP RoBERTa (Twitter-Tuned)**: Mô hình Transformer chuyên biệt cho tiếng lóng, hashtag và biểu tượng cảm xúc (emoji) mạng xã hội.
3. **DistilBERT-SST2**: Transformer thu gọn (Distilled) cân bằng tối ưu giữa độ chính xác và tốc độ suy luận.
4. **Google Gemini 3.8 Flash (LLM Context Reasoning)**: Suy luận ngữ cảnh sâu sắc, phát hiện châm biếm, ý tứ ẩn sau câu chữ và phản ứng tâm lý khán giả.
- Hiển thị tỷ lệ đồng thuận (Consensus Agreement %), độ trễ (Latency ms), và phân tích chi tiết từng mô hình.

### 3. 📈 Dự Báo Xu Hướng Bằng Học Máy (ML Trend Trajectory Forecasting)
- Vượt qua các Z-score tĩnh truyền thống:
  - **Hồi quy động lực thời gian (Polynomial Momentum Regression)**: Tính toán vector vận tốc $dV/dt$.
  - **Dải biến động trung bình động hàm mũ (EMA Volatility Bounds)**: Khoảng tin cậy 95% ($\pm 1.96\sigma$).
  - **Bộ phân loại Sigmoid Logistic**: Dự đoán xác suất đạt ngưỡng bùng nổ (Viral Probability %) và số ngày ước tính đạt đỉnh (Peak Days).
- Biểu đồ thời gian 7 ngày quan sát quá khứ kèm 3 ngày dự phóng tương lai.

### 4. 💡 AI Viral Content Ideator (Google Gemini)
- Tự động phân tích xu hướng đã chọn và tạo góc nhìn khai thác kịch bản độc đáo:
  - **Hook mở đầu** giữ chân khán giả trong 3 giây đầu tiên.
  - **Dàn ý chi tiết (Outline)** theo từng mốc thời gian hoặc cấu trúc video ngắn/bài viết.
  - **Call to Action (CTA)** tăng tỷ lệ tương tác & chuyển đổi.
  - **Hashtag chiến lược** và thời điểm đăng bài tối ưu theo nhân khẩu học.

### 5. 🔐 Xác Thực & Quản Lý Người Dùng (Firebase Auth & Google Sign-In)
- Đăng nhập bảo mật một chạm với tài khoản Google.
- Đồng bộ thông tin người dùng an toàn vào PostgreSQL.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: React 18, Tailwind CSS, Lucide Icons, Motion (Framer Motion).
- **Backend API**: Express / Node.js với TypeScript (`server.ts`).
- **Database**: Cloud SQL (PostgreSQL), Drizzle ORM, `pg` connection pool.
- **AI & ML**: `@google/genai` (Gemini 3.8 Flash), CardiffNLP RoBERTa pipeline, VADER heuristic, DistilBERT.
- **Authentication**: Firebase Client SDK & Firebase Admin SDK.

---

## 🚀 Cấu Trúc Thư Mục

```text
├── src/
│   ├── components/            # UI Components & Modals (MLForecastModal, SentimentBenchmarkModal, v.v.)
│   ├── data/                  # Mock/Seed trends khởi tạo
│   ├── db/                    # Drizzle ORM config, schema và kết nối PostgreSQL
│   │   ├── drizzle.config.ts  # Cấu hình migrations Drizzle Kit
│   │   ├── index.ts           # Connection pool PostgreSQL
│   │   ├── schema.ts          # Định nghĩa bảng users, trends, sentiment, saved_ideas
│   │   ├── trends.ts          # Data access layer cho xu hướng và ý tưởng
│   │   └── users.ts           # Quản lý người dùng
│   ├── lib/                   # Thư viện thuật toán
│   │   ├── mlForecaster.ts    # Thuật toán hồi quy và phân loại logistic dự báo xu hướng
│   │   ├── sentimentBenchmark.ts # Động cơ so chuẩn 4 mô hình cảm xúc
│   │   ├── firebase.ts        # Cấu hình Firebase client
│   │   └── firebase-admin.ts  # Cấu hình Firebase Admin backend
│   ├── types.ts               # Định nghĩa TypeScript toàn cục
│   └── App.tsx                # Giao diện chính của ứng dụng
├── server.ts                  # Backend API server & Vite middleware
└── package.json               # Cấu hình dependencies và build scripts
```

---

## ⚙️ Cài Đặt & Chạy Cục Bộ

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env` dựa trên `.env.example`:
```env
GEMINI_API_KEY=your_gemini_api_key
SQL_HOST=127.0.0.1
SQL_DB_NAME=your_database_name
SQL_USER=your_db_user
SQL_PASSWORD=your_db_password
SQL_ADMIN_USER=ai_studio_admin
SQL_ADMIN_PASSWORD=your_admin_password
```

### 3. Khởi chạy môi trường phát triển
```bash
npm run dev
```
Ứng dụng sẽ chạy tại `http://localhost:3000`.

### 4. Build sản phẩm
```bash
npm run build
npm start
```
