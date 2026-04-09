/**
 * Shared utilities for Multimedia Evolved frontend.
 */

const API = {
    /**
     * POST JSON to an API endpoint.
     */
    async postJSON(url, data) {
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Request failed" }));
            throw new Error(err.detail || "Request failed");
        }
        return res;
    },

    /**
     * POST FormData (file upload) and trigger download of the response.
     */
    async postFileAndDownload(url, formData) {
        const res = await fetch(url, {
            method: "POST",
            body: formData,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Request failed" }));
            throw new Error(err.detail || "Request failed");
        }

        const blob = await res.blob();
        const filename = getFilenameFromResponse(res) || "download";
        downloadBlob(blob, filename);
        return filename;
    },

    /**
     * POST FormData with upload progress tracking via XHR.
     * onProgress(percent) is called with 0-100 during upload,
     * then switches to indeterminate during server processing.
     * Returns a promise that resolves with the downloaded filename.
     */
    postFileWithProgress(url, formData, onProgress) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", url);
            xhr.responseType = "blob";

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const percent = Math.round((e.loaded / e.total) * 100);
                    onProgress(percent, "uploading");
                }
            });

            xhr.upload.addEventListener("load", () => {
                onProgress(100, "processing");
            });

            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const disposition = xhr.getResponseHeader("Content-Disposition");
                    let filename = "download";
                    if (disposition) {
                        const match = disposition.match(/filename="?(.+?)"?$/);
                        if (match) filename = match[1];
                    }
                    downloadBlob(xhr.response, filename);
                    onProgress(100, "done");
                    resolve(filename);
                } else {
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const err = JSON.parse(reader.result);
                            reject(new Error(err.detail || "Request failed"));
                        } catch {
                            reject(new Error("Request failed"));
                        }
                    };
                    reader.onerror = () => reject(new Error("Request failed"));
                    reader.readAsText(xhr.response);
                }
            });

            xhr.addEventListener("error", () => reject(new Error("Network error")));
            xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

            xhr.send(formData);
        });
    },
};

/**
 * Extract filename from Content-Disposition header.
 */
function getFilenameFromResponse(res) {
    const header = res.headers.get("Content-Disposition");
    if (!header) return null;
    const match = header.match(/filename="?(.+?)"?$/);
    return match ? match[1] : null;
}

/**
 * Trigger a browser download for a Blob.
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Show a status message in a status box element.
 */
function showStatus(el, type, message) {
    el.className = `status-box ${type}`;
    el.classList.remove("hidden");

    if (type === "loading") {
        el.innerHTML = `<span class="spinner"></span>${message}`;
    } else {
        el.textContent = message;
    }
}

/**
 * Hide a status box.
 */
function hideStatus(el) {
    el.classList.add("hidden");
}

/**
 * Show a progress bar inside a status box element.
 */
function showProgress(el, label) {
    el.className = "status-box loading";
    el.classList.remove("hidden");
    el.innerHTML = `
        <div class="progress-container">
            <div class="progress-label">
                <span class="progress-text">${label}</span>
                <span class="progress-percent">0%</span>
            </div>
            <div class="progress-bar-wrapper">
                <div class="progress-bar-fill" style="width: 0%"></div>
            </div>
        </div>
    `;
}

/**
 * Update the progress bar inside a status box.
 * phase: "uploading" | "processing" | "done"
 */
function updateProgress(el, percent, phase) {
    const fill = el.querySelector(".progress-bar-fill");
    const percentText = el.querySelector(".progress-percent");
    const labelText = el.querySelector(".progress-text");
    if (!fill) return;

    if (phase === "processing") {
        fill.classList.add("indeterminate");
        percentText.textContent = "";
        labelText.textContent = "Processing...";
    } else {
        fill.classList.remove("indeterminate");
        fill.style.width = `${percent}%`;
        percentText.textContent = `${percent}%`;
    }
}

/**
 * Set up drag-and-drop for a dropzone element.
 */
function setupDropzone(dropzoneId, fileInputId, fileNameId) {
    const dropzone = document.getElementById(dropzoneId);
    const fileInput = document.getElementById(fileInputId);
    const fileName = document.getElementById(fileNameId);

    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            fileInput.dispatchEvent(new Event("change"));
        }
    });

    fileInput.addEventListener("change", () => {
        if (fileInput.files.length) {
            fileName.textContent = fileInput.files[0].name;
            dropzone.classList.add("has-file");
        }
    });
}

/**
 * Format bytes to a human-readable string.
 */
function formatBytes(bytes) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

/**
 * Format seconds to mm:ss.
 */
function formatDuration(seconds) {
    if (!seconds) return "Unknown";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}
