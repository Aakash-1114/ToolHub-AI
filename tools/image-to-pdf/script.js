/* ===========================================
   TOOLHUB AI — IMAGE TO PDF PRO
   Clean rebuild: single source of truth state,
   no dead code, no undefined function calls.
=========================================== */

/* ---------- Element refs ---------- */

const imageInput = document.getElementById("imageInput");
const dropZone = document.getElementById("dropZone");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("imageCount");
const sizeEstimate = document.getElementById("sizeEstimate");
const mainPreview = document.getElementById("mainPreview");
const emptyPreview = document.getElementById("emptyPreview");
const previewArea = document.getElementById("previewArea");
const previewIndexLabel = document.getElementById("previewIndex");

const progressContainer = document.getElementById("progressContainer");
const progressFill = document.getElementById("progressFill");
const progressPercent = document.getElementById("progressPercent");

const modal = document.getElementById("imagePreviewModal");
const modalImage = document.getElementById("previewImage");
const previewCounter = document.getElementById("previewCounter");

const zoomValueEl = document.getElementById("zoomValue");

const convertBtn = document.getElementById("convertBtn");
const removeAllBtn = document.getElementById("removeAllBtn");

/* ---------- State ---------- */

let images = [];        // { id, src, file, name, size, type, rotation }
let selectedId = null;  // id of the image currently in the main preview
let zoom = 1;
let lastDeleted = null; // { item, index } for undo
let toastTimer = null;

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function uid() {
    return (crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2));
}

function getIndexById(id) {
    return images.findIndex(img => img.id === id);
}

function getSelected() {
    return images.find(img => img.id === selectedId) || null;
}

/* ===========================================
   UPLOAD (input + drag/drop)
=========================================== */

imageInput.addEventListener("change", () => {
    loadFiles(imageInput.files);
    imageInput.value = ""; // allow re-selecting the same file later
});

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

["dragleave", "dragend"].forEach(evt => {
    dropZone.addEventListener(evt, () => dropZone.classList.remove("dragover"));
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");
    loadFiles(e.dataTransfer.files);
});

// Also allow dropping anywhere on the preview area
previewArea.addEventListener("dragover", (e) => e.preventDefault());
previewArea.addEventListener("drop", (e) => {
    e.preventDefault();
    loadFiles(e.dataTransfer.files);
});

async function loadFiles(fileList) {

    const files = [...fileList];
    if (files.length === 0) return;

    let added = 0;
    let firstAddedId = null;

    for (const file of files) {

        if (!ALLOWED_TYPES.includes(file.type)) {
            showToast(`Unsupported format: ${file.name}`, true);
            continue;
        }

        if (file.size > MAX_FILE_SIZE) {
            showToast(`${file.name} is over 20MB`, true);
            continue;
        }

        const item = {
            id: uid(),
            src: URL.createObjectURL(file),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            rotation: 0
        };

        images.push(item);
        added++;
        if (!firstAddedId) firstAddedId = item.id;
    }

    if (added > 0) {
        if (!selectedId) selectedId = firstAddedId;
        showToast(added === 1 ? "Image added" : `${added} images added`);
    }

    renderSidebar();
}

/* ===========================================
   SIDEBAR / THUMBNAILS
=========================================== */

function renderSidebar() {

    preview.innerHTML = "";
    imageCount.textContent = images.length;
    sizeEstimate.textContent = estimateTotalSize() + " MB";

    images.forEach((img, index) => {

        const wrap = document.createElement("div");
        wrap.className = "thumb";
        wrap.dataset.id = img.id;
        if (img.id === selectedId) wrap.classList.add("active-thumb");

        const thumbImg = document.createElement("img");
        thumbImg.src = img.src;
        thumbImg.draggable = false;
        thumbImg.style.transform = `rotate(${img.rotation}deg)`;
        thumbImg.alt = img.name;

        const badge = document.createElement("span");
        badge.className = "thumb-index";
        badge.textContent = index + 1;

        wrap.appendChild(thumbImg);
        wrap.appendChild(badge);

        wrap.addEventListener("click", () => {
            selectedId = img.id;
            zoom = 1;
            renderAll();
        });

        preview.appendChild(wrap);
        animateThumbnail(wrap);
    });

    updateControlsState();
}

/* ===========================================
   MAIN PREVIEW + MODAL (single source of truth)
=========================================== */

function renderAll() {

    const current = getSelected();

    if (!current) {
        emptyPreview.style.display = "flex";
        mainPreview.style.display = "none";
        previewIndexLabel.textContent = "";
    } else {
        emptyPreview.style.display = "none";
        mainPreview.style.display = "block";
        mainPreview.src = current.src;
        mainPreview.style.transform = `scale(${zoom}) rotate(${current.rotation}deg)`;
        const idx = getIndexById(current.id);
        previewIndexLabel.textContent = `${idx + 1} of ${images.length} — ${current.name}`;
    }

    updateZoomLabel();
    updateActiveThumbClass();
    updateControlsState();

    if (modal.style.display === "flex") {
        refreshModal();
    }
}

function updateActiveThumbClass() {
    document.querySelectorAll(".thumbnail-list .thumb").forEach(el => {
        el.classList.toggle("active-thumb", el.dataset.id === selectedId);
    });
}

function updateControlsState() {
    const has = images.length > 0;
    ["prevBtn", "nextBtn", "rotateLeftBtn", "rotateRightBtn", "deleteBtn",
     "downloadImage", "zoomInBtn", "zoomOutBtn", "fullscreenBtn"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.disabled = !has;
        });
    convertBtn.disabled = !has;
    removeAllBtn.disabled = !has;
}

/* ===========================================
   NAVIGATION
=========================================== */

function nextImage() {
    if (images.length === 0) return;
    const idx = getIndexById(selectedId);
    const nextIdx = (idx + 1) % images.length;
    selectedId = images[nextIdx].id;
    zoom = 1;
    renderAll();
}

function prevImage() {
    if (images.length === 0) return;
    const idx = getIndexById(selectedId);
    const prevIdx = (idx - 1 + images.length) % images.length;
    selectedId = images[prevIdx].id;
    zoom = 1;
    renderAll();
}

document.getElementById("nextBtn").onclick = nextImage;
document.getElementById("prevBtn").onclick = prevImage;
document.getElementById("modalNextBtn").onclick = nextImage;
document.getElementById("modalPrevBtn").onclick = prevImage;

/* ===========================================
   ROTATE
=========================================== */

function rotateCurrent(delta) {
    const current = getSelected();
    if (!current) return;
    current.rotation = (current.rotation + delta) % 360;
    renderAll();
    renderSidebar();
}

["rotateLeftBtn", "rotateLeftModal"].forEach(id => {
    document.getElementById(id).onclick = () => rotateCurrent(-90);
});

["rotateRightBtn", "rotateRightModal"].forEach(id => {
    document.getElementById(id).onclick = () => rotateCurrent(90);
});

/* ===========================================
   DELETE + UNDO
=========================================== */

function deleteCurrent() {

    if (images.length === 0) return;

    const idx = getIndexById(selectedId);
    if (idx === -1) return;

    const [removed] = images.splice(idx, 1);

    // Keep the previous "last deleted" only until it's overwritten —
    // don't revoke its blob URL yet so undo still works.
    if (lastDeleted && lastDeleted.item.id !== removed.id) {
        revokeImage(lastDeleted.item.src);
    }
    lastDeleted = { item: removed, index: idx };

    if (images.length === 0) {
        selectedId = null;
        closeImagePreview();
    } else {
        const newIdx = Math.min(idx, images.length - 1);
        selectedId = images[newIdx].id;
    }

    zoom = 1;
    renderSidebar();
    renderAll();
    showToast("Image deleted — Ctrl+Z to undo");
}

function undoDelete() {
    if (!lastDeleted) {
        showToast("Nothing to undo");
        return;
    }
    const { item, index } = lastDeleted;
    const insertAt = Math.min(index, images.length);
    images.splice(insertAt, 0, item);
    selectedId = item.id;
    lastDeleted = null;
    renderSidebar();
    renderAll();
    showToast("Undo successful");
}

["deleteBtn", "deleteModal"].forEach(id => {
    document.getElementById(id).onclick = deleteCurrent;
});

/* ===========================================
   REMOVE ALL
=========================================== */

removeAllBtn.onclick = () => {

    if (images.length === 0) {
        showToast("No images to remove");
        return;
    }

    if (!confirm("Remove all images? This can't be undone.")) return;

    images.forEach(img => revokeImage(img.src));
    if (lastDeleted) revokeImage(lastDeleted.item.src);
    lastDeleted = null;

    images = [];
    selectedId = null;
    zoom = 1;

    renderSidebar();
    renderAll();
    closeImagePreview();
    showToast("All images removed");
};

/* ===========================================
   REORDER (drag to reorder thumbnails)
=========================================== */

Sortable.create(preview, {
    animation: 200,
    ghostClass: "sortable-ghost",
    chosenClass: "sortable-chosen",
    onEnd: (evt) => {
        if (evt.oldIndex === evt.newIndex) return;
        const [moved] = images.splice(evt.oldIndex, 1);
        images.splice(evt.newIndex, 0, moved);
        renderSidebar(); // selectedId is unaffected — it tracks by id, not index
        renderAll();
    }
});

/* ===========================================
   ZOOM
=========================================== */

document.getElementById("zoomInBtn").onclick = () => setZoom(zoom + 0.1);
document.getElementById("zoomOutBtn").onclick = () => setZoom(zoom - 0.1);

function setZoom(value) {
    zoom = Math.min(3, Math.max(0.2, value));
    const current = getSelected();
    if (current) {
        mainPreview.style.transform = `scale(${zoom}) rotate(${current.rotation}deg)`;
    }
    updateZoomLabel();
}

function updateZoomLabel() {
    zoomValueEl.textContent = Math.round(zoom * 100) + "%";
}

previewArea.addEventListener("wheel", (e) => {
    if (images.length === 0) return;
    e.preventDefault();
    setZoom(zoom + (e.deltaY < 0 ? 0.1 : -0.1));
}, { passive: false });

mainPreview.addEventListener("click", () => openModal());

/* Pinch-to-zoom on touch devices */
let pinchStartDist = 0;
let pinchStartZoom = 1;

previewArea.addEventListener("touchstart", (e) => {
    if (e.touches.length !== 2) return;
    pinchStartDist = touchDistance(e.touches);
    pinchStartZoom = zoom;
}, { passive: true });

previewArea.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 2 || pinchStartDist === 0) return;
    e.preventDefault();
    const dist = touchDistance(e.touches);
    setZoom(pinchStartZoom * (dist / pinchStartDist));
}, { passive: false });

previewArea.addEventListener("touchend", (e) => {
    if (e.touches.length < 2) pinchStartDist = 0;
});

function touchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

/* ===========================================
   FULLSCREEN
=========================================== */

const fullscreenBtn = document.getElementById("fullscreenBtn");

fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
        previewArea.requestFullscreen().catch(() => showToast("Fullscreen not available", true));
    } else {
        document.exitFullscreen();
    }
};

document.addEventListener("fullscreenchange", () => {
    const icon = fullscreenBtn.querySelector("i");
    icon.className = document.fullscreenElement
        ? "fa-solid fa-compress"
        : "fa-solid fa-expand";
});

/* ===========================================
   MODAL
=========================================== */

function openModal() {
    if (images.length === 0) return;
    modal.style.display = "flex";
    refreshModal();
}

function closeImagePreview() {
    modal.style.display = "none";
}

function refreshModal() {
    const current = getSelected();
    if (!current) {
        closeImagePreview();
        return;
    }
    modalImage.src = current.src;
    modalImage.style.transform = `rotate(${current.rotation}deg)`;
    const idx = getIndexById(current.id);
    previewCounter.textContent = `${idx + 1} / ${images.length}`;

    document.getElementById("modalPrevBtn").disabled = images.length < 2;
    document.getElementById("modalNextBtn").disabled = images.length < 2;
}

document.getElementById("modalCloseBtn").onclick = closeImagePreview;

// Click on the dark backdrop (not the content) closes the modal
modal.addEventListener("click", (e) => {
    if (e.target === modal) closeImagePreview();
});

mainPreview.addEventListener("dblclick", openModal);

/* ===========================================
   DOWNLOAD SINGLE IMAGE
=========================================== */

function downloadCurrentImage() {
    const current = getSelected();
    if (!current) {
        showToast("No image selected", true);
        return;
    }
    const a = document.createElement("a");
    a.href = current.src;
    a.download = current.name;
    document.body.appendChild(a);
    a.click();
    a.remove();
}

document.getElementById("downloadImage").onclick = downloadCurrentImage;
document.getElementById("downloadPreview").onclick = downloadCurrentImage;

/* ===========================================
   CAMERA & GALLERY
=========================================== */

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

/* ===========================================
   KEYBOARD SHORTCUTS
=========================================== */

document.addEventListener("keydown", (e) => {

    const tag = (e.target && e.target.tagName) || "";
    if (tag === "SELECT" || tag === "INPUT" || tag === "TEXTAREA") return;

    switch (e.key) {
        case "ArrowRight":
            nextImage();
            break;
        case "ArrowLeft":
            prevImage();
            break;
        case "Escape":
            closeImagePreview();
            document.getElementById("shortcutModal").style.display = "none";
            break;
        case "Delete":
        case "Backspace":
            if (modal.style.display === "flex" || document.activeElement === document.body) {
                deleteCurrent();
            }
            break;
    }

    if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" || e.key === "Z") {
            e.preventDefault();
            undoDelete();
        } else if (e.key === "=" || e.key === "+") {
            e.preventDefault();
            setZoom(zoom + 0.1);
        } else if (e.key === "-") {
            e.preventDefault();
            setZoom(zoom - 0.1);
        }
    }
});

/* ===========================================
   SHORTCUTS HELP MODAL
=========================================== */

const shortcutModal = document.getElementById("shortcutModal");
document.getElementById("helpBtn").onclick = () => shortcutModal.style.display = "flex";
document.getElementById("closeShortcutBtn").onclick = () => shortcutModal.style.display = "none";
shortcutModal.addEventListener("click", (e) => {
    if (e.target === shortcutModal) shortcutModal.style.display = "none";
});

/* ===========================================
   THEME TOGGLE
=========================================== */

const themeBtn = document.getElementById("themeBtn");

function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    themeBtn.querySelector("i").className = theme === "light"
        ? "fa-solid fa-sun"
        : "fa-solid fa-moon";
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
   TOAST
=========================================== */

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

/* ===========================================
   LOADING OVERLAY
=========================================== */

function showLoader() {
    document.getElementById("loadingOverlay").style.display = "flex";
}

function hideLoader() {
    document.getElementById("loadingOverlay").style.display = "none";
}

/* ===========================================
   IMAGE PROCESSING (rotation-aware, downscaled)
=========================================== */

async function processImageForPdf(imageData, quality) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {

            let width = img.width;
            let height = img.height;

            const MAX_SIZE = 2500;
            if (width > MAX_SIZE || height > MAX_SIZE) {
                const ratio = Math.min(MAX_SIZE / width, MAX_SIZE / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            const rotated90 = Math.abs(imageData.rotation) % 180 === 90;
            canvas.width = rotated90 ? height : width;
            canvas.height = rotated90 ? width : height;

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(imageData.rotation * Math.PI / 180);
            ctx.drawImage(img, -width / 2, -height / 2, width, height);

            const format = imageData.type === "image/png" ? "image/png" : "image/jpeg";

            resolve({
                data: canvas.toDataURL(format, quality),
                format: format === "image/png" ? "PNG" : "JPEG",
                width: canvas.width,
                height: canvas.height
            });
        };

        img.onerror = () => reject(new Error(`Could not load ${imageData.name}`));
        img.src = imageData.src;
    });
}

function calculateFit(pageWidth, pageHeight, imgWidth, imgHeight, fitMode) {

    if (fitMode === "fill") {
        return { x: 0, y: 0, width: pageWidth, height: pageHeight };
    }

    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    const width = imgWidth * ratio;
    const height = imgHeight * ratio;

    return {
        width,
        height,
        x: (pageWidth - width) / 2,
        y: (pageHeight - height) / 2
    };
}

/* ===========================================
   CONVERT TO PDF
=========================================== */

async function convertPDF() {

    if (images.length === 0) {
        showToast("Upload images first", true);
        return;
    }

    convertBtn.disabled = true;
    showLoader();
    startProgress();

    try {

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: document.getElementById("orientation").value,
            format: document.getElementById("pageSize").value,
            unit: "mm"
        });

        pdf.setProperties({
            title: "ToolHub AI — Image to PDF",
            author: "ToolHub AI",
            subject: "Image to PDF",
            creator: "ToolHub AI"
        });

        const quality = parseFloat(document.getElementById("quality").value);
        const fitMode = document.getElementById("fitMode").value;

        for (let i = 0; i < images.length; i++) {

            if (i > 0) pdf.addPage();

            const processed = await processImageForPdf(images[i], quality);

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const fit = calculateFit(pageWidth, pageHeight, processed.width, processed.height, fitMode);

            pdf.addImage(
                processed.data,
                processed.format,
                fit.x,
                fit.y,
                fit.width,
                fit.height,
                undefined,
                "FAST"
            );

            updateProgress(i + 1, images.length);
        }

        const fileName = images.length === 1
            ? images[0].name.replace(/\.[^.]+$/, "")
            : "Merged-Images";

        pdf.save(fileName + ".pdf");
        showToast("PDF generated successfully");

    } catch (err) {
        console.error(err);
        showToast("Something went wrong generating the PDF", true);
    } finally {
        finishProgress();
        hideLoader();
        convertBtn.disabled = images.length === 0;
    }
}

convertBtn.onclick = convertPDF;

/* ===========================================
   PROGRESS BAR
=========================================== */

function startProgress() {
    progressContainer.style.display = "block";
    progressFill.style.width = "0%";
    progressPercent.textContent = "0%";
}

function updateProgress(done, total) {
    const percent = Math.round((done / total) * 100);
    progressFill.style.width = percent + "%";
    progressPercent.textContent = percent + "%";
}

function finishProgress() {
    progressFill.style.width = "100%";
    progressPercent.textContent = "100%";
    setTimeout(() => {
        progressContainer.style.display = "none";
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
    }, 700);
}

/* ===========================================
   HELPERS
=========================================== */

function revokeImage(url) {
    if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
}

function estimateTotalSize() {
    const totalBytes = images.reduce((sum, img) => sum + img.size, 0);
    return (totalBytes / (1024 * 1024)).toFixed(2);
}

function animateThumbnail(element) {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    element.animate(
        [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: 180, fill: "forwards" }
    );
}

/* ===========================================
   CLEANUP / UNSAVED-CHANGES WARNING
=========================================== */

window.addEventListener("beforeunload", (e) => {
    if (images.length) {
        e.preventDefault();
        e.returnValue = "";
    }
});

window.addEventListener("pagehide", () => {
    images.forEach(img => revokeImage(img.src));
    if (lastDeleted) revokeImage(lastDeleted.item.src);
});

/* ===========================================
   STARTUP
=========================================== */

renderSidebar();
renderAll();