/* ===========================================
   TOOLHUB AI — MERGE PDF
=========================================== */

const pdfInput = document.getElementById("pdfInput");
const dropZone = document.getElementById("dropZone");
const fileList = document.getElementById("fileList");
const emptyState = document.getElementById("emptyState");
const statsCard = document.getElementById("statsCard");

const statCount = document.getElementById("statCount");
const statPages = document.getElementById("statPages");
const statSize = document.getElementById("statSize");

const mergeBtn = document.getElementById("mergeBtn");
const removeAllBtn = document.getElementById("removeAllBtn");

const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

let files = []; // { id, file, name, size, pageCount, status: 'loading'|'ready'|'error', error }
const MAX_FILE_SIZE = 60 * 1024 * 1024;

function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
}

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

/* ===========================================
   UPLOAD
=========================================== */

pdfInput.addEventListener("change", () => {
    handleFiles(pdfInput.files);
    pdfInput.value = "";
});

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

        const item = { id: uid(), file, name: file.name, size: file.size, pageCount: null, status: "loading", error: null };
        files.push(item);
        added++;
        loadPageCount(item);
    });

    if (added > 0) {
        showToast(added === 1 ? "PDF added" : `${added} PDFs added`);
        renderList();
    }
}

async function loadPageCount(item) {
    try {
        const bytes = await item.file.arrayBuffer();
        const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: false });
        item.pageCount = doc.getPageCount();
        item.status = "ready";
    } catch (err) {
        console.error(err);
        item.status = "error";
        item.error = /encrypt/i.test(String(err)) ? "Password protected" : "Couldn't read this PDF";
    }
    renderRow(item);
    renderStats();
}

/* ===========================================
   RENDERING
=========================================== */

function renderList() {
    fileList.innerHTML = files.map((item, i) => rowHTML(item, i)).join("");
    files.forEach(bindRowEvents);
    updateEmptyState();
    renderStats();
}

function rowHTML(item, index) {
    let sub;
    if (item.status === "loading") {
        sub = `<span class="file-sub">Reading…</span>`;
    } else if (item.status === "error") {
        sub = `<span class="file-sub error"><i class="fa-solid fa-triangle-exclamation"></i> ${item.error}</span>`;
    } else {
        sub = `<span class="file-sub">${item.pageCount} page${item.pageCount === 1 ? "" : "s"} · ${formatBytes(item.size)}</span>`;
    }

    return `
    <div class="file-row" data-id="${item.id}">
        <span class="file-drag-handle" title="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span>
        <span class="file-index">${index + 1}</span>
        <div class="file-icon"><i class="fa-solid fa-file-pdf"></i></div>
        <div class="file-meta">
            <div class="file-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            ${sub}
        </div>
        <button type="button" class="file-remove" data-remove="${item.id}" aria-label="Remove"><i class="fa-solid fa-xmark"></i></button>
    </div>`;
}

function renderRow(item) {
    const el = fileList.querySelector(`.file-row[data-id="${item.id}"]`);
    if (!el) return;
    const index = files.findIndex(f => f.id === item.id);
    el.outerHTML = rowHTML(item, index);
    bindRowEvents(item);
}

function bindRowEvents(item) {
    const el = fileList.querySelector(`.file-row[data-id="${item.id}"]`);
    if (!el) return;
    const btn = el.querySelector("[data-remove]");
    if (btn) btn.onclick = () => removeFile(item.id);
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function updateEmptyState() {
    const has = files.length > 0;
    emptyState.style.display = has ? "none" : "flex";
    fileList.style.display = has ? "flex" : "none";
    statsCard.style.display = has ? "block" : "none";
}

function renderStats() {
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalPages = files.reduce((sum, f) => sum + (f.pageCount || 0), 0);
    const hasError = files.some(f => f.status === "error");
    const stillLoading = files.some(f => f.status === "loading");

    statCount.textContent = files.length;
    statPages.textContent = totalPages;
    statSize.textContent = formatBytes(totalSize);

    mergeBtn.disabled = files.length < 2 || hasError || stillLoading;
    removeAllBtn.disabled = files.length === 0;
}

/* ===========================================
   REMOVE
=========================================== */

function removeFile(id) {
    files = files.filter(f => f.id !== id);
    renderList();
}

removeAllBtn.onclick = () => {
    if (files.length === 0) return;
    if (!confirm("Remove all PDFs? This can't be undone.")) return;
    files = [];
    renderList();
    showToast("All files removed");
};

/* ===========================================
   REORDER
=========================================== */

Sortable.create(fileList, {
    animation: 200,
    handle: ".file-drag-handle",
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const [moved] = files.splice(evt.oldIndex, 1);
        files.splice(evt.newIndex, 0, moved);
        renderList();
    }
});

/* ===========================================
   MERGE
=========================================== */

mergeBtn.onclick = async () => {

    const ready = files.filter(f => f.status === "ready");
    if (ready.length < 2) {
        showToast("Add at least 2 valid PDFs to merge", true);
        return;
    }

    showLoader();
    showProgress();

    try {
        const mergedDoc = await PDFLib.PDFDocument.create();

        for (let i = 0; i < ready.length; i++) {
            const item = ready[i];
            const bytes = await item.file.arrayBuffer();
            const srcDoc = await PDFLib.PDFDocument.load(bytes);
            const copiedPages = await mergedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
            copiedPages.forEach(page => mergedDoc.addPage(page));
            updateProgress(i + 1, ready.length);
        }

        const mergedBytes = await mergedDoc.save();
        const blob = new Blob([mergedBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "merged.pdf";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 4000);

        showToast("PDFs merged successfully");
    } catch (err) {
        console.error(err);
        showToast("Something went wrong while merging", true);
    } finally {
        hideProgress();
        hideLoader();
    }
};

/* ===========================================
   PROGRESS
=========================================== */

function showProgress() {
    progressContainer.style.display = "block";
    progressFill.style.width = "0%";
    progressLabel.textContent = "Merging…";
}

function updateProgress(done, total) {
    const pct = Math.round((done / total) * 100);
    progressFill.style.width = pct + "%";
    progressLabel.textContent = `Merging… ${done} of ${total} files`;
}

function hideProgress() {
    setTimeout(() => {
        progressContainer.style.display = "none";
        progressFill.style.width = "0%";
    }, 500);
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