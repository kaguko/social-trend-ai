import os
import pandas as pd
import streamlit as st
import plotly.express as px

st.set_page_config(page_title='Social Trend AI Dashboard', page_icon='🔎', layout='wide')

DATA_CANDIDATES = [
    'data/processed/youtube_comments_sentiment.csv',
    './data/processed/youtube_comments_sentiment.csv',
    'data/processed/youtube_comments.csv',
]


def find_data_file():
    for p in DATA_CANDIDATES:
        if os.path.exists(p):
            return p
    return None


@st.cache_data
def load_data(path):
    df = pd.read_csv(path)
    for col in ['published_at', 'published_time', 'crawled_at']:
        if col in df.columns:
            df[col] = pd.to_datetime(df[col], errors='coerce')
    if 'sentiment' in df.columns:
        df['sentiment'] = df['sentiment'].astype(str).str.lower().str.strip()
    return df


st.title('🔎 Social Trend AI Dashboard')
st.caption('Hệ thống AI phân tích xu hướng và cảnh báo sớm từ mạng xã hội tiếng Việt')

path = find_data_file()
if not path:
    st.warning('Không tìm thấy file data/processed/youtube_comments_sentiment.csv. Hãy chạy sentiment_analyzer trước.')
    st.stop()

df = load_data(path)
if df.empty:
    st.warning('File dữ liệu đang rỗng.')
    st.stop()

sent_counts = df['sentiment'].value_counts() if 'sentiment' in df.columns else pd.Series(dtype=int)
negative_ratio = (sent_counts.get('negative', 0) / len(df) * 100) if len(df) else 0

text_source = None
for c in ['text', 'description', 'title']:
    if c in df.columns:
        text_source = c
        break


def top_keywords(series, top_n=5):
    stopwords = {
        'là', 'và', 'có', 'cho', 'của', 'một', 'những', 'được', 'trong', 'với', 'này', 'đó', 'thì', 'khi', 'rồi',
        'đang', 'như', 'quá', 'video', 'comment', 'youtube', 'ai', 'the', 'that', 'this', 'vì', 'các', 'cái', 'để',
        'mình', 'bạn', 'ko', 'không', 'rất',
    }
    words = []
    allowed = 'ăâđêôơưáàảãạấầẩẫậắằẳẵặéèẻẽẹếềểễệíìỉĩịóòỏõọốồổỗộớờởỡợúùủũụứừửữựýỳỷỹỵ'
    for text in series.fillna('').astype(str):
        for w in text.lower().split():
            w = ''.join(ch for ch in w if ch.isalnum() or ch in allowed)
            if len(w) >= 3 and w not in stopwords:
                words.append(w)
    if not words:
        return []
    return pd.Series(words).value_counts().head(top_n).index.tolist()


headline_topic = ', '.join(top_keywords(df[text_source], 3)) if text_source else 'Chưa xác định'

c1, c2, c3 = st.columns(3)
c1.metric('📊 Tổng bài viết', f'{len(df):,}')
c2.metric('😵 Tỷ lệ tiêu cực', f'{negative_ratio:.1f}%')
c3.metric('📈 Chủ đề nổi bật', headline_topic if headline_topic else 'Chưa xác định')

st.divider()

left, right = st.columns([1.2, 1])

with left:
    st.subheader('📉 Phân bố cảm xúc')
    if 'sentiment' in df.columns and not sent_counts.empty:
        pie_df = sent_counts.reset_index()
        pie_df.columns = ['sentiment', 'count']
        fig = px.pie(
            pie_df,
            names='sentiment',
            values='count',
            color='sentiment',
            color_discrete_map={
                'positive': '#2ca02c',
                'neutral': '#7f7f7f',
                'negative': '#d62728',
            },
        )
        st.plotly_chart(fig, use_container_width=True)

        bar_df = pie_df.copy()
        fig_bar = px.bar(
            bar_df,
            x='sentiment',
            y='count',
            color='sentiment',
            color_discrete_map={
                'positive': '#2ca02c',
                'neutral': '#7f7f7f',
                'negative': '#d62728',
            },
            text='count',
        )
        st.plotly_chart(fig_bar, use_container_width=True)
    else:
        st.info('Chưa có cột sentiment trong file dữ liệu.')

with right:
    st.subheader('🏷️ Từ khóa nổi bật')
    if text_source:
        kws = top_keywords(df[text_source], 10)
        if kws:
            for i, kw in enumerate(kws, 1):
                st.write(f'{i}. {kw}')
        else:
            st.info('Không trích được từ khóa.')
    else:
        st.info('Không tìm thấy cột text/title/description.')

st.subheader('📈 Xu hướng thảo luận theo thời gian')
time_col = None
for c in ['published_at', 'published_time', 'crawled_at']:
    if c in df.columns:
        time_col = c
        break

if time_col:
    tmp = df.copy()
    tmp[time_col] = pd.to_datetime(tmp[time_col], errors='coerce')
    tmp = tmp.dropna(subset=[time_col])
    if not tmp.empty:
        tmp['date'] = tmp[time_col].dt.date
        trend = tmp.groupby('date').size().reset_index(name='count')
        fig2 = px.line(trend, x='date', y='count', markers=True)
        st.plotly_chart(fig2, use_container_width=True)
    else:
        st.info('Có cột thời gian nhưng dữ liệu không parse được.')
else:
    st.info('Chưa có cột thời gian để vẽ biểu đồ.')

st.subheader('⚠️ Cảnh báo ưu tiên cao')
if negative_ratio >= 40:
    st.error('Tỷ lệ cảm xúc tiêu cực đang cao. Cần kiểm tra nội dung và phản ứng người dùng.')
elif negative_ratio >= 25:
    st.warning('Có dấu hiệu tiêu cực tăng. Nên theo dõi thêm các bình luận nổi bật.')
else:
    st.success('Chưa có cảnh báo lớn. Tâm lý thảo luận đang ở mức chấp nhận được.')

if 'sentiment' in df.columns and text_source and 'confidence' in df.columns:
    st.subheader('🔴 Bình luận tiêu cực nổi bật')
    neg = df[df['sentiment'] == 'negative'].sort_values('confidence', ascending=False)
    if not neg.empty:
        st.dataframe(neg[[text_source, 'confidence']].head(10), use_container_width=True)
    else:
        st.info('Không có bình luận tiêu cực.')

st.subheader('🧾 Dữ liệu chi tiết')
st.dataframe(df.head(20), use_container_width=True)
