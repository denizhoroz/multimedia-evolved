"""Format conversion service using FFmpeg and Pillow."""

import os
import ffmpeg
from PIL import Image
from backend.utils.files import get_output_path


# Supported formats
VIDEO_FORMATS = ["mp4", "mkv", "avi", "mov", "webm", "flv"]
AUDIO_FORMATS = ["mp3", "aac", "wav", "flac", "ogg", "wma"]
IMAGE_FORMATS = ["png", "jpg", "jpeg", "webp", "bmp", "gif", "tiff"]


def convert_video(input_path: str, target_format: str) -> dict:
    """Convert a video file to a different format."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base_name}.{target_format}"
    output_path = get_output_path(output_filename)

    (
        ffmpeg
        .input(input_path)
        .output(output_path)
        .overwrite_output()
        .run(quiet=True)
    )

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "format": target_format,
    }


def convert_audio(input_path: str, target_format: str) -> dict:
    """Convert an audio file to a different format."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base_name}.{target_format}"
    output_path = get_output_path(output_filename)

    (
        ffmpeg
        .input(input_path)
        .output(output_path)
        .overwrite_output()
        .run(quiet=True)
    )

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "format": target_format,
    }


def convert_image(input_path: str, target_format: str) -> dict:
    """Convert an image file to a different format."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base_name}.{target_format}"
    output_path = get_output_path(output_filename)

    img = Image.open(input_path)
    if target_format.lower() in ("jpg", "jpeg") and img.mode == "RGBA":
        img = img.convert("RGB")
    img.save(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "format": target_format,
    }
