"""
Unit tests cho SentimentAnalyzer.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import pytest
from unittest.mock import Mock, patch
import pandas as pd

from src.nlp.sentiment_analyzer import SentimentAnalyzer


class TestSentimentAnalyzer:
    """Test suite cho SentimentAnalyzer."""
    
    @pytest.fixture
    def analyzer(self):
        """Tạo SentimentAnalyzer instance với mock pipeline."""
        with patch('src.nlp.sentiment_analyzer.pipeline') as mock_pipeline:
            # Mock the pipeline
            mock_pipe = Mock()
            mock_pipeline.return_value = mock_pipe
            analyzer = SentimentAnalyzer()
            analyzer.pipe = mock_pipe
            return analyzer
    
    def test_predict_positive(self, analyzer):
        """Test dự đoán cảm xúc tích cực."""
        analyzer.pipe.return_value = [{"label": "positive", "score": 0.95}]
        result = analyzer.predict("Video này hay quá!")
        
        assert result["label"] == "positive"
        assert result["score"] == 0.95
    
    def test_predict_negative(self, analyzer):
        """Test dự đoán cảm xúc tiêu cực."""
        analyzer.pipe.return_value = [{"label": "negative", "score": 0.88}]
        result = analyzer.predict("Thật tệ hại!")
        
        assert result["label"] == "negative"
        assert result["score"] == 0.88
    
    def test_predict_neutral(self, analyzer):
        """Test dự đoán cảm xúc trung tính."""
        analyzer.pipe.return_value = [{"label": "neutral", "score": 0.65}]
        result = analyzer.predict("Hôm nay trời đẹp")
        
        assert result["label"] == "neutral"
        assert result["score"] == 0.65
    
    def test_predict_label_mapping(self, analyzer):
        """Test ánh xạ nhãn từ model sang chuẩn."""
        # Test LABEL_0 -> negative
        analyzer.pipe.return_value = [{"label": "LABEL_0", "score": 0.9}]
        result = analyzer.predict("test")
        assert result["label"] == "negative"
        
        # Test LABEL_1 -> neutral
        analyzer.pipe.return_value = [{"label": "LABEL_1", "score": 0.9}]
        result = analyzer.predict("test")
        assert result["label"] == "neutral"
        
        # Test LABEL_2 -> positive
        analyzer.pipe.return_value = [{"label": "LABEL_2", "score": 0.9}]
        result = analyzer.predict("test")
        assert result["label"] == "positive"
    
    def test_predict_error_handling(self, analyzer):
        """Test xử lý lỗi khi model fail."""
        analyzer.pipe.side_effect = Exception("Model error")
        result = analyzer.predict("test")
        
        assert result["label"] == "neutral"
        assert result["score"] == 0.0
    
    def test_predict_truncation(self, analyzer):
        """Test truncation văn bản dài."""
        long_text = "a" * 600  # 600 chars
        analyzer.pipe.return_value = [{"label": "positive", "score": 0.8}]
        
        result = analyzer.predict(long_text)
        
        # Kiểm tra text đã được truncate
        called_text = analyzer.pipe.call_args[0][0]
        assert len(called_text) == 512
    
    def test_batch_predict(self, analyzer):
        """Test batch prediction."""
        texts = ["text1", "text2", "text3"]
        analyzer.pipe.side_effect = [
            [{"label": "positive", "score": 0.9}],
            [{"label": "negative", "score": 0.8}],
            [{"label": "neutral", "score": 0.7}],
        ]
        
        results = analyzer.batch_predict(texts)
        
        assert len(results) == 3
        assert results[0]["label"] == "positive"
        assert results[1]["label"] == "negative"
        assert results[2]["label"] == "neutral"
    
    def test_batch_predict_with_error(self, analyzer):
        """Test batch prediction với một số lỗi."""
        texts = ["text1", "text2", "text3"]
        analyzer.pipe.side_effect = [
            [{"label": "positive", "score": 0.9}],
            Exception("Error"),
            [{"label": "neutral", "score": 0.7}],
        ]
        
        results = analyzer.batch_predict(texts)
        
        assert len(results) == 3
        assert results[0]["label"] == "positive"
        assert results[1]["label"] == "neutral"  # Error fallback
        assert results[1]["score"] == 0.0
        assert results[2]["label"] == "neutral"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])