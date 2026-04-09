/**
 * Compression module.
 */

const CompressModule = {
    currentType: "video",

    init() {
        setupDropzone("compress-dropzone", "compress-file", "compress-file-name");

        // Image quality slider live update
        const slider = document.getElementById("compress-img-quality");
        const valDisplay = document.getElementById("compress-img-quality-val");
        slider.addEventListener("input", () => {
            valDisplay.textContent = slider.value;
        });
    },

    setType(type) {
        this.currentType = type;

        // Update toggle buttons
        document.querySelectorAll("[data-compress-type]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.compressType === type);
        });

        // Update file input accept
        const fileInput = document.getElementById("compress-file");
        const accepts = { video: "video/*", image: "image/*", audio: "audio/*" };
        fileInput.accept = accepts[type];

        // Reset file
        fileInput.value = "";
        document.getElementById("compress-file-name").textContent = "";
        document.getElementById("compress-dropzone").classList.remove("has-file");

        // Toggle option panels
        document.getElementById("compress-video-opts").classList.toggle("hidden", type !== "video");
        document.getElementById("compress-image-opts").classList.toggle("hidden", type !== "image");
        document.getElementById("compress-audio-opts").classList.toggle("hidden", type !== "audio");
    },

    async compress() {
        const fileInput = document.getElementById("compress-file");
        if (!fileInput.files.length) return;

        const statusBox = document.getElementById("compress-status");
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        let endpoint;
        if (this.currentType === "video") {
            endpoint = "/api/compress/video";
            formData.append("quality", document.getElementById("compress-quality").value);
        } else if (this.currentType === "image") {
            endpoint = "/api/compress/image";
            formData.append("quality", document.getElementById("compress-img-quality").value);
        } else {
            endpoint = "/api/compress/audio";
            formData.append("bitrate", document.getElementById("compress-bitrate").value);
        }

        showStatus(statusBox, "loading", `Compressing ${this.currentType}...`);

        try {
            const filename = await API.postFileAndDownload(endpoint, formData);
            showStatus(statusBox, "success", `Compressed: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },
};

document.addEventListener("DOMContentLoaded", () => CompressModule.init());
