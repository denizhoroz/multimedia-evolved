"""Video download API routes (YouTube, Instagram, TikTok, etc.)."""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from backend.services.youtube import download_video, download_audio_only, get_video_info
from backend.utils.files import send_file

router = APIRouter()


class DownloadRequest(BaseModel):
    url: str
    format: str = "best"


class AudioDownloadRequest(BaseModel):
    url: str


class InfoRequest(BaseModel):
    url: str


@router.post("/info")
async def video_info(req: InfoRequest):
    try:
        return get_video_info(req.url)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/download")
async def download(req: DownloadRequest):
    try:
        result = download_video(req.url, req.format)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/download-audio")
async def download_audio(req: AudioDownloadRequest):
    try:
        result = download_audio_only(req.url)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
