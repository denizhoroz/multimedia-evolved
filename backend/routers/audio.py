"""Audio extraction API routes."""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.audio import extract_audio
from backend.utils.files import send_file, get_temp_path, cleanup_temp_files

router = APIRouter()


@router.post("/extract")
async def extract(
    file: UploadFile = File(...),
    format: str = Form("mp3"),
    bitrate: str = Form("192k"),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)

        with open(temp_path, "wb") as f:
            content = await file.read()
            f.write(content)

        result = extract_audio(temp_path, format, bitrate)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)
