import os
import pandas as pd
import streamlit as st
import plotly.express as px
import plotly.graph_objects as go

# ==================================================================
#  SOCIAL TREND AI DASHBOARD
#  Hệ thống phân tích xu hướng & cảnh báo sớm mạng xã hội tiếng Việt
# ==================================================================

st.set_page_config(
    page_title="Social Trend AI",
    page_icon="🛰️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ------------------------------------------------------------------
#  BẢNG MÀU & CSS TÙY CHỈNH  (dark, hiện đại, gradient)
# ------------------------------------------------------------------
COLORS = {
    "positive": "#22c55e",
    "neutral": "#94a3b8",
    "negative": "#ef4444",
    "accent": "#6366f1",
    "accent2": "#22d3ee",
}

st.markdown(
    """
    <style>
    /* Nền tổng thể */
    .stApp {
        background: radial-gradient(1200px 600px at 15% -10%, #1e1b4b 0%, #0b1120 45%, #060912 100%);
        color: #e2e8f0;
    }
    /* Ẩn menu & footer mặc định của streamlit */
    #MainMenu, footer, header {visibility: hidden;}

    /* Header hero */
    .hero {
        padding: 26px 32px;
        border-radius: 20px;
        background: linear-gradient(120deg, rgba(99,102,241,0.25), rgba(34,211,238,0.12));
        border: 1px solid rgba(148,163,184,0.18);
        margin-bottom: 18px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.35);
    }
    .hero h1 {
        margin: 0; font-size: 30px; font-weight: 800; letter-spacing: -0.5px;
        background: linear-gradient(90deg,#a5b4fc,#67e8f9);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .hero p { margin: 6px 0 0; color:#94a3b8; font-size:14px; }

    /* KPI card */
    .kpi {
        border-radius: 18px; padding: 20px 22px;
        background: rgba(30,41,59,0.55);
        border: 1px solid rgba(148,163,184,0.14);
        backdrop-filter: blur(6px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.25);
        transition: transform .18s ease, border-color .18s ease;
        height: 100%;
    }
    .kpi:hover { transform: translateY(-4px); border-color: rgba(99,102,241,0.55); }
    .kpi .label { font-size: 13px; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; }
    .kpi .value { font-size: 34px; font-weight: 800; margin-top:6px; line-height:1.1; }
    .kpi .sub   { font-size: 12px; color:#64748b; margin-top:4px; }

    /* Panel bao quanh biểu đồ */
    .block-container { padding-top: 1.2rem; }
    section[data-testid="stSidebar"] {
        background: #0b1120; border-right: 1px solid rgba(148,163,184,0.12);
    }
    .stDataFrame { border-radius: 12px; overflow: hidden; }
    h2, h3, .stSubheader { color:#e2e8f0 !important; }
    </style>
    """,
    unsafe_allow_html=True,
)

# ------------------------------------------------------------------
#  NẠP DỮ LIỆU
# ------------------------------------------------------------------
DATA_CANDIDATES = [
    "data/processed/youtube_comments_sentiment.csv",
    "./data/processed/youtube_comments_sentiment.csv",
    "data/processed/youtube_comments.csv",
]


def find_data_file():
    for p in DATA_CANDIDATES:
        if os.path.exists(p):
            return p
    return None


@st.cache_data
def load_data(path):
    df = pd.read_csv(path)
    for col in ["published_at", "published_time", "crawled_at"]:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors="coerce")
    if "sentiment" in df.columns:
        df["sentiment"] = df["sentiment"].astype(str).str.lower().str.strip()
    return df


# ------------------------------------------------------------------
#  HÀM TIỆN ÍCH
# ------------------------------------------------------------------
def top_keywords(series, top_n=10):
    stopwords = {
        "là", "và", "có", "cho", "của", "một", "những", "được", "trong", "với", "này", "đó",
        "thì", "khi", "rồi", "đang", "như", "quá", "video", "comment", "youtube", "ai", "the",
        "that", "this", "vì", "các", "cái", "để", "mình", "bạn", "ko", "không", "rất", "chủ", "đề",
    }
    allowed = "ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ"
    words = []
    for text in series.fillna("").astype(str):
        for w in text.lower().split():
            w = "".join(ch for ch in w if ch.isalnum() or ch in allowed)
            if len(w) >= 3 and w not in stopwords:
                words.append(w)
    if not words:
        return pd.Series(dtype=int)
    return pd.Series(words).value_counts().head(top_n)


def kpi_card(label, value, sub="", color="#e2e8f0"):
    return f"""
    <div class="kpi">
        <div class="label">{label}</div>
        <div class="value" style="color:{color}">{value}</div>
        <div class="sub">{sub}</div>
    </div>
    """


PLOTLY_LAYOUT = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(color="#cbd5e1", family="Segoe UI, sans-serif"),
    margin=dict(l=10, r=10, t=40, b=10),
)

# ------------------------------------------------------------------
#  HEADER
# ------------------------------------------------------------------
st.markdown(
    """
    <div class="hero">
        <h1>🛰️ Social Trend AI — Bảng điều khiển phân tích</h1>
        <p>Phân tích cảm xúc, xu hướng và cảnh báo sớm thông tin mạng xã hội & báo chí tiếng Việt · dựa trên Transformer</p>
    </div>
    """,
    unsafe_allow_html=True,
)

path = find_data_file()
if not path:
    st.warning("Không tìm thấy file data/processed/youtube_comments_sentiment.csv. Hãy chạy sentiment_analyzer trước.")
    st.stop()

df = load_data(path)
if df.empty:
    st.warning("File dữ liệu đang rỗng.")
    st.stop()

text_source = next((c for c in ["text", "description", "title", "video_title"] if c in df.columns), None)
time_col = next((c for c in ["published_at", "published_time", "crawled_at"] if c in df.columns), None)

# ------------------------------------------------------------------
#  SIDEBAR — BỘ LỌC
# ------------------------------------------------------------------
with st.sidebar:
    st.markdown("### ⚙️ Bộ lọc")
    st.caption(f"Nguồn dữ liệu: `{os.path.basename(path)}`")

    if "sentiment" in df.columns:
        opts = sorted(df["sentiment"].dropna().unique().tolist())
        picked = st.multiselect("Cảm xúc", opts, default=opts)
        df = df[df["sentiment"].isin(picked)] if picked else df

    if text_source:
        kw = st.text_input("🔍 Tìm từ khóa trong nội dung", "")
        if kw:
            df = df[df[text_source].astype(str).str.contains(kw, case=False, na=False)]

    st.divider()
    st.metric("Số dòng sau lọc", f"{len(df):,}")

if df.empty:
    st.warning("Không có dữ liệu khớp bộ lọc.")
    st.stop()

sent_counts = df["sentiment"].value_counts() if "sentiment" in df.columns else pd.Series(dtype=int)
total = len(df)
neg_ratio = (sent_counts.get("negative", 0) / total * 100) if total else 0
pos_ratio = (sent_counts.get("positive", 0) / total * 100) if total else 0
avg_conf = df["confidence"].mean() * 100 if "confidence" in df.columns else None
kw_series = top_keywords(df[text_source]) if text_source else pd.Series(dtype=int)
headline = kw_series.index[0] if not kw_series.empty else "—"

# ------------------------------------------------------------------
#  HÀNG KPI
# ------------------------------------------------------------------
k1, k2, k3, k4 = st.columns(4)
k1.markdown(kpi_card("Tổng bình luận", f"{total:,}", "Sau khi áp bộ lọc", COLORS["accent2"]), unsafe_allow_html=True)
k2.markdown(kpi_card("Tỷ lệ tích cực", f"{pos_ratio:.1f}%", f"{sent_counts.get('positive',0):,} bình luận", COLORS["positive"]), unsafe_allow_html=True)
k3.markdown(kpi_card("Tỷ lệ tiêu cực", f"{neg_ratio:.1f}%", f"{sent_counts.get('negative',0):,} bình luận", COLORS["negative"]), unsafe_allow_html=True)
k4.markdown(
    kpi_card("Độ tin cậy TB", f"{avg_conf:.1f}%" if avg_conf is not None else "—", f"Chủ đề nổi bật: {headline}", COLORS["accent"]),
    unsafe_allow_html=True,
)

st.markdown("<br>", unsafe_allow_html=True)

# ------------------------------------------------------------------
#  HÀNG 1: DONUT + XU HƯỚNG THỜI GIAN
# ------------------------------------------------------------------
c_left, c_right = st.columns([1, 1.4])

with c_left:
    st.subheader("📊 Phân bố cảm xúc")
    if not sent_counts.empty:
        pie_df = sent_counts.reset_index()
        pie_df.columns = ["sentiment", "count"]
        fig = px.pie(
            pie_df, names="sentiment", values="count", hole=0.62,
            color="sentiment",
            color_discrete_map={k: COLORS[k] for k in ["positive", "neutral", "negative"]},
        )
        fig.update_traces(textinfo="percent", textfont_size=14,
                          marker=dict(line=dict(color="#0b1120", width=3)))
        fig.update_layout(**PLOTLY_LAYOUT, showlegend=True,
                          legend=dict(orientation="h", y=-0.1),
                          annotations=[dict(text=f"{total}<br>bình luận", x=0.5, y=0.5,
                                            font_size=18, showarrow=False, font_color="#e2e8f0")])
        st.plotly_chart(fig, use_container_width=True)
    else:
        st.info("Chưa có cột sentiment.")

with c_right:
    st.subheader("📈 Xu hướng thảo luận theo thời gian")
    if time_col:
        tmp = df.dropna(subset=[time_col]).copy()
        if not tmp.empty:
            tmp["date"] = tmp[time_col].dt.date
            if "sentiment" in tmp.columns:
                trend = tmp.groupby(["date", "sentiment"]).size().reset_index(name="count")
                fig2 = px.area(
                    trend, x="date", y="count", color="sentiment",
                    color_discrete_map={k: COLORS[k] for k in ["positive", "neutral", "negative"]},
                )
            else:
                trend = tmp.groupby("date").size().reset_index(name="count")
                fig2 = px.area(trend, x="date", y="count")
            fig2.update_layout(**PLOTLY_LAYOUT, legend=dict(orientation="h", y=-0.2),
                               xaxis=dict(gridcolor="rgba(148,163,184,0.1)"),
                               yaxis=dict(gridcolor="rgba(148,163,184,0.1)"))
            st.plotly_chart(fig2, use_container_width=True)
        else:
            st.info("Cột thời gian không parse được.")
    else:
        st.info("Chưa có cột thời gian để vẽ biểu đồ.")

# ------------------------------------------------------------------
#  HÀNG 2: TỪ KHÓA + GAUGE CẢNH BÁO
# ------------------------------------------------------------------
c1, c2 = st.columns([1.4, 1])

with c1:
    st.subheader("🏷️ Top từ khóa nổi bật")
    if not kw_series.empty:
        kdf = kw_series.reset_index()
        kdf.columns = ["keyword", "count"]
        fig_kw = px.bar(kdf.sort_values("count"), x="count", y="keyword", orientation="h",
                        text="count", color="count", color_continuous_scale=["#312e81", "#6366f1", "#22d3ee"])
        fig_kw.update_layout(**PLOTLY_LAYOUT, coloraxis_showscale=False,
                             xaxis=dict(gridcolor="rgba(148,163,184,0.1)"),
                             yaxis=dict(title=""))
        st.plotly_chart(fig_kw, use_container_width=True)
    else:
        st.info("Không trích được từ khóa.")

with c2:
    st.subheader("⚠️ Chỉ số cảnh báo")
    gauge = go.Figure(go.Indicator(
        mode="gauge+number",
        value=neg_ratio,
        number={"suffix": "%", "font": {"size": 34, "color": "#e2e8f0"}},
        gauge={
            "axis": {"range": [0, 100], "tickcolor": "#64748b"},
            "bar": {"color": COLORS["negative"]},
            "bgcolor": "rgba(0,0,0,0)",
            "steps": [
                {"range": [0, 25], "color": "rgba(34,197,94,0.25)"},
                {"range": [25, 40], "color": "rgba(234,179,8,0.30)"},
                {"range": [40, 100], "color": "rgba(239,68,68,0.30)"},
            ],
            "threshold": {"line": {"color": "#fca5a5", "width": 4}, "value": 40},
        },
    ))
    gauge.update_layout(**PLOTLY_LAYOUT, height=260)
    st.plotly_chart(gauge, use_container_width=True)

    if neg_ratio >= 40:
        st.error("🔴 Tỷ lệ tiêu cực cao — cần kiểm tra & phản ứng ngay.")
    elif neg_ratio >= 25:
        st.warning("🟡 Tiêu cực đang tăng — nên theo dõi thêm.")
    else:
        st.success("🟢 Tâm lý thảo luận ở mức an toàn.")

# ------------------------------------------------------------------
#  BÌNH LUẬN TIÊU CỰC NỔI BẬT
# ------------------------------------------------------------------
if "sentiment" in df.columns and text_source and "confidence" in df.columns:
    st.subheader("🔴 Bình luận tiêu cực nổi bật")
    neg = df[df["sentiment"] == "negative"].sort_values("confidence", ascending=False)
    if not neg.empty:
        st.dataframe(
            neg[[text_source, "confidence"]].head(10).rename(
                columns={text_source: "Nội dung", "confidence": "Độ tin cậy"}),
            use_container_width=True, hide_index=True,
        )
    else:
        st.info("Không có bình luận tiêu cực trong bộ lọc hiện tại.")

# ------------------------------------------------------------------
#  DỮ LIỆU CHI TIẾT
# ------------------------------------------------------------------
with st.expander("🧾 Xem toàn bộ dữ liệu chi tiết"):
    st.dataframe(df, use_container_width=True, hide_index=True)

st.caption("Social Trend AI · Luận văn tốt nghiệp · Pipeline: Crawler → NLP (Transformer) → Trend Detection → Dashboard")
