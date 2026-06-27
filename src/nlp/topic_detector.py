"""
Phát hiện chủ đề từ tập văn bản.
Dùng BERTopic để gom cụm chủ đề tự động.
"""

from bertopic import BERTopic
from sentence_transformers import SentenceTransformer


class TopicDetector:
    def __init__(self, language="multilingual"):
        embedding_model = SentenceTransformer("paraphrase-multilingual-MiniLM-L12-v2")
        self.model = BERTopic(
            embedding_model=embedding_model,
            language="multilingual",
            nr_topics="auto",
            min_topic_size=5,
            verbose=True
        )

    def fit(self, docs: list[str]):
        """Huấn luyện mô hình phát hiện chủ đề."""
        topics, probs = self.model.fit_transform(docs)
        return topics, probs

    def get_topic_info(self):
        """Lấy thông tin các chủ đề và từ khoá đại diện."""
        return self.model.get_topic_info()

    def get_keywords(self, topic_id: int, top_n: int = 10):
        """Lấy từ khoá của một chủ đề."""
        return self.model.get_topic(topic_id)[:top_n]
