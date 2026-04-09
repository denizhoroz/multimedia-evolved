"""Format conversion API routes."""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.convert import (
    convert_video, convert_audio, convert_image,
    VIDEO_FORMATS, AUDIO_FORMATS, IMAGE_FORMATS,
)
from backend.utils.files import send_file, get_temp_path, cleanup_temp_files

router = APIRouter()


@router.get("/formats")
async def get_formats():
    return {
        "video": VIDEO_FORMATS,
        "audio": AUDIO_FORMATS,
        "image": IMAGE_FORMATS,
    }


@router.post("/video")
async def convert_video_route(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = convert_video(temp_path, target_format)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/audio")
async def convert_audio_route(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = convert_audio(temp_path, target_format)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/image")
async def convert_image_route(
    file: UploadFile = File(...),
    target_format: str = Form(...),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = convert_image(temp_path, target_format)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)
