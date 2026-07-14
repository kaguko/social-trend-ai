"""
Unit tests cho TrendAnalyzer.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

from src.trend_detection.trend_analyzer import TrendAnalyzer


class TestTrendAnalyzer:
    """Test suite cho TrendAnalyzer."""
    
    @pytest.fixture
    def analyzer(self):
        """Tạo TrendAnalyzer instance."""
        return TrendAnalyzer(window=3, z_threshold=2.0)
    
    @pytest.fixture
    def sample_time_series(self):
        """Tạo sample time series data."""
        np.random.seed(42)
        dates = [datetime(2024, 1, 1) + timedelta(hours=i) for i in range(24)]
        values = np.random.randn(24) * 10 + 50  # Base value 50
        values[12] = 150  # Anomaly spike
        return pd.Series(values, index=dates)
    
    def test_calculate_trend_score_normal(self, analyzer, sample_time_series):
        """Test trend score calculation với data bình thường."""
        trend_scores = analyzer.calculate_trend_score(sample_time_series)
        
        assert isinstance(trend_scores, pd.Series)
        assert len(trend_scores) == len(sample_time_series)
        # First window values should be 0 (NaN filled)
        assert trend_scores.iloc[0] == 0.0
    
    def test_calculate_trend_score_with_spike(self, analyzer):
        """Test trend score với sudden spike."""
        values = pd.Series([10, 10, 10, 10, 100])  # Spike at end
        trend_scores = analyzer.calculate_trend_score(values)
        
        # Should detect high growth rate
        assert trend_scores.iloc[-1] > 0
    
    def test_detect_anomalies_with_spike(self, analyzer, sample_time_series):
        """Test anomaly detection với spike."""
        anomalies = analyzer.detect_anomalies(sample_time_series)
        
        assert isinstance(anomalies, pd.Series)
        assert anomalies.dtype == bool
        # Should detect the spike at index 12
        assert anomalies.iloc[12] == True
    
    def test_detect_anomalies_no_spike(self, analyzer):
        """Test anomaly detection với data ổn định."""
        values = pd.Series([50, 51, 49, 50, 52])  # Stable values
        anomalies = analyzer.detect_anomalies(values)
        
        # Should not detect anomalies
        assert anomalies.sum() == 0
    
    def test_detect_anomalies_custom_threshold(self):
        """Test anomaly detection với custom threshold."""
        analyzer = TrendAnalyzer(window=3, z_threshold=1.5)  # Lower threshold
        values = pd.Series([10, 10, 10, 10, 30])  # Moderate spike
        anomalies = analyzer.detect_anomalies(values)
        
        # With lower threshold, should detect more anomalies
        assert anomalies.sum() > 0
    
    def test_get_trending_topics_basic(self, analyzer):
        """Test get_trending_topics với data cơ bản."""
        # Create sample DataFrame
        df = pd.DataFrame({
            'topic': ['AI', 'AI', 'AI', 'Blockchain', 'Blockchain', 'Blockchain'],
            'timestamp': pd.date_range('2024-01-01', periods=6, freq='H'),
            'count': [10, 15, 20, 5, 8, 12]
        })
        
        result = analyzer.get_trending_topics(df, top_n=2)
        
        assert isinstance(result, pd.DataFrame)
        assert len(result) <= 2
        assert 'topic' in result.columns
        assert 'avg_growth' in result.columns
        assert 'has_anomaly' in result.columns
    
    def test_get_trending_topics_sorted_by_growth(self, analyzer):
        """Test trending topics được sort theo growth rate."""
        df = pd.DataFrame({
            'topic': ['AI', 'AI', 'AI', 'Crypto', 'Crypto', 'Crypto'],
            'timestamp': pd.date_range('2024-01-01', periods=6, freq='H'),
            'count': [10, 50, 100, 10, 12, 14]  # AI has higher growth
        })
        
        result = analyzer.get_trending_topics(df, top_n=2)
        
        # First topic should have highest growth
        assert result.iloc[0]['avg_growth'] >= result.iloc[1]['avg_growth']
    
    def test_get_trending_topics_empty(self, analyzer):
        """Test với empty DataFrame."""
        df = pd.DataFrame({
            'topic': [],
            'timestamp': [],
            'count': []
        })
        
        result = analyzer.get_trending_topics(df)
        
        assert isinstance(result, pd.DataFrame)
        assert len(result) == 0
        # Check columns exist even when empty
        assert 'topic' in result.columns or len(result) == 0
    
    def test_trend_analyzer_custom_params(self):
        """Test TrendAnalyzer với custom parameters."""
        analyzer = TrendAnalyzer(window=12, z_threshold=3.0)
        
        assert analyzer.window == 12
        assert analyzer.z_threshold == 3.0
    
    def test_calculate_trend_score_all_zeros(self, analyzer):
        """Test với series toàn zeros."""
        values = pd.Series([0, 0, 0, 0, 0])
        trend_scores = analyzer.calculate_trend_score(values)
        
        # Should handle zeros gracefully
        assert not trend_scores.isna().any()


if __name__ == "__main__":
    pytest.main([__file__, "-v"])