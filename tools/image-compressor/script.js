/* ===========================================
   TOOLHUB AI — IMAGE COMPRESSOR
=========================================== */

/* ---------- Element refs ---------- */

const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const resultsGrid = document.getElementById("resultsGrid");
const emptyState = document.getElementById("emptyState");
const statsCard = document.getElementById("statsCard");

const qualitySlider = document.getElementById("qualitySlider");
const qualityValue = document.getElementById("qualityValue");
const formatSelect = document.getElementById("formatSelect");
const resizeToggle = document.getElementById("resizeToggle");
const maxWidthInput = document.getElementById("maxWidthInput");

const statCount = document.getElementById("statCount");
const statOriginal = document.getElementById("statOriginal");
const statCompressed = document.getElementById("statCompressed");
const statSaved = document.getElementById("statSaved");

const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");

const compressAllBtn = document.getElementById("compressAllBtn");
const downloadZipBtn = document.getElementById("downloadZipBtn");
const removeAllBtn = document.getElementById("removeAllBtn");

/* ---------- State ---------- */

let images = [];          // { id, file, name, originalSize, type, originalUrl, compressed, compressedVersion, status }
let settingsVersion = 0;
let isCompressing = false;

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const EXT_BY_TYPE = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };

function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
}

function escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/* ===========================================
   UPLOAD
=========================================== */

imageInput.addEventListener("change", () => {
    handleFiles(imageInput.files);
    imageInput.value = "";
});

dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
["dragleave", "dragend"].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.remove("dragover")));
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});

document.getElementById("cameraBtn").onclick = () => {
    imageInput.removeAttribute("multiple");
    imageInput.setAttribute("capture", "environment");
    imageInput.click();
};

document.getElementById("galleryBtn").onclick = () => {
    imageInput.removeAttribute("capture");
    imageInput.setAttribute("multiple", "multiple");
    imageInput.click();
};

function handleFiles(fileList) {

    const files = [...fileList];
    if (files.length === 0) return;

    let added = 0;

    for (const file of files) {

        if (!ALLOWED_TYPES.includes(file.type)) {
            showToast(`Unsupported format: ${file.name}`, true);
            continue;
        }
        if (file.size > MAX_FILE_SIZE) {
            showToast(`${file.name} is over 25MB`, true);
            continue;
        }

        images.push({
            id: uid(),
            file,
            name: file.name,
            originalSize: file.size,
            type: file.type,
            originalUrl: URL.createObjectURL(file),
            compressed: null,
            compressedVersion: -1,
            status: "pending"
        });
        added++;
    }

    if (added > 0) {
        showToast(added === 1 ? "Image added" : `${added} images added`);
        renderResults();
        compressAll();
    }
}

/* ===========================================
   SETTINGS
=========================================== */

const scheduleRecompress = debounce(() => compressAll(), 350);

qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = qualitySlider.value + "%";
    settingsVersion++;
    scheduleRecompress();
});

formatSelect.addEventListener("change", () => {
    settingsVersion++;
    scheduleRecompress();
});

resizeToggle.addEventListener("change", () => {
    maxWidthInput.disabled = !resizeToggle.checked;
    settingsVersion++;
    scheduleRecompress();
});

maxWidthInput.addEventListener("change", () => {
    settingsVersion++;
    scheduleRecompress();
});

function currentSettings() {
    return {
        quality: parseInt(qualitySlider.value, 10),
        format: formatSelect.value,
        resize: resizeToggle.checked,
        maxWidth: parseInt(maxWidthInput.value, 10) || 1920
    };
}

/* ===========================================
   COMPRESSION ENGINE
=========================================== */

function compressImage(item, settings) {
    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {

            let w = img.width;
            let h = img.height;

            if (settings.resize && settings.maxWidth && w > settings.maxWidth) {
                const ratio = settings.maxWidth / w;
                w = settings.maxWidth;
                h = Math.round(h * ratio);
            }

            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d");

            const outputType = settings.format === "original" ? item.type : settings.format;

            // JPEG has no transparency — paint white behind the image first,
            // otherwise transparent PNG/WebP areas turn solid black.
            if (outputType === "image/jpeg") {
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, w, h);
            }

            ctx.drawImage(img, 0, 0, w, h);

            const quality = outputType === "image/png" ? undefined : settings.quality / 100;

            canvas.toBlob((blob) => {
                if (!blob) { reject(new Error("Compression failed")); return; }
                resolve({ blob, size: blob.size, type: outputType, width: w, height: h });
            }, outputType, quality);
        };

        img.onerror = () => reject(new Error(`Could not load ${item.name}`));
        img.src = item.originalUrl;
    });
}

async function compressAll() {

    if (images.length === 0) return;
    if (isCompressing) return; // a run is already in-flight; scheduleRecompress will retry after settingsVersion changes again

    const targets = images.filter(img => img.compressedVersion !== settingsVersion);
    if (targets.length === 0) return;

    isCompressing = true;
    const settings = currentSettings();
    showProgress();

    for (let i = 0; i < targets.length; i++) {

        const item = targets[i];
        item.status = "compressing";
        updateCardStatus(item);

        try {
            const result = await compressImage(item, settings);

            if (item.compressed) URL.revokeObjectURL(item.compressed.url);

            // Re-encoding can occasionally produce a bigger file than the
            // source (already-optimized PNGs especially). If the user just
            // wants compression (not an explicit format change) and our
            // result isn't actually smaller, keep the original file instead
            // of shipping something worse.
            if (settings.format === "original" && result.size >= item.originalSize) {
                item.compressed = { blob: item.file, size: item.originalSize, type: item.type, url: item.originalUrl, unchanged: true };
            } else {
                item.compressed = { ...result, url: URL.createObjectURL(result.blob) };
            }

            item.compressedVersion = settingsVersion;
            item.status = "done";
        } catch (err) {
            console.error(err);
            item.status = "error";
        }

        updateProgress(i + 1, targets.length);
        renderCard(item);
    }

    hideProgress();
    renderStats();
    isCompressing = false;

    // settings may have changed again while this run was in flight
    const stillStale = images.some(img => img.compressedVersion !== settingsVersion);
    if (stillStale) compressAll();
}

/* ===========================================
   RENDERING
=========================================== */

function renderResults() {
    resultsGrid.innerHTML = images.map(cardHTML).join("");
    images.forEach(bindCardEvents);
    updateEmptyState();
    renderStats();
}

function cardHTML(item) {
    const previewSrc = item.compressed ? item.compressed.url : item.originalUrl;
    const savings = item.compressed ? Math.round(100 - (item.compressed.size / item.originalSize) * 100) : null;

    let badge = "";
    if (item.compressed) {
        if (item.compressed.unchanged) {
            badge = `<span class="result-badge warn">Already optimized</span>`;
        } else if (savings > 0) {
            badge = `<span class="result-badge">-${savings}%</span>`;
        } else {
            badge = `<span class="result-badge warn">+${Math.abs(savings)}%</span>`;
        }
    }

    return `
    <div class="result-card ${item.status === "compressing" ? "compressing" : ""}" data-id="${item.id}">
        <div class="result-thumb">
            <img src="${previewSrc}" alt="${escapeHtml(item.name)}">
            <div class="thumb-overlay"><i class="fa-solid fa-spinner"></i></div>
            ${badge}
            <button type="button" class="result-remove" data-remove="${item.id}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div class="result-body">
            <div class="result-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="size-compare">
                <span>${formatBytes(item.originalSize)}</span>
                <i class="fa-solid fa-arrow-right to"></i>
                <span class="new-size">${item.compressed ? formatBytes(item.compressed.size) : (item.status === "error" ? "Failed" : "…")}</span>
            </div>
            <button type="button" class="result-download" data-download="${item.id}" ${item.compressed ? "" : "disabled"}>
                <i class="fa-solid fa-download"></i> Download
            </button>
        </div>
    </div>`;
}

function renderCard(item) {
    const el = resultsGrid.querySelector(`.result-card[data-id="${item.id}"]`);
    if (!el) return;
    el.outerHTML = cardHTML(item);
    bindCardEvents(item);
}

function updateCardStatus(item) {
    const el = resultsGrid.querySelector(`.result-card[data-id="${item.id}"]`);
    if (el) el.classList.toggle("compressing", item.status === "compressing");
}

function bindCardEvents(item) {
    const el = resultsGrid.querySelector(`.result-card[data-id="${item.id}"]`);
    if (!el) return;

    const removeBtn = el.querySelector("[data-remove]");
    if (removeBtn) removeBtn.onclick = () => removeImage(item.id);

    const downloadBtn = el.querySelector("[data-download]");
    if (downloadBtn) downloadBtn.onclick = () => downloadSingle(item.id);
}

function updateEmptyState() {
    const has = images.length > 0;
    emptyState.style.display = has ? "none" : "flex";
    resultsGrid.style.display = has ? "grid" : "none";
    statsCard.style.display = has ? "block" : "none";
    downloadZipBtn.disabled = !images.some(i => i.compressed);
    compressAllBtn.disabled = !has;
    removeAllBtn.disabled = !has;
}

function renderStats() {
    const totalOriginal = images.reduce((sum, i) => sum + i.originalSize, 0);
    const totalCompressed = images.reduce((sum, i) => sum + (i.compressed ? i.compressed.size : i.originalSize), 0);
    const saved = totalOriginal > 0 ? Math.max(0, Math.round(100 - (totalCompressed / totalOriginal) * 100)) : 0;

    statCount.textContent = images.length;
    statOriginal.textContent = formatBytes(totalOriginal);
    statCompressed.textContent = formatBytes(totalCompressed);
    statSaved.textContent = saved + "%";

    downloadZipBtn.disabled = !images.some(i => i.compressed);
}

/* ===========================================
   REMOVE
=========================================== */

function removeImage(id) {
    const item = images.find(i => i.id === id);
    if (!item) return;
    URL.revokeObjectURL(item.originalUrl);
    if (item.compressed) URL.revokeObjectURL(item.compressed.url);
    images = images.filter(i => i.id !== id);
    renderResults();
}

removeAllBtn.onclick = () => {
    if (images.length === 0) return;
    if (!confirm("Remove all images? This can't be undone.")) return;
    images.forEach(i => {
        URL.revokeObjectURL(i.originalUrl);
        if (i.compressed) URL.revokeObjectURL(i.compressed.url);
    });
    images = [];
    renderResults();
    showToast("All images removed");
};

compressAllBtn.onclick = () => {
    settingsVersion++; // force a fresh pass over every image
    compressAll();
};

/* ===========================================
   DOWNLOAD
=========================================== */

function outputFileName(item) {
    const base = item.name.replace(/\.[^.]+$/, "");
    const ext = EXT_BY_TYPE[item.compressed.type] || ".jpg";
    return `${base}-compressed${ext}`;
}

function downloadSingle(id) {
    const item = images.find(i => i.id === id);
    if (!item || !item.compressed) {
        showToast("Still compressing — try again in a moment", true);
        return;
    }
    const a = document.createElement("a");
    a.href = item.compressed.url;
    a.download = outputFileName(item);
    document.body.appendChild(a);
    a.click();
    a.remove();
}

downloadZipBtn.onclick = async () => {

    const ready = images.filter(i => i.compressed);
    if (ready.length === 0) {
        showToast("Nothing compressed yet", true);
        return;
    }

    showLoader();

    try {
        const zip = new JSZip();
        const usedNames = new Set();

        ready.forEach(item => {
            let name = outputFileName(item);
            let n = 1;
            while (usedNames.has(name)) {
                name = outputFileName(item).replace(/(\.[^.]+)$/, `-${n}$1`);
                n++;
            }
            usedNames.add(name);
            zip.file(name, item.compressed.blob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "compressed-images.zip";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);
        showToast("ZIP downloaded");
    } catch (err) {
        console.error(err);
        showToast("Couldn't build the ZIP file", true);
    } finally {
        hideLoader();
    }
};

/* ===========================================
   PROGRESS
=========================================== */

function showProgress() {
    progressContainer.style.display = "block";
    progressFill.style.width = "0%";
}

function updateProgress(done, total) {
    progressFill.style.width = Math.round((done / total) * 100) + "%";
}

function hideProgress() {
    setTimeout(() => {
        progressContainer.style.display = "none";
        progressFill.style.width = "0%";
    }, 400);
}

/* ===========================================
   THEME TOGGLE
=========================================== */

const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.querySelector("i").className = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

(function initTheme() {
    let saved = null;
    try { saved = localStorage.getItem("toolhub-theme"); } catch (err) { /* ignore */ }
    applyTheme(saved === "light" ? "light" : "dark");
})();

themeBtn.onclick = () => {
    const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
    const next = current === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("toolhub-theme", next); } catch (err) { /* ignore */ }
};

/* ===========================================
   TOAST / LOADER
=========================================== */

let toastTimer = null;

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function showLoader() { document.getElementById("loadingOverlay").style.display = "flex"; }
function hideLoader() { document.getElementById("loadingOverlay").style.display = "none"; }

/* ===========================================
   CLEANUP
=========================================== */

window.addEventListener("pagehide", () => {
    images.forEach(i => {
        URL.revokeObjectURL(i.originalUrl);
        if (i.compressed) URL.revokeObjectURL(i.compressed.url);
    });
});

/* ===========================================
   STARTUP
=========================================== */

updateEmptyState();