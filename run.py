"""Entry point to start the Multimedia Evolved application."""

import uvicorn
import webbrowser
import threading


def open_browser():
    webbrowser.open("http://localhost:8000")


if __name__ == "__main__":
    threading.Timer(1.5, open_browser).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
