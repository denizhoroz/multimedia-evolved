"""Audio extraction service using FFmpeg."""

import os
import ffmpeg
from backend.utils.files import get_output_path


def extract_audio(input_path: str, output_format: str = "mp3", bitrate: str = "192k") -> dict:
    """Extract audio from a video file."""
    base_name = os.path.splitext(os.path.basename(input_path))[0]
    output_filename = f"{base_name}.{output_format}"
    output_path = get_output_path(output_filename)

    (
        ffmpeg
        .input(input_path)
        .output(output_path, acodec=_get_codec(output_format), audio_bitrate=bitrate)
        .overwrite_output()
        .run(quiet=True)
    )

    return {
        "filename": os.path.basename(output_path),
        "filepath": output_path,
        "format": output_format,
    }


def _get_codec(fmt: str) -> str:
    """Map format to audio codec."""
    codecs = {
        "mp3": "libmp3lame",
        "aac": "aac",
        "wav": "pcm_s16le",
        "flac": "flac",
        "ogg": "libvorbis",
    }
    return codecs.get(fmt, "libmp3lame")
