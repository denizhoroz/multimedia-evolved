"""Image processing API routes."""

import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from backend.services.image import resize_image, crop_image, rotate_image, get_image_info
from backend.utils.files import send_file, get_temp_path, cleanup_temp_files

router = APIRouter()


@router.post("/resize")
async def resize(
    file: UploadFile = File(...),
    width: int = Form(...),
    height: int = Form(...),
    keep_aspect: bool = Form(True),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = resize_image(temp_path, width, height, keep_aspect)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/crop")
async def crop(
    file: UploadFile = File(...),
    left: int = Form(...),
    top: int = Form(...),
    right: int = Form(...),
    bottom: int = Form(...),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = crop_image(temp_path, left, top, right, bottom)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/rotate")
async def rotate(
    file: UploadFile = File(...),
    angle: float = Form(...),
):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        result = rotate_image(temp_path, angle)
        return send_file(result["filepath"], result["filename"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)


@router.post("/info")
async def info(file: UploadFile = File(...)):
    temp_path = None
    try:
        ext = os.path.splitext(file.filename)[1]
        temp_path = get_temp_path(ext)
        with open(temp_path, "wb") as f:
            f.write(await file.read())

        return get_image_info(temp_path)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        cleanup_temp_files(temp_path)
