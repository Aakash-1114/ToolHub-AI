/* ===========================================
   TOOLHUB AI — COMPRESS PDF
   Pipeline: pdf.js renders each page to a canvas,
   the canvas is re-encoded as a JPEG at the chosen
   quality, and jsPDF reassembles the pages into a
   new, much smaller PDF (same page dimensions).
=========================================== */

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

/* ---------- Element refs ---------- */

const pdfInput = document.getElementById("pdfInput");
const dropZone = document.getElementById("dropZone");
const resultsList = document.getElementById("resultsList");
const emptyState = document.getElementById("emptyState");
const statsCard = document.getElementById("statsCard");

const qualitySlider = document.getElementById("qualitySlider");
const qualityValue = document.getElementById("qualityValue");
const resolutionSelect = document.getElementById("resolutionSelect");

const statCount = document.getElementById("statCount");
const statOriginal = document.getElementById("statOriginal");
const statCompressed = document.getElementById("statCompressed");
const statSaved = document.getElementById("statSaved");

const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

const compressAllBtn = document.getElementById("compressAllBtn");
const downloadZipBtn = document.getElementById("downloadZipBtn");
const removeAllBtn = document.getElementById("removeAllBtn");

/* ---------- State ---------- */

let files = [];           // { id, file, name, originalSize, pageCount, compressed, compressedVersion, status, error }
let settingsVersion = 0;
let isCompressing = false;

const MAX_FILE_SIZE = 60 * 1024 * 1024;

function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/* ===========================================
   UPLOAD
=========================================== */

pdfInput.addEventListener("change", () => { handleFiles(pdfInput.files); pdfInput.value = ""; });
dropZone.addEventListener("dragover", (e) => { e.preventDefault(); dropZone.classList.add("dragover"); });
["dragleave", "dragend"].forEach(evt => dropZone.addEventListener(evt, () => dropZone.classList.remove("dragover")));
dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
});

function handleFiles(fileListRaw) {
    const incoming = [...fileListRaw];
    if (incoming.length === 0) return;

    let added = 0;

    incoming.forEach(file => {
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            showToast(`Skipped ${file.name} — not a PDF`, true);
            return;
        }
        if (file.size > MAX_FILE_SIZE) {
            showToast(`${file.name} is over 60MB`, true);
            return;
        }

        files.push({
            id: uid(), file, name: file.name, originalSize: file.size, pageCount: null,
            compressed: null, compressedVersion: -1, status: "pending", error: null
        });
        added++;
    });

    if (added > 0) {
        showToast(added === 1 ? "PDF added" : `${added} PDFs added`);
        renderResults();
        compressAll();
    }
}

/* ===========================================
   SETTINGS
=========================================== */

function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

const scheduleRecompress = debounce(() => compressAll(), 400);

qualitySlider.addEventListener("input", () => {
    qualityValue.textContent = qualitySlider.value + "%";
    settingsVersion++;
    scheduleRecompress();
});

resolutionSelect.addEventListener("change", () => {
    settingsVersion++;
    scheduleRecompress();
});

function currentSettings() {
    return {
        quality: parseInt(qualitySlider.value, 10) / 100,
        scale: parseFloat(resolutionSelect.value)
    };
}

/* ===========================================
   COMPRESSION ENGINE
=========================================== */

async function compressPDF(item, settings, onPageProgress) {

    const bytes = await item.file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
    const numPages = pdf.numPages;

    let jspdfDoc = null;

    for (let i = 1; i <= numPages; i++) {

        const page = await pdf.getPage(i);
        const basePoints = page.getViewport({ scale: 1 });   // page size in PDF points
        const renderViewport = page.getViewport({ scale: settings.scale });

        const canvas = document.createElement("canvas");
        canvas.width = Math.ceil(renderViewport.width);
        canvas.height = Math.ceil(renderViewport.height);
        const ctx = canvas.getContext("2d");

        // white background — PDF pages are transparent by default and
        // JPEG has no alpha channel, which would otherwise turn black
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        const dataUrl = canvas.toDataURL("image/jpeg", settings.quality);

        const pageFormat = [basePoints.width, basePoints.height];

        if (!jspdfDoc) {
            const { jsPDF } = window.jspdf;
            jspdfDoc = new jsPDF({ unit: "pt", format: pageFormat, orientation: basePoints.width > basePoints.height ? "landscape" : "portrait" });
        } else {
            jspdfDoc.addPage(pageFormat, basePoints.width > basePoints.height ? "landscape" : "portrait");
        }

        jspdfDoc.addImage(dataUrl, "JPEG", 0, 0, basePoints.width, basePoints.height);

        if (onPageProgress) onPageProgress(i, numPages);

        // free the canvas memory before moving to the next page
        canvas.width = 0;
        canvas.height = 0;
    }

    const blob = jspdfDoc.output("blob");
    return { blob, size: blob.size, pageCount: numPages };
}

async function compressAll() {

    if (files.length === 0) return;
    if (isCompressing) return;

    const targets = files.filter(f => f.compressedVersion !== settingsVersion);
    if (targets.length === 0) return;

    isCompressing = true;
    const settings = currentSettings();
    showProgress();

    for (let i = 0; i < targets.length; i++) {

        const item = targets[i];
        item.status = "compressing";
        updateRowStatus(item);

        try {
            const result = await compressPDF(item, settings, (page, total) => {
                progressLabel.textContent = `Compressing ${item.name} — page ${page} of ${total}`;
                const overall = ((i + page / total) / targets.length) * 100;
                progressFill.style.width = overall + "%";
            });

            item.compressed = result;
            item.pageCount = result.pageCount;
            item.compressedVersion = settingsVersion;
            item.status = "done";
        } catch (err) {
            console.error(err);
            item.status = "error";
            item.error = "Couldn't process this PDF";
        }

        renderRow(item);
    }

    hideProgress();
    renderStats();
    isCompressing = false;

    const stillStale = files.some(f => f.compressedVersion !== settingsVersion);
    if (stillStale) compressAll();
}

/* ===========================================
   RENDERING
=========================================== */

function renderResults() {
    resultsList.innerHTML = files.map(rowHTML).join("");
    files.forEach(bindRowEvents);
    updateEmptyState();
    renderStats();
}

function rowHTML(item) {
    const isBusy = item.status === "pending" || item.status === "compressing";
    let sizeCompare, badge;

    if (item.status === "error") {
        sizeCompare = `<span class="result-sub" style="color:var(--danger)"><i class="fa-solid fa-triangle-exclamation"></i> ${item.error}</span>`;
        badge = "";
    } else if (item.compressed) {
        const savings = Math.round(100 - (item.compressed.size / item.originalSize) * 100);
        sizeCompare = `
            <div class="result-size-compare">
                <span>${formatBytes(item.originalSize)}</span>
                <i class="fa-solid fa-arrow-right to"></i>
                <span class="new-size">${formatBytes(item.compressed.size)}</span>
            </div>`;
        badge = savings > 0
            ? `<span class="result-badge">-${savings}%</span>`
            : `<span class="result-badge warn">+${Math.abs(savings)}%</span>`;
    } else {
        sizeCompare = `<div class="result-size-compare"><span>${formatBytes(item.originalSize)}</span><i class="fa-solid fa-arrow-right to"></i><span>…</span></div>`;
        badge = "";
    }

    return `
    <div class="result-row ${isBusy ? "compressing" : ""}" data-id="${item.id}">
        <div class="result-icon">
            <i class="fa-solid fa-file-pdf"></i>
            <span class="spin-icon"><i class="fa-solid fa-spinner"></i></span>
        </div>
        <div class="result-meta">
            <div class="result-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="result-sub">${item.pageCount ? item.pageCount + " pages" : "Reading…"}</div>
        </div>
        ${sizeCompare}
        ${badge}
        <div class="result-actions">
            <button type="button" class="result-download" data-download="${item.id}" ${item.compressed ? "" : "disabled"}>
                <i class="fa-solid fa-download"></i> Download
            </button>
            <button type="button" class="result-remove" data-remove="${item.id}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
    </div>`;
}

function renderRow(item) {
    const el = resultsList.querySelector(`.result-row[data-id="${item.id}"]`);
    if (!el) return;
    el.outerHTML = rowHTML(item);
    bindRowEvents(item);
}

function updateRowStatus(item) {
    const el = resultsList.querySelector(`.result-row[data-id="${item.id}"]`);
    if (el) el.classList.toggle("compressing", item.status === "compressing");
}

function bindRowEvents(item) {
    const el = resultsList.querySelector(`.result-row[data-id="${item.id}"]`);
    if (!el) return;
    const removeBtn = el.querySelector("[data-remove]");
    if (removeBtn) removeBtn.onclick = () => removeFile(item.id);
    const downloadBtn = el.querySelector("[data-download]");
    if (downloadBtn) downloadBtn.onclick = () => downloadSingle(item.id);
}

function updateEmptyState() {
    const has = files.length > 0;
    emptyState.style.display = has ? "none" : "flex";
    resultsList.style.display = has ? "flex" : "none";
    statsCard.style.display = has ? "block" : "none";
    compressAllBtn.disabled = !has;
    removeAllBtn.disabled = !has;
    downloadZipBtn.disabled = !files.some(f => f.compressed);
}

function renderStats() {
    const totalOriginal = files.reduce((sum, f) => sum + f.originalSize, 0);
    const totalCompressed = files.reduce((sum, f) => sum + (f.compressed ? f.compressed.size : f.originalSize), 0);
    const saved = totalOriginal > 0 ? Math.max(0, Math.round(100 - (totalCompressed / totalOriginal) * 100)) : 0;

    statCount.textContent = files.length;
    statOriginal.textContent = formatBytes(totalOriginal);
    statCompressed.textContent = formatBytes(totalCompressed);
    statSaved.textContent = saved + "%";

    downloadZipBtn.disabled = !files.some(f => f.compressed);
}

/* ===========================================
   REMOVE
=========================================== */

function removeFile(id) {
    files = files.filter(f => f.id !== id);
    renderResults();
}

removeAllBtn.onclick = () => {
    if (files.length === 0) return;
    if (!confirm("Remove all PDFs? This can't be undone.")) return;
    files = [];
    renderResults();
    showToast("All files removed");
};

compressAllBtn.onclick = () => {
    settingsVersion++;
    compressAll();
};

/* ===========================================
   DOWNLOAD
=========================================== */

function outputFileName(item) {
    return item.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
}

function downloadSingle(id) {
    const item = files.find(f => f.id === id);
    if (!item || !item.compressed) {
        showToast("Still compressing — try again in a moment", true);
        return;
    }
    const url = URL.createObjectURL(item.compressed.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputFileName(item);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
}

downloadZipBtn.onclick = async () => {
    const ready = files.filter(f => f.compressed);
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
                name = outputFileName(item).replace(/(\.pdf)$/i, `-${n}$1`);
                n++;
            }
            usedNames.add(name);
            zip.file(name, item.compressed.blob);
        });

        const content = await zip.generateAsync({ type: "blob" });
        const url = URL.createObjectURL(content);
        const a = document.createElement("a");
        a.href = url;
        a.download = "compressed-pdfs.zip";
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
   STARTUP
=========================================== */

updateEmptyState();