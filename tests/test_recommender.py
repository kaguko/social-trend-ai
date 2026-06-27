"""
Unit tests cho mô-đun ra quyết định.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from src.decision.recommender import Recommender, PRIORITY_HIGH, PRIORITY_MEDIUM, PRIORITY_LOW


def test_high_priority():
    r = Recommender()
    result = r.evaluate("test_topic", sentiment_neg_ratio=0.7, growth_rate=3.0, has_anomaly=True)
    assert result["priority"] == PRIORITY_HIGH


def test_medium_priority_growth():
    r = Recommender()
    result = r.evaluate("test_topic", sentiment_neg_ratio=0.1, growth_rate=2.5, has_anomaly=False)
    assert result["priority"] == PRIORITY_MEDIUM


def test_low_priority():
    r = Recommender()
    result = r.evaluate("test_topic", sentiment_neg_ratio=0.1, growth_rate=0.2, has_anomaly=False)
    assert result["priority"] == PRIORITY_LOW


if __name__ == "__main__":
    test_high_priority()
    test_medium_priority_growth()
    test_low_priority()
    print("✅ All tests passed!")
