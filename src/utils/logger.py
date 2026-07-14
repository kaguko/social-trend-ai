"""
Logging configuration cho dự án Social Trend AI.
Setup logging với format chuẩn, có thể tùy chỉnh level.
"""

import logging
import sys
from datetime import datetime
from pathlib import Path


def setup_logger(
    name: str = "social_trend_ai",
    level: int = logging.INFO,
    log_to_file: bool = True,
    log_dir: str = "logs"
) -> logging.Logger:
    """
    Tạo và cấu hình logger.
    
    Args:
        name: Tên logger
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_to_file: Có ghi log ra file không
        log_dir: Thư mục chứa log files
    
    Returns:
        logging.Logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    # Tránh duplicate handlers
    if logger.handlers:
        return logger
    
    # Format
    formatter = logging.Formatter(
        '%(asctime)s | %(levelname)s | %(name)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler (nếu cần)
    if log_to_file:
        log_path = Path(log_dir)
        log_path.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        log_file = log_path / f"social_trend_{timestamp}.log"
        
        file_handler = logging.FileHandler(log_file, encoding='utf-8')
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger


# Tạo logger mặc định cho toàn bộ project
default_logger = setup_logger()