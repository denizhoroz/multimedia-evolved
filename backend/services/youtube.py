"""YouTube/Instagram/TikTok download service using yt-dlp."""

import os
import yt_dlp
from backend.utils.files import OUTPUT_DIR


def _base_opts(cookies_browser: str | None = None) -> dict:
    """Build common yt-dlp options."""
    opts = {
        "outtmpl": os.path.join(OUTPUT_DIR, "%(title)s.%(ext)s"),
        "noplaylist": True,
    }
    if cookies_browser:
        opts["cookiesfrombrowser"] = (cookies_browser,)
    return opts


def download_video(url: str, format_choice: str = "best", cookies_browser: str | None = None) -> dict:
    """Download a video from YouTube or other supported sites."""
    ydl_opts = _base_opts(cookies_browser)
    ydl_opts["format"] = format_choice

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)

    return {
        "title": info.get("title", "Unknown"),
        "filename": os.path.basename(filename),
        "filepath": filename,
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
    }


def download_audio_only(url: str, cookies_browser: str | None = None) -> dict:
    """Download only the audio from a video URL."""
    ydl_opts = _base_opts(cookies_browser)
    ydl_opts["format"] = "bestaudio/best"
    ydl_opts["postprocessors"] = [{
        "key": "FFmpegExtractAudio",
        "preferredcodec": "mp3",
        "preferredquality": "192",
    }]

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        title = info.get("title", "Unknown")
        filename = f"{title}.mp3"
        filepath = os.path.join(OUTPUT_DIR, filename)

    return {
        "title": title,
        "filename": filename,
        "filepath": filepath,
        "duration": info.get("duration"),
    }


def get_video_info(url: str, cookies_browser: str | None = None) -> dict:
    """Get video info without downloading."""
    ydl_opts = {"noplaylist": True}
    if cookies_browser:
        ydl_opts["cookiesfrombrowser"] = (cookies_browser,)

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    formats = []
    for f in info.get("formats", []):
        if f.get("vcodec") != "none" and f.get("acodec") != "none":
            formats.append({
                "format_id": f["format_id"],
                "ext": f["ext"],
                "resolution": f.get("resolution", "unknown"),
                "filesize": f.get("filesize"),
            })

    return {
        "title": info.get("title"),
        "duration": info.get("duration"),
        "thumbnail": info.get("thumbnail"),
        "formats": formats,
    }
