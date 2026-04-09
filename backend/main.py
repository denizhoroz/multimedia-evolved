"""FastAPI application for Multimedia Evolved."""

import os
import shutil
import platform
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


@app.get("/api/detect-browser")
async def detect_browser():
    """Detect which browsers are installed and guess the default one."""
    detected = []
    system = platform.system()

    if system == "Windows":
        import winreg
        # Check Windows default browser from registry
        try:
            with winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Software\Microsoft\Windows\Shell\Associations\UrlAssociations\http\UserChoice",
            ) as key:
                prog_id = winreg.QueryValueEx(key, "ProgId")[0].lower()
                # Order matters — check specific browsers before generic ones
                # (e.g. Brave's ProgId can contain "chrome")
                default_map = [
                    ("brave", "brave"),
                    ("msedge", "edge"),
                    ("opera", "opera"),
                    ("firefox", "firefox"),
                    ("chrome", "chrome"),
                ]
                for keyword, name in default_map:
                    if keyword in prog_id:
                        detected.insert(0, name)
                        break
        except OSError:
            pass

    # Check which browsers are available by looking for known paths / executables
    browser_checks = {
        "chrome": ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"],
        "firefox": ["firefox"],
        "edge": ["microsoft-edge", "msedge"],
        "brave": ["brave-browser", "brave"],
        "opera": ["opera"],
    }

    if system == "Windows":
        common_paths = {
            "chrome": os.path.expandvars(r"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            "firefox": os.path.expandvars(r"%ProgramFiles%\Mozilla Firefox\firefox.exe"),
            "edge": os.path.expandvars(r"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            "brave": os.path.expandvars(r"%ProgramFiles%\BraveSoftware\Brave-Browser\Application\brave.exe"),
            "opera": os.path.expandvars(r"%LocalAppData%\Programs\Opera\opera.exe"),
        }
        for name, path in common_paths.items():
            if os.path.isfile(path) and name not in detected:
                detected.append(name)
    else:
        for name, executables in browser_checks.items():
            if name not in detected:
                for exe in executables:
                    if shutil.which(exe):
                        detected.append(name)
                        break

    return {
        "default": detected[0] if detected else None,
        "installed": detected,
    }
