/* ===========================================
   TOOLHUB AI
   IMAGE TO PDF PRO
=========================================== */

const imageInput = document.getElementById("imageInput");

const dropZone = document.getElementById("dropZone");

const preview = document.getElementById("preview");

const imageCount = document.getElementById("imageCount");

const mainPreview = document.getElementById("mainPreview");

const emptyPreview = document.getElementById("emptyPreview");

const progressContainer =
    document.getElementById("progressContainer");

const progressFill =
    document.getElementById("progressFill");

const progressPercent =
    document.getElementById("progressPercent");

let images = [];

let currentIndex = 0;

let zoom = 1;

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_TYPES = [

    "image/jpeg",

    "image/jpg",

    "image/png",

    "image/webp"

];

/* ===========================================
UPLOAD
=========================================== */

imageInput.addEventListener("change", () => {

    loadFiles(imageInput.files);

});

/* ===========================================
DRAG DROP
=========================================== */

dropZone.addEventListener("dragover", (e) => {

    e.preventDefault();

    dropZone.classList.add("dragover");

});

dropZone.addEventListener("dragleave", () => {

    dropZone.classList.remove("dragover");

});

dropZone.addEventListener("drop", (e) => {

    e.preventDefault();

    dropZone.classList.remove("dragover");

    loadFiles(e.dataTransfer.files);

});

/* ===========================================
LOAD FILES
=========================================== */

async function loadFiles(files) {

    const list = [...files];

    for (const file of list) {

        if (!ALLOWED_TYPES.includes(file.type)) {

            showToast("Unsupported format");

            continue;

        }

        if (file.size > MAX_FILE_SIZE) {

            showToast("Max 20MB");

            continue;

        }

        const duplicate = images.some(img =>

            img.name === file.name &&

            img.size === file.size

        );

        if (duplicate) {

            showToast("Duplicate skipped");

            continue;

        }

        const url = URL.createObjectURL(file);

        images.push({

            src: url,

            file: file,

            name: file.name,

            size: file.size,

            type: file.type,

            rotation: 0

        });

    }

    renderSidebar();

}

/* ===========================================
SIDEBAR
=========================================== */

function renderSidebar(){

    preview.innerHTML="";

    imageCount.textContent=images.length;

    if(images.length===0){

        emptyPreview.style.display="flex";
        mainPreview.style.display="none";

        updateEmptyState();

        return;
    }

    images.forEach((img,index)=>{

        const image=document.createElement("img");

        image.src=img.src;

        image.draggable=false;

        image.style.transform=
        `rotate(${img.rotation}deg)`;

        image.onclick=()=>{

            currentIndex=index;

            showPreview();

        };

        preview.appendChild(image);

        animateThumbnail(image);

    });

    updateActiveThumbnail();

    updateEmptyState();

    showPreview();

}

/* ===========================================
MAIN PREVIEW
=========================================== */

[
    "rotateLeftBtn",
    "rotateLeftModal"
].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = () => rotateCurrent(-90);
});

[
    "rotateRightBtn",
    "rotateRightModal"
].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = () => rotateCurrent(90);
});

[
    "deleteBtn",
    "deleteModal"
].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = deleteCurrent;
});

/* ===========================================
ZOOM
=========================================== */

document.getElementById("zoomInBtn").onclick = () => {

    zoom += 0.1;

    if (zoom > 3) zoom = 3;

    updateZoom();

};

document.getElementById("zoomOutBtn").onclick = () => {

    zoom -= 0.1;

    if (zoom < 0.2) zoom = 0.2;

    updateZoom();

};

function updateZoom() {

    document.getElementById("zoomValue").textContent =

        Math.round(zoom * 100) + "%";

    if (images.length) {

        mainPreview.style.transform =

            `scale(${zoom}) rotate(${images[currentIndex].rotation}deg)`;

    }

}

/* ===========================================
NEXT PREVIOUS
=========================================== */

document.getElementById("nextBtn").onclick = nextImage;

document.getElementById("prevBtn").onclick = prevImage;

function nextImage(){

    if(images.length===0) return;

    currentIndex++;

    if(currentIndex>=images.length){

        currentIndex=0;

    }

    zoom=1;

    updateZoom();

    showPreview();

}

function prevImage(){

    if(images.length===0) return;

    currentIndex--;

    if(currentIndex<0){

        currentIndex=images.length-1;

    }

    zoom=1;

    updateZoom();

    showPreview();

}

/* ===========================================
ROTATE
=========================================== */

function rotateCurrent(value){

    if(images.length===0) return;

    images[currentIndex].rotation += value;

    showPreview();

    renderSidebar();

    const modal=document.getElementById("previewImage");

    if(modal){

        modal.style.transform=
        `rotate(${images[currentIndex].rotation}deg)`;

    }

}

/* ===========================================
DELETE
=========================================== */

function deleteCurrent(){

    if(images.length===0) return;

    const deleted = images.splice(currentIndex,1)[0];

    window.lastDeleted = deleted;

    if(deleted.src.startsWith("blob:")){
        URL.revokeObjectURL(deleted.src);
    }

    if(currentIndex>=images.length){
        currentIndex=Math.max(0,images.length-1);
    }

    renderSidebar();

    if(images.length===0){
        closeImagePreview();
    }else{
        showPreview();
    }

    showToast("Image Deleted");

}

[
    "deleteBtn",
    "deleteModal"
].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.onclick = deleteCurrent;
});

/* ===========================================
FULLSCREEN
=========================================== */

document.getElementById("fullscreenBtn").onclick = () => {

    const area = document.querySelector(".preview-area");

    if (!document.fullscreenElement) {

        area.requestFullscreen();

    } else {

        document.exitFullscreen();

    }

};

/* ===========================================
MODAL
=========================================== */

mainPreview.onclick = () => {

    if (images.length === 0) return;

    document.getElementById("imagePreviewModal").style.display = "flex";

    const img = document.getElementById("previewImage");

    img.src = images[currentIndex].src;

    img.style.transform =

        `rotate(${images[currentIndex].rotation}deg)`;

};

function closeImagePreview() {

    document.getElementById("imagePreviewModal").style.display = "none";

}

document.querySelector(".modal-close").onclick =

    closeImagePreview;

/* ===========================================
KEYBOARD
=========================================== */
document.addEventListener("keydown", (e) => {

    switch (e.key) {

        case "ArrowRight":
            nextImage();
            break;

        case "ArrowLeft":
            prevImage();
            break;

        case "Escape":
            closeImagePreview();
            break;
    }

    if (e.ctrlKey && e.key === "z") {

        if (window.lastDeleted) {
            images.push(window.lastDeleted);
            window.lastDeleted = null;
            renderSidebar();
            showToast("Undo Success");
        }
    }

});


/* ===========================================
   REMOVE ALL
=========================================== */

document.getElementById("removeAllBtn").onclick = () => {

    if (images.length === 0) {

        showToast("No Images");

        return;

    }

    if (!confirm("Remove all images?")) {

        return;

    }

    images.forEach(img => {

        if (img.src.startsWith("blob:")) {

            URL.revokeObjectURL(img.src);

        }

    });

    images = [];

    currentIndex = 0;

    zoom = 1;

    updateZoom();

    renderSidebar();

    showToast("All Images Removed");

};

/* ===========================================
   SORTABLE
=========================================== */

Sortable.create(preview, {

    animation: 200,

    ghostClass: "dragging",

    onEnd: (evt) => {

        const moved = images.splice(evt.oldIndex, 1)[0];

        images.splice(evt.newIndex, 0, moved);

        currentIndex = evt.newIndex;

        renderSidebar();

    }

});

/* ===========================================
   TOAST
=========================================== */

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

/* ===========================================
   COMPRESS IMAGE
=========================================== */

async function compressImage(imageData, quality = 0.85) {

    return new Promise(resolve => {

        const img = new Image();

        img.onload = () => {

            let w = img.width;

            let h = img.height;

            const MAX = 2200;

            if (w > MAX || h > MAX) {

                const ratio = Math.min(MAX / w, MAX / h);

                w *= ratio;

                h *= ratio;

            }

            const canvas = document.createElement("canvas");

            const ctx = canvas.getContext("2d");

            if (Math.abs(imageData.rotation) % 180 === 90) {

                canvas.width = h;

                canvas.height = w;

            } else {

                canvas.width = w;

                canvas.height = h;

            }

            ctx.translate(canvas.width / 2, canvas.height / 2);

            ctx.rotate(imageData.rotation * Math.PI / 180);

            ctx.drawImage(img, -w / 2, -h / 2, w, h);

            resolve(

                canvas.toDataURL(

                    imageData.type === "image/png"

                        ? "image/png"

                        : "image/jpeg",

                    quality

                )

            );

        };

        img.src = imageData.src;

    });

}

/* ===========================================
   CONVERT PDF
=========================================== */

async function convertPDF() {

    if (images.length === 0) {

        showToast("Upload Images First");

        return;

    }

    showLoader();

    progressContainer.style.display = "block";

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF({

        orientation: document.getElementById("orientation").value,

        format: document.getElementById("pageSize").value,

        unit: "mm"

    });

    applyPdfMeta(pdf);

    const quality = parseFloat(

        document.getElementById("quality").value

    );

    const fit = document.getElementById("fitMode").value;

    for (let i = 0; i < images.length; i++) {

        if (i > 0) {

            pdf.addPage();

        }

        const data = await compressImage(images[i], quality);

        const img = new Image();

        img.src = data;

        await new Promise(r => img.onload = r);

        const pw = pdf.internal.pageSize.getWidth();

        const ph = pdf.internal.pageSize.getHeight();

        let iw, ih;

        if (fit === "fill") {

            iw = pw;

            ih = ph;

        } else {

            const ratio = Math.min(

                pw / img.width,

                ph / img.height

            );

            iw = img.width * ratio;

            ih = img.height * ratio;

        }

        pdf.addImage(

            data,

            images[i].type === "image/png"

                ? "PNG"

                : "JPEG",

            (pw - iw) / 2,

            (ph - ih) / 2,

            iw,

            ih,

            "",

            "FAST"

        );

        const percent = Math.round(

            ((i + 1) / images.length) * 100

        );

        progressFill.style.width = percent + "%";

        progressPercent.textContent = percent + "%";

    }

    const fileName =

        images.length === 1

            ? images[0].name.replace(/\.[^.]+$/, "")

            : "Merged-Images";

    pdf.save(fileName + ".pdf");

    progressContainer.style.display = "none";

    progressFill.style.width = "0%";

    progressPercent.textContent = "0%";

    showToast("PDF Generated");

    hideLoader();

}

/* ===========================================
   BEFORE UNLOAD
=========================================== */

window.addEventListener("beforeunload", (e) => {

    if (images.length) {

        e.preventDefault();

        e.returnValue = "";

    }

});

/* ===========================================
   CLEANUP
=========================================== */

window.addEventListener("unload", () => {

    images.forEach(img => {

        if (img.src.startsWith("blob:")) {

            URL.revokeObjectURL(img.src);

        }

    });

});

/* ===========================================
   CAMERA & GALLERY
=========================================== */

function openCamera() {

    imageInput.removeAttribute("multiple");

    imageInput.setAttribute("capture", "environment");

    imageInput.click();

}

function openGallery() {

    imageInput.removeAttribute("capture");

    imageInput.setAttribute("multiple", "multiple");

    imageInput.click();

}

/* ===========================================
   DOWNLOAD CURRENT IMAGE
=========================================== */

document.getElementById("downloadImage").onclick = () => {

    if (images.length === 0) {

        showToast("No Image");

        return;

    }

    const a = document.createElement("a");

    a.href = images[currentIndex].src;

    a.download = images[currentIndex].name;

    a.click();

};

/* ===========================================
   DOWNLOAD FROM MODAL
=========================================== */

document.getElementById("downloadPreview").onclick = () => {

    if (images.length === 0) {

        showToast("No Image");

        return;

    }

    const a = document.createElement("a");

    a.href = images[currentIndex].src;

    a.download = images[currentIndex].name;

    a.click();

};

/* ===========================================
   PREVIEW COUNTER
=========================================== */

function updateCounter() {

    const counter = document.getElementById("previewCounter");

    if (counter) {

        counter.textContent =

            `${currentIndex + 1} / ${images.length}`;

    }

}




/* ===========================================
   SHORTCUT MODAL
=========================================== */

function closeShortcutModal() {

    document.getElementById("shortcutModal").style.display = "none";

}

function openShortcutModal() {

    document.getElementById("shortcutModal").style.display = "flex";

}

/* ===========================================
   DELETE KEY
=========================================== */

document.addEventListener("keydown", (e) => {

    if (e.key === "Delete") {

        deleteCurrent();

    }

});

/* ===========================================
   LOADING
=========================================== */

function showLoader() {

    document.getElementById("loadingOverlay").style.display = "flex";

}

function hideLoader() {

    document.getElementById("loadingOverlay").style.display = "none";

}

/* ===========================================
   PRODUCTION OPTIMIZATION
=========================================== */

/* ---------- Active Thumbnail ---------- */

function updateActiveThumbnail() {

    document.querySelectorAll("#preview img").forEach((img, index) => {

        img.classList.toggle("active-thumb", index === currentIndex);

    });

}

/* ---------- PDF Metadata ---------- */

function applyPdfMeta(pdf) {

    pdf.setProperties({

        title: "ToolHub AI Image to PDF",

        author: "ToolHub AI",

        subject: "Image to PDF",

        creator: "ToolHub AI"

    });

}

/* ---------- Memory Cleanup ---------- */

function cleanupImages() {

    images.forEach(img => {

        if (img.src.startsWith("blob:")) {

            URL.revokeObjectURL(img.src);

        }

    });

}

/* ---------- Smooth Preview ---------- */

mainPreview.onload = () => {

    mainPreview.animate(

        [

            {

                opacity: 0,

                transform: "scale(.96)"

            },

            {

                opacity: 1,

                transform: "scale(1)"

            }

        ],

        {

            duration: 220,

            fill: "forwards"

        });

};

/* ---------- Keyboard Shortcuts ---------- */

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key === "=") {

        e.preventDefault();

        zoom = Math.min(3, zoom + .1);

        updateZoom();

    }

    if (e.ctrlKey && e.key === "-") {

        e.preventDefault();

        zoom = Math.max(.2, zoom - .1);

        updateZoom();

    }

});

/* ---------- Drag Highlight ---------- */

dropZone.addEventListener("dragenter", () => {

    dropZone.style.borderColor = "#3b82f6";

});

dropZone.addEventListener("dragleave", () => {

    dropZone.style.borderColor = "";

});

/* ---------- Active Thumbnail CSS ---------- */

const style = document.createElement("style");

style.textContent = `

.active-thumb{

outline:3px solid #3b82f6;

border-radius:12px;

box-shadow:0 0 18px rgba(59,130,246,.45);

}

`;

document.head.appendChild(style);

/* ---------- Startup ---------- */

renderSidebar();

updateZoom();

/* ===========================================
   PART 3F
   MODAL SYNC & SMART NAVIGATION
=========================================== */

function refreshModal() {

    const modal = document.getElementById("imagePreviewModal");

    if (modal.style.display !== "flex") return;

    const img = document.getElementById("previewImage");

    img.src = images[currentIndex].src;

    img.style.transform =
        `rotate(${images[currentIndex].rotation}deg)`;

    updateCounter();

}

/* ---------- Double Click ---------- */

mainPreview.ondblclick = () => {

    if (images.length) {

        document.getElementById("imagePreviewModal").style.display = "flex";

        refreshModal();

    }

};

/* ---------- Mouse Wheel Zoom ---------- */

mainPreview.addEventListener("wheel", (e) => {

    e.preventDefault();

    if (e.deltaY < 0) {

        zoom = Math.min(3, zoom + .1);

    } else {

        zoom = Math.max(.2, zoom - .1);

    }

    updateZoom();

});

/* ---------- Touch Zoom Placeholder ---------- */

let touchStartDistance = 0;

mainPreview.addEventListener("touchstart", (e) => {

    if (e.touches.length !== 2) return;

    const dx = e.touches[0].clientX - e.touches[1].clientX;

    const dy = e.touches[0].clientY - e.touches[1].clientY;

    touchStartDistance = Math.sqrt(dx * dx + dy * dy);

});

mainPreview.addEventListener("touchmove", (e) => {

    if (e.touches.length !== 2) return;

    const dx = e.touches[0].clientX - e.touches[1].clientX;

    const dy = e.touches[0].clientY - e.touches[1].clientY;

    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > touchStartDistance) {

        zoom = Math.min(3, zoom + .02);

    } else {

        zoom = Math.max(.2, zoom - .02);

    }

    touchStartDistance = dist;

    updateZoom();

});

/* ---------- Startup ---------- */

refreshModal();

/* ===========================================
   PART 3G
   PDF ENGINE V2
=========================================== */

async function getProcessedImage(imageData, quality) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => {

            let width = img.width;
            let height = img.height;

            // Maximum Render Size
            const MAX_SIZE = 2500;

            if (width > MAX_SIZE || height > MAX_SIZE) {

                const ratio = Math.min(
                    MAX_SIZE / width,
                    MAX_SIZE / height
                );

                width = Math.round(width * ratio);
                height = Math.round(height * ratio);

            }

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Rotation Support
            if (Math.abs(imageData.rotation) % 180 === 90) {

                canvas.width = height;
                canvas.height = width;

            } else {

                canvas.width = width;
                canvas.height = height;

            }

            ctx.translate(canvas.width / 2, canvas.height / 2);

            ctx.rotate(
                imageData.rotation * Math.PI / 180
            );

            ctx.drawImage(
                img,
                -width / 2,
                -height / 2,
                width,
                height
            );

            const format =

                imageData.type === "image/png"
                    ? "image/png"
                    : "image/jpeg";

            resolve({

                data: canvas.toDataURL(
                    format,
                    quality
                ),

                width: canvas.width,

                height: canvas.height

            });

        };

        img.onerror = reject;

        img.src = imageData.src;

    });

}

/* ===========================================
   FIT ENGINE
=========================================== */

function calculateFit(

    pageWidth,
    pageHeight,
    imgWidth,
    imgHeight,
    fitMode

) {

    if (fitMode === "fill") {

        return {

            x: 0,
            y: 0,
            width: pageWidth,
            height: pageHeight

        };

    }

    const ratio = Math.min(

        pageWidth / imgWidth,
        pageHeight / imgHeight

    );

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
   LOADING
=========================================== */

function startProgress(total) {

    progressContainer.style.display = "block";

    progressFill.style.width = "0%";

    progressPercent.textContent = "0%";

}

function updateProgress(index, total) {

    const percent = Math.round(

        ((index + 1) / total) * 100

    );

    progressFill.style.width =

        percent + "%";

    progressPercent.textContent =

        percent + "%";

}

function finishProgress() {

    progressFill.style.width = "100%";

    progressPercent.textContent = "100%";

    setTimeout(() => {

        progressContainer.style.display = "none";

        progressFill.style.width = "0%";

        progressPercent.textContent = "0%";

    }, 800);

}

/* ===========================================
   PART 3H
   FINAL PRODUCTION POLISH
=========================================== */

/* ---------- Performance Cache ---------- */

const imageCache = new Map();

async function preloadImages() {

    for (const img of images) {

        if (imageCache.has(img.src)) continue;

        await new Promise(resolve => {

            const i = new Image();

            i.onload = () => {

                imageCache.set(img.src, true);

                resolve();

            };

            i.onerror = resolve;

            i.src = img.src;

        });

    }

}

/* ---------- Smooth Thumbnail Animation ---------- */

function animateThumbnail(element) {

    element.animate(

        [

            {

                opacity: 0,

                transform: "translateY(10px)"

            },

            {

                opacity: 1,

                transform: "translateY(0)"

            }

        ],

        {

            duration: 180,

            fill: "forwards"

        }

    );

}

/* ---------- Preview Fade ---------- */

function fadePreview() {

    mainPreview.animate(

        [

            {

                opacity: 0

            },

            {

                opacity: 1

            }

        ],

        {

            duration: 200,

            fill: "forwards"

        }

    );

}



/* ---------- Empty State ---------- */

function updateEmptyState() {

    if (images.length) {

        emptyPreview.style.display = "none";

        mainPreview.style.display = "block";

    }

    else {

        emptyPreview.style.display = "flex";

        mainPreview.style.display = "none";

    }

}



/* ---------- Auto Cleanup ---------- */

window.addEventListener("pagehide", () => {

    cleanupImages();

});

/* ---------- Auto Revoke Deleted ---------- */

function revokeImage(url) {

    if (url.startsWith("blob:")) {

        URL.revokeObjectURL(url);

    }

}

/* ---------- PDF Size Estimate ---------- */

function estimatePdfSize() {

    let total = 0;

    images.forEach(img => {

        total += img.size;

    });

    return (

        total /

        (1024 * 1024)

    ).toFixed(2);

}



/* ---------- Final Startup ---------- */

window.addEventListener("load", () => {

    updateZoom();

    updateEmptyState();

    showToast("Image to PDF Pro Ready 🚀");

});