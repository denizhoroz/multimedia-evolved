/**
 * Unified convert module — handles video/audio format conversion
 * and video-to-audio extraction in a single tab.
 */

const ConvertModule = {
    detectedType: null, // "video" or "audio"

    VIDEO_EXTS: ["mp4", "mkv", "avi", "mov", "webm", "flv", "wmv", "m4v", "mpeg", "mpg", "3gp"],
    AUDIO_EXTS: ["mp3", "aac", "wav", "flac", "ogg", "wma", "m4a", "opus"],

    VIDEO_TARGETS: ["mp4", "mkv", "avi", "mov", "webm", "flv"],
    AUDIO_TARGETS: ["mp3", "aac", "wav", "flac", "ogg", "wma"],

    sourceFileSize: 0,

    // Approximate size ratios relative to source file size for video-to-video conversions.
    // These are rough estimates based on typical codec efficiency differences.
    VIDEO_SIZE_RATIOS: {
        mp4: 1.0, mkv: 1.0, avi: 1.3, mov: 1.05, webm: 0.85, flv: 1.1,
    },

    // Bitrate in kbps -> bytes per second, used to estimate audio output size.
    // For audio-to-audio, we estimate from bitrate * duration.
    // Duration is approximated from source size and a typical bitrate guess.
    AUDIO_BITRATE_KBPS: {
        "64k": 64, "96k": 96, "128k": 128, "192k": 192, "256k": 256, "320k": 320,
    },

    // Average bitrate assumptions (kbps) for source audio formats to estimate duration.
    AUDIO_AVG_BITRATE: {
        mp3: 192, aac: 160, ogg: 160, wma: 192, m4a: 160, opus: 128,
        wav: 1411, flac: 900,
    },

    init() {
        setupDropzone("convert-dropzone", "convert-file", "convert-file-name");

        const fileInput = document.getElementById("convert-file");
        fileInput.addEventListener("change", () => {
            if (fileInput.files.length) {
                this.onFileSelected(fileInput.files[0]);
            }
        });

        // Update options and estimate on format/bitrate change
        document.getElementById("convert-format").addEventListener("change", () => {
            this.updateBitrateVisibility();
            this.updateSizeEstimate();
        });
        document.getElementById("convert-bitrate").addEventListener("change", () => {
            this.updateSizeEstimate();
        });
    },

    onFileSelected(file) {
        const ext = file.name.split(".").pop().toLowerCase();
        const isVideo = this.VIDEO_EXTS.includes(ext);
        const isAudio = this.AUDIO_EXTS.includes(ext);

        if (!isVideo && !isAudio) {
            this.detectedType = null;
            document.getElementById("convert-detected-type").textContent = "Unsupported file type";
            document.getElementById("convert-source-info").classList.add("hidden");
            document.getElementById("convert-format").disabled = true;
            document.getElementById("convert-btn").disabled = true;
            return;
        }

        this.detectedType = isVideo ? "video" : "audio";
        this.sourceFileSize = file.size;
        this.sourceExt = ext;

        // Update source info box
        const sourceInfo = document.getElementById("convert-source-info");
        sourceInfo.classList.remove("hidden");
        document.getElementById("convert-source-icon").textContent = isVideo ? "\u{1F3AC}" : "\u{1F3B5}";
        document.getElementById("convert-source-name").textContent = file.name;
        document.getElementById("convert-source-details").textContent =
            `${this.detectedType.charAt(0).toUpperCase() + this.detectedType.slice(1)} \u2022 ${ext.toUpperCase()} \u2022 ${formatBytes(file.size)}`;

        // Update detected type display
        document.getElementById("convert-detected-type").textContent =
            `${this.detectedType.charAt(0).toUpperCase() + this.detectedType.slice(1)} (.${ext})`;

        // Populate target formats — video files can convert to both video and audio formats
        const formatSelect = document.getElementById("convert-format");
        formatSelect.disabled = false;
        formatSelect.innerHTML = "";

        if (isVideo) {
            const videoGroup = document.createElement("optgroup");
            videoGroup.label = "Video Formats";
            this.VIDEO_TARGETS.forEach((f) => {
                const opt = document.createElement("option");
                opt.value = f;
                opt.textContent = f.toUpperCase();
                videoGroup.appendChild(opt);
            });
            formatSelect.appendChild(videoGroup);

            const audioGroup = document.createElement("optgroup");
            audioGroup.label = "Extract Audio";
            this.AUDIO_TARGETS.forEach((f) => {
                const opt = document.createElement("option");
                opt.value = f;
                opt.textContent = f.toUpperCase();
                opt.dataset.extractAudio = "true";
                audioGroup.appendChild(opt);
            });
            formatSelect.appendChild(audioGroup);
        } else {
            this.AUDIO_TARGETS.forEach((f) => {
                const opt = document.createElement("option");
                opt.value = f;
                opt.textContent = f.toUpperCase();
                formatSelect.appendChild(opt);
            });
        }

        // Enable convert button
        document.getElementById("convert-btn").disabled = false;

        this.updateBitrateVisibility();
        this.updateSizeEstimate();
    },

    updateBitrateVisibility() {
        const formatSelect = document.getElementById("convert-format");
        const selected = formatSelect.options[formatSelect.selectedIndex];
        const targetFormat = formatSelect.value;
        const isAudioTarget = this.AUDIO_EXTS.includes(targetFormat);

        document.getElementById("convert-bitrate-group").classList.toggle("hidden", !isAudioTarget);
    },

    updateSizeEstimate() {
        const estimateEl = document.getElementById("convert-size-estimate");
        const valueEl = document.getElementById("convert-size-value");
        const formatSelect = document.getElementById("convert-format");

        if (!this.sourceFileSize || !formatSelect.value) {
            estimateEl.classList.add("hidden");
            return;
        }

        const targetFormat = formatSelect.value;
        const selected = formatSelect.options[formatSelect.selectedIndex];
        const isExtractAudio = selected?.dataset?.extractAudio === "true";
        const isAudioTarget = this.AUDIO_EXTS.includes(targetFormat);
        let estimatedBytes;

        if (this.detectedType === "video" && !isExtractAudio) {
            // Video -> Video: use format size ratio relative to mp4 baseline
            const sourceRatio = this.VIDEO_SIZE_RATIOS[this.sourceExt] || 1.0;
            const targetRatio = this.VIDEO_SIZE_RATIOS[targetFormat] || 1.0;
            estimatedBytes = this.sourceFileSize * (targetRatio / sourceRatio);
        } else if (this.detectedType === "video" && isExtractAudio) {
            // Video -> Audio extraction: audio is typically ~5-10% of video file size.
            // Refine using selected bitrate and an estimated duration from video size.
            // Assume average video bitrate of ~5 Mbps to estimate duration.
            const videoBitrateBytes = 5_000_000 / 8; // 5 Mbps in bytes/sec
            const estDuration = this.sourceFileSize / videoBitrateBytes;
            const bitrateKey = document.getElementById("convert-bitrate").value;
            const audioBitrateKbps = this.AUDIO_BITRATE_KBPS[bitrateKey] || 192;
            estimatedBytes = (audioBitrateKbps * 1000 / 8) * estDuration;
        } else {
            // Audio -> Audio: estimate duration from source, then apply target bitrate.
            const srcAvgBitrate = this.AUDIO_AVG_BITRATE[this.sourceExt] || 192;
            const estDuration = this.sourceFileSize / (srcAvgBitrate * 1000 / 8);

            if (isAudioTarget && targetFormat === "wav") {
                // WAV is uncompressed PCM ~1411 kbps
                estimatedBytes = (1411 * 1000 / 8) * estDuration;
            } else if (isAudioTarget && targetFormat === "flac") {
                // FLAC is lossless but compressed, roughly 60% of WAV
                estimatedBytes = (1411 * 1000 / 8) * estDuration * 0.6;
            } else {
                const bitrateKey = document.getElementById("convert-bitrate").value;
                const targetBitrateKbps = this.AUDIO_BITRATE_KBPS[bitrateKey] || 192;
                estimatedBytes = (targetBitrateKbps * 1000 / 8) * estDuration;
            }
        }

        // Show range: 80%-120% of estimate to indicate it's approximate
        const low = estimatedBytes * 0.8;
        const high = estimatedBytes * 1.2;
        valueEl.textContent = `~${formatBytes(low)} - ${formatBytes(high)}`;
        estimateEl.classList.remove("hidden");
    },

    async convert() {
        const fileInput = document.getElementById("convert-file");
        if (!fileInput.files.length || !this.detectedType) return;

        const statusBox = document.getElementById("convert-status");
        const formatSelect = document.getElementById("convert-format");
        const targetFormat = formatSelect.value;
        const selected = formatSelect.options[formatSelect.selectedIndex];
        const isExtractAudio = selected?.dataset?.extractAudio === "true";
        const isAudioTarget = this.AUDIO_EXTS.includes(targetFormat);

        const formData = new FormData();
        formData.append("file", fileInput.files[0]);

        let endpoint;
        let actionLabel;

        if (this.detectedType === "video" && isExtractAudio) {
            // Video -> Audio extraction
            endpoint = "/api/audio/extract";
            formData.append("format", targetFormat);
            formData.append("bitrate", document.getElementById("convert-bitrate").value);
            actionLabel = `Extracting audio as ${targetFormat.toUpperCase()}`;
        } else if (this.detectedType === "video") {
            // Video -> Video conversion
            endpoint = "/api/convert/video";
            formData.append("target_format", targetFormat);
            actionLabel = `Converting video to ${targetFormat.toUpperCase()}`;
        } else {
            // Audio -> Audio conversion
            endpoint = "/api/convert/audio";
            formData.append("target_format", targetFormat);
            actionLabel = `Converting audio to ${targetFormat.toUpperCase()}`;
        }

        showProgress(statusBox, actionLabel);

        try {
            const filename = await API.postFileWithProgress(endpoint, formData, (percent, phase) => {
                updateProgress(statusBox, percent, phase);
            });
            showStatus(statusBox, "success", `Done: ${filename}`);
        } catch (err) {
            showStatus(statusBox, "error", err.message);
        }
    },
};

document.addEventListener("DOMContentLoaded", () => ConvertModule.init());
