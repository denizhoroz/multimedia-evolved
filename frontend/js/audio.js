/**
 * Audio extraction module.
 */

const AudioModule = {
    init() {
        setupDropzone("audio-dropzone", "audio-file", "audio-file-name");
    },

    async extract() {
        const fileInput = document.getElementById("audio-file");
        if (!fileInput.files.length) return;

        const format = document.getElementById("audio-format").value;
        const bitrate = document.getElementById("audio-bitrate").value;
        const statusBox = document.getElementById("audio-status");

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);
        formData.append("format", format);
        formData.append("bitrate", bitrate);

        showStatus(statusBox, "loading", "Extracting audio...");

        try {
            const filename = await API.postFileAndDownload("/api/audio/extract", formData);
            showStatus(statusBox, "success", `Extracted: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },
};

document.addEventListener("DOMContentLoaded", () => AudioModule.init());
