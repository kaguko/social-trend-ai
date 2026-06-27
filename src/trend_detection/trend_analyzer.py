"""
Phát hiện xu hướng và bất thường từ chuỗi thời gian thảo luận.
Dùng Z-score và biến đổi tỷ lệ để phát hiện spike bất thường.
"""

import numpy as np
import pandas as pd
from scipy import stats


class TrendAnalyzer:
    def __init__(self, window: int = 24, z_threshold: float = 2.0):
        """
        window: Số giờ cho cửa sổ trượt
        z_threshold: Ngưỡng Z-score để gắn cờ bất thường
        """
        self.window = window
        self.z_threshold = z_threshold

    def calculate_trend_score(self, series: pd.Series) -> pd.Series:
        """Tính tốc độ tăng trưởng theo cửa sổ trượt."""
        rolling_mean = series.rolling(window=self.window).mean()
        growth_rate = series.pct_change(periods=self.window)
        return growth_rate.fillna(0)

    def detect_anomalies(self, series: pd.Series) -> pd.Series:
        """Gắn cờ các điểm bất thường dựa trên Z-score."""
        z_scores = np.abs(stats.zscore(series.fillna(0)))
        return pd.Series(z_scores > self.z_threshold, index=series.index)

    def get_trending_topics(self, df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
        """
        Đầu vào: DataFrame có cột ['topic', 'timestamp', 'count']
        Đầu ra: Top N chủ đề đang tăng mạnh nhất
        """
        results = []
        for topic, group in df.groupby('topic'):
            group = group.sort_values('timestamp')
            growth = self.calculate_trend_score(group['count'])
            anomaly = self.detect_anomalies(group['count'])
            results.append({
                'topic': topic,
                'avg_growth': growth.mean(),
                'max_growth': growth.max(),
                'has_anomaly': anomaly.any(),
                'latest_count': group['count'].iloc[-1]
            })
        result_df = pd.DataFrame(results)
        return result_df.sort_values('avg_growth', ascending=False).head(top_n)
