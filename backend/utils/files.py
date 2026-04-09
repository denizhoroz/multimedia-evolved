"""File handling utilities."""

import os
import uuid
import shutil
from fastapi.responses import FileResponse


OUTPUT_DIR = "output"


def get_output_path(filename: str) -> str:
    """Generate a unique output file path."""
    name, ext = os.path.splitext(filename)
    unique_name = f"{name}_{uuid.uuid4().hex[:8]}{ext}"
    return os.path.join(OUTPUT_DIR, unique_name)


def send_file(path: str, filename: str) -> FileResponse:
    """Return a file as a downloadable response."""
    return FileResponse(
        path=path,
        filename=filename,
        media_type="application/octet-stream",
    )


def cleanup_temp_files(*paths: str):
    """Remove temporary files."""
    for path in paths:
        if path and os.path.exists(path):
            os.remove(path)


def get_temp_path(ext: str) -> str:
    """Generate a temporary file path with the given extension."""
    return os.path.join(OUTPUT_DIR, f"temp_{uuid.uuid4().hex[:8]}{ext}")
