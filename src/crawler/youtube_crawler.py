"""
YouTube Comment Crawler (dùng YouTube Data API v3)
Lấy comments từ video theo từ khoá hoặc Video ID.

Yêu cầu:
    - Tạo file .env với: YOUTUBE_API_KEY=your_api_key_here
    - Lấy API key miễn phí tại: https://console.cloud.google.com/

Cách dùng:
    python src/crawler/youtube_crawler.py --video_id dQw4w9WgXcQ --max_comments 200
    python src/crawler/youtube_crawler.py --search "AI Việt Nam" --max_videos 3
"""

import os
import requests
import pandas as pd
import time
import argparse
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("YOUTUBE_API_KEY", "")
BASE_URL = "https://www.googleapis.com/youtube/v3"


def search_videos(query: str, max_results: int = 5) -> list[dict]:
    """Tìm video theo từ khoá, trả về danh sách {video_id, title}."""
    if not API_KEY:
        print("[!] Chưa có YOUTUBE_API_KEY trong file .env")
        return []

    params = {
        "part": "snippet",
        "q": query,
        "type": "video",
        "maxResults": max_results,
        "relevanceLanguage": "vi",
        "key": API_KEY
    }
    resp = requests.get(f"{BASE_URL}/search", params=params, timeout=10)
    data = resp.json()
    videos = []
    for item in data.get("items", []):
        videos.append({
            "video_id": item["id"]["videoId"],
            "title":    item["snippet"]["title"]
        })
    return videos


def get_comments(video_id: str, max_comments: int = 100) -> list[dict]:
    """Lấy comments từ một video, trả về list dict."""
    if not API_KEY:
        print("[!] Chưa có YOUTUBE_API_KEY trong file .env")
        return []

    comments = []
    next_page_token = None

    while len(comments) < max_comments:
        params = {
            "part":       "snippet",
            "videoId":    video_id,
            "maxResults": min(100, max_comments - len(comments)),
            "key":        API_KEY
        }
        if next_page_token:
            params["pageToken"] = next_page_token

        try:
            resp = requests.get(f"{BASE_URL}/commentThreads", params=params, timeout=10)
            data = resp.json()
        except Exception as e:
            print(f"[!] Lỗi: {e}")
            break

        if "error" in data:
            print(f"[!] API error: {data['error']['message']}")
            break

        for item in data.get("items", []):
            snippet = item["snippet"]["topLevelComment"]["snippet"]
            comments.append({
                "video_id":    video_id,
                "text":        snippet.get("textDisplay", ""),
                "author":      snippet.get("authorDisplayName", ""),
                "like_count":  snippet.get("likeCount", 0),
                "published_at":snippet.get("publishedAt", ""),
                "crawled_at":  datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            })

        next_page_token = data.get("nextPageToken")
        if not next_page_token:
            break
        time.sleep(0.5)

    return comments


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Crawl YouTube comments")
    parser.add_argument("--video_id",    type=str, default="",           help="Video ID cụ thể")
    parser.add_argument("--search",      type=str, default="công nghệ",  help="Tìm video theo từ khoá")
    parser.add_argument("--max_videos",  type=int, default=3,            help="Số video cần crawl (khi dùng --search)")
    parser.add_argument("--max_comments",type=int, default=100,          help="Số comment tối đa mỗi video")
    parser.add_argument("--output",      type=str, default="data/processed/youtube_comments.csv")
    args = parser.parse_args()

    all_comments = []

    if args.video_id:
        video_ids = [{"video_id": args.video_id, "title": "(manual)"}]
    else:
        print(f"[*] Tìm video: '{args.search}'")
        video_ids = search_videos(args.search, args.max_videos)
        print(f"[*] Tìm thấy {len(video_ids)} video")

    for v in video_ids:
        print(f"[*] Lấy comments: {v['title'][:60]}")
        comments = get_comments(v["video_id"], args.max_comments)
        all_comments.extend(comments)
        print(f"    ✓ {len(comments)} comments")
        time.sleep(1)

    if all_comments:
        df = pd.DataFrame(all_comments)
        os.makedirs(os.path.dirname(args.output), exist_ok=True)
        df.to_csv(args.output, index=False, encoding="utf-8-sig")
        print(f"\n✅ Đã lưu {len(df)} comments vào: {args.output}")
        print(df[["text", "like_count", "published_at"]].head().to_string(index=False))
    else:
        print("[!] Không lấy được comment nào.")
