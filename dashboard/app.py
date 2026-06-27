"""
Streamlit Dashboard — Social Trend AI
Chạy: streamlit run dashboard/app.py
"""

import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(
    page_title="Social Trend AI",
    page_icon="🔍",
    layout="wide"
)

st.title("🔍 Social Trend AI Dashboard")
st.caption("Hệ thống AI phân tích xu hướng và cảnh báo sớm từ mạng xã hội tiếng Việt")

st.sidebar.header("⚙️ Cài đặt")
keyword = st.sidebar.text_input("Từ khoá theo dõi", value="AI, công nghệ")
time_range = st.sidebar.selectbox("Khoảng thời gian", ["24 giờ", "7 ngày", "30 ngày"])

col1, col2, col3 = st.columns(3)
col1.metric("📊 Tổng bài viết", "–", help="Số bài thu thập được")
col2.metric("😤 Tỷ lệ tiêu cực", "–", help="% bài có cảm xúc tiêu cực")
col3.metric("📈 Chủ đề nổi bật", "–", help="Số chủ đề đang tăng mạnh")

st.divider()
st.subheader("📈 Xu hướng thảo luận theo thời gian")
st.info("Chạy pipeline thu thập dữ liệu để hiển thị biểu đồ.")

st.subheader("⚠️ Cảnh báo ưu tiên cao")
st.warning("Chưa có cảnh báo nào. Hệ thống đang theo dõi...")
