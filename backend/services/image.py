"""Image processing service using Pillow."""

import os
from PIL import Image
from backend.utils.files import get_output_path


def resize_image(input_path: str, width: int, height: int, keep_aspect: bool = True) -> dict:
    """Resize an image to the specified dimensions."""
    img = Image.open(input_path)
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]

    if keep_aspect:
        img.thumbnail((width, height), Image.LANCZOS)
    else:
        img = img.resize((width, height), Image.LANCZOS)

    output_path = get_output_path(f"{base_name}_resized{ext}")
    img.save(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "width": img.width,
        "height": img.height,
    }


def crop_image(input_path: str, left: int, top: int, right: int, bottom: int) -> dict:
    """Crop an image to the specified bounding box."""
    img = Image.open(input_path)
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]

    cropped = img.crop((left, top, right, bottom))
    output_path = get_output_path(f"{base_name}_cropped{ext}")
    cropped.save(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "width": cropped.width,
        "height": cropped.height,
    }


def rotate_image(input_path: str, angle: float) -> dict:
    """Rotate an image by the specified angle (degrees)."""
    img = Image.open(input_path)
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    ext = os.path.splitext(input_path)[1]

    rotated = img.rotate(angle, expand=True)
    output_path = get_output_path(f"{base_name}_rotated{ext}")
    rotated.save(output_path)

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "width": rotated.width,
        "height": rotated.height,
    }


def get_image_info(input_path: str) -> dict:
    """Get metadata about an image."""
    img = Image.open(input_path)
    file_size = os.path.getsize(input_path)

    return {
        "width": img.width,
        "height": img.height,
        "format": img.format,
        "mode": img.mode,
        "file_size": file_size,
    }
