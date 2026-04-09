/**
 * Image tools module.
 */

const ImageModule = {
    currentAction: "resize",

    init() {
        setupDropzone("image-dropzone", "image-file", "image-file-name");

        // Preview image on file select
        const fileInput = document.getElementById("image-file");
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length) {
                this.showPreview(fileInput.files[0]);
            }
        });
    },

    showPreview(file) {
        const preview = document.getElementById("image-preview");
        const container = document.getElementById("image-preview-container");
        const infoText = document.getElementById("image-info-text");

        const url = URL.createObjectURL(file);
        preview.src = url;
        container.classList.remove("hidden");

        const img = new Image();
        img.onload = () => {
            infoText.textContent = `${img.width} x ${img.height} px | ${formatBytes(file.size)}`;
        };
        img.src = url;
    },

    setAction(action) {
        this.currentAction = action;

        // Update toggle buttons
        document.querySelectorAll("[data-image-action]").forEach((btn) => {
            btn.classList.toggle("active", btn.dataset.imageAction === action);
        });

        // Toggle option panels
        document.getElementById("image-resize-opts").classList.toggle("hidden", action !== "resize");
        document.getElementById("image-crop-opts").classList.toggle("hidden", action !== "crop");
        document.getElementById("image-rotate-opts").classList.toggle("hidden", action !== "rotate");
    },

    async process() {
        const fileInput = document.getElementById("image-file");
        if (!fileInput.files.length) return;

        const statusBox = document.getElementById("image-status");
        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        let endpoint;

        if (this.currentAction === "resize") {
            const width = document.getElementById("resize-width").value;
            const height = document.getElementById("resize-height").value;
            if (!width || !height) {
                showStatus(statusBox, "error", "Please enter width and height.");
                return;
            }
            formData.append("width", width);
            formData.append("height", height);
            formData.append("keep_aspect", document.getElementById("resize-aspect").checked);
            endpoint = "/api/image/resize";
        } else if (this.currentAction === "crop") {
            formData.append("left", document.getElementById("crop-left").value);
            formData.append("top", document.getElementById("crop-top").value);
            formData.append("right", document.getElementById("crop-right").value);
            formData.append("bottom", document.getElementById("crop-bottom").value);
            endpoint = "/api/image/crop";
        } else {
            formData.append("angle", document.getElementById("rotate-angle").value);
            endpoint = "/api/image/rotate";
        }

        showStatus(statusBox, "loading", `Processing image (${this.currentAction})...`);

        try {
            const filename = await API.postFileAndDownload(endpoint, formData);
            showStatus(statusBox, "success", `Done: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },
};

document.addEventListener("DOMContentLoaded", () => ImageModule.init());
