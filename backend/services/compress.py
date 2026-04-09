"""Media compression service using FFmpeg and Pillow."""

import os
import ffmpeg
from PIL import Image
from backend.utils.files import get_output_path


def compress_video(input_path: str, quality: str = "medium") -> dict:
    """Compress a video file. Quality: low, medium, high."""
    crf_map = {"low": "32", "medium": "28", "high": "23"}
    crf = crf_map.get(quality, "28")

    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]
    output_path = get_output_path(f"{base_name}_compressed{ext}")

    (
        ffmpeg
        .input(input_path)
        .output(output_path, vcodec="libx264", crf=crf, preset="medium", acodec="aac")
        .overwrite_output()
        .run(quiet=True)
    )

    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "original_size": original_size,
        "compressed_size": compressed_size,
        "reduction": round((1 - compressed_size / original_size) * 100, 1),
    }


def compress_image(input_path: str, quality: int = 70) -> dict:
    """Compress an image file. Quality: 1-100."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]
    output_path = get_output_path(f"{base_name}_compressed{ext}")

    img = Image.open(input_path)
    if ext.lower() in (".jpg", ".jpeg"):
        img.save(output_path, quality=quality, optimize=True)
    elif ext.lower() == ".png":
        img.save(output_path, optimize=True)
    else:
        img.save(output_path, quality=quality)

    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "original_size": original_size,
        "compressed_size": compressed_size,
        "reduction": round((1 - compressed_size / original_size) * 100, 1),
    }


def compress_audio(input_path: str, bitrate: str = "128k") -> dict:
    """Compress an audio file by lowering the bitrate."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]
    output_path = get_output_path(f"{base_name}_compressed{ext}")

    (
        ffmpeg
        .input(input_path)
        .output(output_path, audio_bitrate=bitrate)
        .overwrite_output()
        .run(quiet=True)
    )

    original_size = os.path.getsize(input_path)
    compressed_size = os.path.getsize(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "original_size": original_size,
        "compressed_size": compressed_size,
        "reduction": round((1 - compressed_size / original_size) * 100, 1),
    }
