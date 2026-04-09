"""Media compression API routes."""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.compress import compress_video, compress_image, compress_audio
from backend.utils.files import send_file, get_temp_path, cleanup_temp_files

router = APIRouter()


@router.post("/video")
async def compress_video_route(
    file: UploadFile = File(...),
    quality: str = Form("medium"),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = compress_video(temp_path, quality)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/image")
async def compress_image_route(
    file: UploadFile = File(...),
    quality: int = Form(70),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = compress_image(temp_path, quality)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/audio")
async def compress_audio_route(
    file: UploadFile = File(...),
    bitrate: str = Form("128k"),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = compress_audio(temp_path, bitrate)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)
