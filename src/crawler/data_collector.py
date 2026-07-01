"""
Data Collector — Gom dữ liệu từ nhiều nguồn vào một DataFrame duy nhất.

Cách dùng:
    python src/crawler/data_collector.py --keywords "AI,công nghệ,ChatGPT" --pages 3
"""

import argparse
import pandas as pd
import os
from datetime import datetime

from src.crawler.news_crawler import crawl as crawl_vnexpress


def collect_all(keywords: list[str], pages_per_keyword: int = 3,
                output_dir: str = "data/processed") -> pd.DataFrame:
    """
    Thu thập dữ liệu từ VnExpress với nhiều từ khoá,
    gom lại thành một file CSV duy nhất.
    """
    all_dfs = []

    for kw in keywords:
        print(f"\n{'='*50}")
        print(f"Từ khoá: {kw}")
        print('='*50)
        df = crawl_vnexpress(keyword=kw, pages=pages_per_keyword)
        if not df.empty:
            all_dfs.append(df)

    if not all_dfs:
        print("[!] Không thu thập được dữ liệu.")
        return pd.DataFrame()

    combined = pd.concat(all_dfs, ignore_index=True)
    combined.drop_duplicates(subset="url", inplace=True)
    combined.reset_index(drop=True, inplace=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M")
    output_path = os.path.join(output_dir, f"collected_{timestamp}.csv")
    os.makedirs(output_dir, exist_ok=True)
    combined.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"\n✅ Đã lưu {len(combined)} bài vào: {output_path}")
    return combined


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Thu thập dữ liệu từ nhiều nguồn")
    parser.add_argument(
        "--keywords", type=str,
        default="AI,công nghệ,mạng xã hội",
        help="Danh sách từ khoá, cách nhau bằng dấu phẩy"
    )
    parser.add_argument("--pages", type=int, default=3, help="Số trang mỗi từ khoá")
    parser.add_argument("--output", type=str, default="data/processed")
    args = parser.parse_args()

    keywords = [k.strip() for k in args.keywords.split(",") if k.strip()]
    collect_all(keywords, pages_per_keyword=args.pages, output_dir=args.output)
