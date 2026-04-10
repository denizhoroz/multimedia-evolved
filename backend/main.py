"""FastAPI application for Multimedia Evolved."""

import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from backend.routers import youtube, convert, compress, audio, image

app = FastAPI(title="Multimedia Evolved")

# Register routers
app.include_router(youtube.router, prefix="/api/youtube", tags=["YouTube"])
app.include_router(convert.router, prefix="/api/convert", tags=["Convert"])
app.include_router(compress.router, prefix="/api/compress", tags=["Compress"])
app.include_router(audio.router, prefix="/api/audio", tags=["Audio"])
app.include_router(image.router, prefix="/api/image", tags=["Image"])

# Ensure output directory exists
os.makedirs("output", exist_ok=True)

# Serve frontend static files
app.mount("/static", StaticFiles(directory="frontend"), name="static")


@app.get("/")
async def serve_index():
    return FileResponse("frontend/index.html")


