/**
 * Video download module (YouTube, Instagram, TikTok, etc.)
 */

const YoutubeModule = {
    async init() {
        try {
            const res = await fetch("/api/detect-browser");
            const data = await res.json();
            const select = document.getElementById("yt-cookies");

            if (data.default) {
                select.value = data.default;
            }
        } catch {
            // Silently fall back to "None"
        }
    },

    getCookiesBrowser() {
        const val = document.getElementById("yt-cookies").value;
        return val || null;
    },

    async getInfo() {
        const url = document.getElementById("yt-url").value.trim();
        if (!url) return;

        const infoBox = document.getElementById("yt-info");
        const statusBox = document.getElementById("yt-status");

        showStatus(statusBox, "loading", "Fetching video info...");
        hideStatus(infoBox);

        try {
            const res = await API.postJSON("/api/youtube/info", {
                url,
                cookies_browser: this.getCookiesBrowser(),
            });
            const data = await res.json();

            infoBox.classList.remove("hidden");
            infoBox.innerHTML = `
                <div class="flex gap-4 items-start">
                    ${data.thumbnail ? `<img src="${data.thumbnail}" class="w-40 rounded">` : ""}
                    <div>
                        <p class="font-semibold text-white">${data.title}</p>
                        <p class="text-gray-400 text-sm mt-1">Duration: ${formatDuration(data.duration)}</p>
                        <p class="text-gray-400 text-sm">Formats available: ${data.formats.length}</p>
                    </div>
                </div>
            `;
            hideStatus(statusBox);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },

    async downloadVideo() {
        const url = document.getElementById("yt-url").value.trim();
        if (!url) return;

        const statusBox = document.getElementById("yt-status");
        showStatus(statusBox, "loading", "Downloading video... this may take a moment.");

        try {
            const res = await API.postJSON("/api/youtube/download", {
                url,
                format: "best",
                cookies_browser: this.getCookiesBrowser(),
            });
            const blob = await res.blob();
            const filename = getFilenameFromResponse(res) || "video.mp4";
            downloadBlob(blob, filename);
            showStatus(statusBox, "success", `Downloaded: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },

    async downloadAudio() {
        const url = document.getElementById("yt-url").value.trim();
        if (!url) return;

        const statusBox = document.getElementById("yt-status");
        showStatus(statusBox, "loading", "Downloading audio... this may take a moment.");

        try {
            const res = await API.postJSON("/api/youtube/download-audio", {
                url,
                cookies_browser: this.getCookiesBrowser(),
            });
            const blob = await res.blob();
            const filename = getFilenameFromResponse(res) || "audio.mp3";
            downloadBlob(blob, filename);
            showStatus(statusBox, "success", `Downloaded: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },
};

document.addEventListener("DOMContentLoaded", () => YoutubeModule.init());
