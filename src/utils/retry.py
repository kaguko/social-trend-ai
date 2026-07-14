"""
Retry mechanism cho các API calls và HTTP requests.
Sử dụng tenacity để retry với exponential backoff.
"""

import time
from functools import wraps
from typing import Callable, TypeVar

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
)
import requests

from src.utils.logger import setup_logger

logger = setup_logger("retry")


# Custom exceptions
class CrawlerError(Exception):
    """Base exception cho crawler errors."""
    pass


class APIQuotaExceeded(Exception):
    """API quota đã hết."""
    pass


# Retry decorator cho HTTP requests
def retry_on_network_error(max_attempts: int = 3, min_wait: float = 1.0, max_wait: float = 10.0):
    """
    Retry decorator cho network errors.
    
    Args:
        max_attempts: Số lần retry tối đa
        min_wait: Thời gian chờ tối thiểu (giây)
        max_wait: Thời gian chờ tối đa (giây)
    """
    return retry(
        retry=retry_if_exception_type((
            requests.ConnectionError,
            requests.Timeout,
            requests.RequestException,
            CrawlerError,
        )),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        stop=stop_after_attempt(max_attempts),
        before_sleep=lambda retry_state: logger.warning(
            f"Retry attempt {retry_state.attempt_number}/{max_attempts} "
            f"after {retry_state.outcome.exception()}"
        ),
        reraise=True,
    )


# Retry decorator cho API errors (có error code)
def retry_on_api_error(max_attempts: int = 3, min_wait: float = 2.0, max_wait: float = 15.0):
    """
    Retry decorator cho API errors (429, 500, 503, etc.)
    """
    return retry(
        retry=retry_if_exception_type((
            requests.HTTPError,
            APIQuotaExceeded,
        )),
        wait=wait_exponential(multiplier=1, min=min_wait, max=max_wait),
        stop=stop_after_attempt(max_attempts),
        before_sleep=lambda retry_state: logger.warning(
            f"API error, retry {retry_state.attempt_number}/{max_attempts}"
        ),
        reraise=True,
    )


# Utility function: safe request
@retry_on_network_error()
def safe_get(url: str, **kwargs) -> requests.Response:
    """
    HTTP GET với retry logic.
    
    Usage:
        response = safe_get("https://api.example.com/data", params={"key": "value"})
    """
    logger.debug(f"GET request to: {url}")
    response = requests.get(url, **kwargs)
    
    # Check for API quota errors
    if response.status_code == 429:
        logger.warning("API quota exceeded (429)")
        raise APIQuotaExceeded("Rate limit exceeded")
    
    response.raise_for_status()
    return response


@retry_on_network_error()
def safe_post(url: str, **kwargs) -> requests.Response:
    """HTTP POST với retry logic."""
    logger.debug(f"POST request to: {url}")
    response = requests.post(url, **kwargs)
    
    if response.status_code == 429:
        logger.warning("API quota exceeded (429)")
        raise APIQuotaExceeded("Rate limit exceeded")
    
    response.raise_for_status()
    return response


# Rate limiter đơn giản
class RateLimiter:
    """Simple rate limiter để tránh gọi API quá nhanh."""
    
    def __init__(self, delay: float = 1.0):
        """
        Args:
            delay: Thời gian chờ giữa các requests (giây)
        """
        self.delay = delay
        self.last_call_time = 0.0
    
    def wait(self):
        """Chờ đủ thời gian trước khi gọi tiếp."""
        current_time = time.time()
        time_since_last_call = current_time - self.last_call_time
        
        if time_since_last_call < self.delay:
            sleep_time = self.delay - time_since_last_call
            logger.debug(f"Rate limit: sleeping {sleep_time:.2f}s")
            time.sleep(sleep_time)
        
        self.last_call_time = time.time()
    
    def __call__(self, func: Callable) -> Callable:
        """Decorator để áp dụng rate limiting."""
        @wraps(func)
        def wrapper(*args, **kwargs):
            self.wait()
            return func(*args, **kwargs)
        return wrapper