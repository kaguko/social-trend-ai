"""
Phát hiện xu hướng và bất thường từ chuỗi thời gian thảo luận.
Dùng Z-score và biến đổi tỷ lệ để phát hiện spike bất thường.
"""

import numpy as np
import pandas as pd
from scipy import stats
from src.utils.logger import setup_logger

logger = setup_logger("trend_analyzer")


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
        logger.debug(f"Tính growth rate: min={growth_rate.min():.2f}, max={growth_rate.max():.2f}")
        return growth_rate.fillna(0)

    def detect_anomalies(self, series: pd.Series) -> pd.Series:
        """Gắn cờ các điểm bất thường dựa trên Z-score."""
        z_scores = np.abs(stats.zscore(series.fillna(0)))
        anomalies = pd.Series(z_scores > self.z_threshold, index=series.index)
        if anomalies.any():
            logger.info(f"Phát hiện {anomalies.sum()} điểm bất thường")
        return anomalies

    def get_trending_topics(self, df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
        """
        Đầu vào: DataFrame có cột ['topic', 'timestamp', 'count']
        Đầu ra: Top N chủ đề đang tăng mạnh nhất
        """
        logger.info(f"Phân tích {len(df)} dòng, tìm top {top_n} trending topics")
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
        
        # Handle empty DataFrame
        if result_df.empty:
            logger.warning("Không có topics để phân tích")
            return result_df
        
        logger.info(f"Top topic: {result_df.iloc[0]['topic']}")
        return result_df.sort_values('avg_growth', ascending=False).head(top_n)
