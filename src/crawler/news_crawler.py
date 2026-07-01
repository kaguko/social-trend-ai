"""
VnExpress News Crawler
Crawl bài viết từ VnExpress theo từ khoá, lưu ra CSV.

Cách dùng:
    python src/crawler/news_crawler.py --keyword "AI" --pages 3
    python src/crawler/news_crawler.py --keyword "công nghệ" --pages 5 --output data/processed/vnexpress.csv
"""

import requests
import pandas as pd
import time
import argparse
import os
from datetime import datetime
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

SEARCH_URL = "https://timkiem.vnexpress.net/"


def search_vnexpress(keyword: str, page: int = 1) -> list[dict]:
    params = {
        "q": keyword,
        "media_type": "text",
        "fromdate": -1,
        "todate": -1,
        "latest": "",
        "cate_code": "",
        "search_f": "title,tag_list",
        "page": page
    }

    try:
        resp = requests.get(SEARCH_URL, params=params, headers=HEADERS, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[!] Lỗi kết nối trang {page}: {e}")
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    articles = []

    for item in soup.select("article[data-url]"):
        url = item.get("data-url", "")

        # Title: text trong .title-news (không có thẻ a con)
        title_tag = item.select_one(".title-news")
        if not title_tag:
            continue
        title = title_tag.get_text(strip=True)
        if not title:
            continue

        # Description
        desc_tag = item.select_one(".description")
        description = desc_tag.get_text(strip=True) if desc_tag else ""

        # Thời gian từ data-publishtime (Unix timestamp)
        publish_ts = item.get("data-publishtime", "")
        try:
            publish_time = datetime.fromtimestamp(int(publish_ts)).strftime("%Y-%m-%d %H:%M:%S") if publish_ts else ""
        except Exception:
            publish_time = ""

        # Fallback URL từ thumb nếu data-url trống
        if not url:
            a_tag = item.select_one("a[href]")
            url = a_tag.get("href", "") if a_tag else ""

        articles.append({
            "title":        title,
            "url":          url,
            "description":  description,
            "publish_time": publish_time,
            "keyword":      keyword,
            "crawled_at":   datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "content":      ""
        })

    return articles


def get_article_content(url: str) -> str:
    if not url.startswith("http"):
        return ""
    try:
        resp = requests.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        paragraphs = soup.select("article.fck_detail p")
        return " ".join(p.get_text(strip=True) for p in paragraphs)
    except Exception:
        return ""


def crawl(keyword: str, pages: int = 3, fetch_content: bool = False,
          delay: float = 1.5) -> pd.DataFrame:
    all_articles = []

    for page in range(1, pages + 1):
        print(f"[*] Crawl trang {page}/{pages} — từ khoá: '{keyword}'")
        articles = search_vnexpress(keyword, page)

        if fetch_content:
            for art in articles:
                print(f"    → Lấy nội dung: {art['title'][:60]}...")
                art["content"] = get_article_content(art["url"])
                time.sleep(delay)

        all_articles.extend(articles)
        print(f"    ✓ Lấy được {len(articles)} bài")
        time.sleep(delay)

    df = pd.DataFrame(all_articles)
    if df.empty:
        return df
    df.drop_duplicates(subset="url", inplace=True)
    df.reset_index(drop=True, inplace=True)
    print(f"\n✅ Tổng cộng: {len(df)} bài (đã loại trùng)")
    return df


def save(df: pd.DataFrame, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"💾 Đã lưu vào: {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crawl bài viết VnExpress theo từ khoá")
    parser.add_argument("--keyword",  type=str, default="công nghệ")
    parser.add_argument("--pages",    type=int, default=3)
    parser.add_argument("--content",  action="store_true")
    parser.add_argument("--delay",    type=float, default=1.5)
    parser.add_argument("--output",   type=str, default="data/processed/vnexpress_articles.csv")
    args = parser.parse_args()

    df = crawl(
        keyword=args.keyword,
        pages=args.pages,
        fetch_content=args.content,
        delay=args.delay
    )

    if not df.empty:
        save(df, args.output)
        print("\n--- Preview 5 bài đầu ---")
        print(df[["title", "description", "publish_time"]].head().to_string(index=False))
    else:
        print("[!] Không tìm thấy bài viết nào.")
