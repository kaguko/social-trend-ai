"""
Tiền xử lý văn bản tiếng Việt:
- Chuẩn hoá Unicode
- Xoá emoji, ký tự đặc biệt
- Tách từ (word segmentation)
- Loại bỏ stopwords
"""

import re
import unicodedata


def normalize_text(text: str) -> str:
    """Chuẩn hoá Unicode và xoá ký tự không cần thiết."""
    text = unicodedata.normalize('NFC', text)
    text = re.sub(r'http\S+|www\.\S+', '', text)       # Xoá URL
    text = re.sub(r'[^\w\s\u00C0-\u024F]', ' ', text)  # Giữ chữ và dấu tiếng Việt
    text = re.sub(r'\s+', ' ', text).strip()
    return text


def segment_words(text: str) -> str:
    """Tách từ tiếng Việt bằng underthesea."""
    try:
        from underthesea import word_tokenize
        return word_tokenize(text, format='text')
    except ImportError:
        return text


def preprocess(text: str, segment: bool = True) -> str:
    """Pipeline tiền xử lý đầy đủ."""
    text = normalize_text(text)
    if segment:
        text = segment_words(text)
    return text.lower()
