"""
Data validation utilities cho Social Trend AI.
Kiểm tra tính hợp lệ của input data và output data.
"""

import pandas as pd
from typing import List, Optional, Dict, Any
from src.utils.logger import setup_logger

logger = setup_logger("validation")


class ValidationError(Exception):
    """Custom exception cho validation errors."""
    pass


def validate_dataframe(
    df: pd.DataFrame,
    required_columns: List[str],
    min_rows: int = 1,
    max_rows: Optional[int] = None,
    allow_duplicates: bool = False
) -> Dict[str, Any]:
    """
    Validate DataFrame cơ bản.
    
    Args:
        df: DataFrame cần validate
        required_columns: List các cột bắt buộc phải có
        min_rows: Số dòng tối thiểu
        max_rows: Số dòng tối đa (None = không giới hạn)
        allow_duplicates: Cho phép duplicate rows không
    
    Returns:
        Dict với validation results
    
    Raises:
        ValidationError: Nếu validation fail
    """
    errors = []
    warnings = []
    
    # Check if DataFrame is empty
    if df is None or df.empty:
        errors.append("DataFrame is empty or None")
        return {"valid": False, "errors": errors, "warnings": warnings}
    
    # Check required columns
    missing_cols = [col for col in required_columns if col not in df.columns]
    if missing_cols:
        errors.append(f"Missing required columns: {missing_cols}")
    
    # Check min rows
    if len(df) < min_rows:
        errors.append(f"DataFrame has {len(df)} rows, minimum required is {min_rows}")
    
    # Check max rows
    if max_rows and len(df) > max_rows:
        warnings.append(f"DataFrame has {len(df)} rows, maximum recommended is {max_rows}")
    
    # Check duplicates
    if not allow_duplicates:
        dup_count = df.duplicated().sum()
        if dup_count > 0:
            warnings.append(f"Found {dup_count} duplicate rows")
    
    # Check for all-NaN columns
    nan_cols = [col for col in df.columns if df[col].isna().all()]
    if nan_cols:
        warnings.append(f"Columns with all NaN values: {nan_cols}")
    
    is_valid = len(errors) == 0
    
    if is_valid:
        logger.info(f"✅ DataFrame validation passed: {len(df)} rows, {len(df.columns)} columns")
    else:
        logger.error(f"❌ DataFrame validation failed: {errors}")
        raise ValidationError(f"DataFrame validation failed: {'; '.join(errors)}")
    
    return {
        "valid": is_valid,
        "errors": errors,
        "warnings": warnings,
        "rows": len(df),
        "columns": len(df.columns)
    }


def validate_sentiment_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate sentiment analysis output data.
    
    Args:
        df: DataFrame với cột 'sentiment' và 'confidence'
    
    Returns:
        Dict với validation results
    """
    logger.info("Validating sentiment data...")
    
    # Basic validation
    result = validate_dataframe(
        df,
        required_columns=['sentiment', 'confidence'],
        min_rows=1
    )
    
    if not result['valid']:
        return result
    
    # Check sentiment values
    valid_sentiments = {'positive', 'negative', 'neutral'}
    unique_sentiments = set(df['sentiment'].dropna().str.lower().str.strip())
    invalid_sentiments = unique_sentiments - valid_sentiments
    
    if invalid_sentiments:
        result['warnings'].append(f"Invalid sentiment values found: {invalid_sentiments}")
    
    # Check confidence range
    if 'confidence' in df.columns:
        conf_min = df['confidence'].min()
        conf_max = df['confidence'].max()
        
        if conf_min < 0 or conf_max > 1:
            result['warnings'].append(
                f"Confidence values out of range [0,1]: min={conf_min}, max={conf_max}"
            )
    
    # Check for missing sentiments
    missing_sentiment = df['sentiment'].isna().sum()
    if missing_sentiment > 0:
        result['warnings'].append(f"{missing_sentiment} rows with missing sentiment")
    
    logger.info(f"✅ Sentiment validation complete: {len(result['warnings'])} warnings")
    return result


def validate_crawler_output(df: pd.DataFrame, source: str) -> Dict[str, Any]:
    """
    Validate crawler output data.
    
    Args:
        df: DataFrame từ crawler
        source: Tên nguồn (e.g., 'vnexpress', 'youtube')
    
    Returns:
        Dict với validation results
    """
    logger.info(f"Validating crawler output from {source}...")
    
    # Define required columns based on source
    if source == 'vnexpress':
        required = ['title', 'url']
    elif source == 'youtube':
        required = ['text', 'video_id']
    else:
        required = ['text', 'url']  # Default
    
    result = validate_dataframe(
        df,
        required_columns=required,
        min_rows=1,
        allow_duplicates=False
    )
    
    if not result['valid']:
        return result
    
    # Check URLs
    if 'url' in df.columns:
        invalid_urls = df[~df['url'].str.startswith('http')]['url'].count()
        if invalid_urls > 0:
            result['warnings'].append(f"{invalid_urls} rows with invalid URLs")
    
    # Check text content
    text_col = 'text' if 'text' in df.columns else 'title'
    if text_col in df.columns:
        empty_text = df[df[text_col].str.strip() == ''][text_col].count()
        if empty_text > 0:
            result['warnings'].append(f"{empty_text} rows with empty {text_col}")
    
    logger.info(f"✅ Crawler validation complete: {len(result['warnings'])} warnings")
    return result


def validate_trend_data(df: pd.DataFrame) -> Dict[str, Any]:
    """
    Validate trend analysis input data.
    
    Args:
        df: DataFrame với cột 'topic', 'timestamp', 'count'
    
    Returns:
        Dict với validation results
    """
    logger.info("Validating trend data...")
    
    result = validate_dataframe(
        df,
        required_columns=['topic', 'timestamp', 'count'],
        min_rows=1
    )
    
    if not result['valid']:
        return result
    
    # Check timestamp format
    if not pd.api.types.is_datetime64_any_dtype(df['timestamp']):
        result['warnings'].append("timestamp column is not datetime type, attempting conversion...")
        try:
            df['timestamp'] = pd.to_datetime(df['timestamp'], errors='coerce')
            invalid_timestamps = df['timestamp'].isna().sum()
            if invalid_timestamps > 0:
                result['warnings'].append(f"{invalid_timestamps} rows with invalid timestamps")
        except Exception as e:
            result['errors'].append(f"Failed to parse timestamps: {e}")
            result['valid'] = False
    
    # Check count values
    if 'count' in df.columns:
        negative_counts = (df['count'] < 0).sum()
        if negative_counts > 0:
            result['warnings'].append(f"{negative_counts} rows with negative count values")
    
    # Check topics
    if 'topic' in df.columns:
        unique_topics = df['topic'].nunique()
        if unique_topics < 1:
            result['errors'].append("No unique topics found")
            result['valid'] = False
        else:
            logger.info(f"Found {unique_topics} unique topics")
    
    logger.info(f"✅ Trend validation complete: {len(result['warnings'])} warnings")
    return result


def clean_sentiment_data(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean và chuẩn hóa sentiment data.
    
    Args:
        df: DataFrame với cột 'sentiment'
    
    Returns:
        Cleaned DataFrame
    """
    logger.info("Cleaning sentiment data...")
    df_clean = df.copy()
    
    # Normalize sentiment labels
    if 'sentiment' in df_clean.columns:
        df_clean['sentiment'] = df_clean['sentiment'].str.lower().str.strip()
        
        # Map common variations
        sentiment_map = {
            'pos': 'positive',
            'neg': 'negative',
            'neu': 'neutral',
            '0': 'negative',
            '1': 'neutral',
            '2': 'positive',
        }
        df_clean['sentiment'] = df_clean['sentiment'].replace(sentiment_map)
    
    # Clip confidence to [0, 1]
    if 'confidence' in df_clean.columns:
        df_clean['confidence'] = df_clean['confidence'].clip(0, 1)
    
    logger.info(f"✅ Cleaned {len(df_clean)} rows")
    return df_clean


def get_data_quality_report(df: pd.DataFrame) -> str:
    """
    Tạo data quality report.
    
    Args:
        df: DataFrame cần report
    
    Returns:
        String report
    """
    report = []
    report.append("=== DATA QUALITY REPORT ===\n")
    report.append(f"Shape: {df.shape[0]} rows × {df.shape[1]} columns")
    report.append(f"\nMemory usage: {df.memory_usage(deep=True).sum() / 1024**2:.2f} MB")
    
    # Missing values
    missing = df.isnull().sum()
    if missing.sum() > 0:
        report.append("\n--- Missing Values ---")
        for col, count in missing[missing > 0].items():
            pct = count / len(df) * 100
            report.append(f"  {col}: {count} ({pct:.1f}%)")
    else:
        report.append("\n✅ No missing values")
    
    # Duplicates
    dup_count = df.duplicated().sum()
    report.append(f"\n--- Duplicates ---")
    report.append(f"  {dup_count} duplicate rows ({dup_count/len(df)*100:.1f}%)")
    
    # Data types
    report.append("\n--- Data Types ---")
    for col, dtype in df.dtypes.items():
        report.append(f"  {col}: {dtype}")
    
    # Numeric columns stats
    numeric_cols = df.select_dtypes(include=['number']).columns
    if len(numeric_cols) > 0:
        report.append("\n--- Numeric Columns Summary ---")
        report.append(df[numeric_cols].describe().to_string())
    
    return "\n".join(report)