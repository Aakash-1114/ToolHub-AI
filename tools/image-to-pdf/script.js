const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("imageCount");
const dropZone = document.getElementById("dropZone");
let images = [];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp"
];

let currentPreviewIndex = 0;
let currentRotation = 0;

// Upload Images
imageInput.addEventListener("change", () => {
    loadFiles(imageInput.files);
});

// Drag & Drop
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

// Load Files

async function loadFiles(files) {

    const fileList = Array.from(files);

    for (const file of fileList) {

        // Image validation

        if (!ALLOWED_TYPES.includes(file.type)) {

            showToast("Unsupported image format.");
            continue;

        }

        // Size validation

        if (file.size > MAX_FILE_SIZE) {

            showToast("Image exceeds 20MB.");
            continue;

        }

        // Duplicate validation

        const duplicate = images.some(img =>
            img.name === file.name &&
            img.size === file.size
        );

        if (duplicate) {

            showToast("Image already added.");

            continue;

        }

        // Object URL

        if (!(file instanceof File)) {

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

    renderImages();

    imageInput.value = "";

}

// Render Images

function renderImages() {

    preview.innerHTML = "";

    if (images.length === 0) {

        preview.innerHTML = `

<div class="text-center col-span-full text-gray-400 py-10">

<i class="fa-solid fa-images text-5xl mb-4"></i>

<p>No Images Selected</p>

</div>

`;

        imageCount.textContent = 0;

        return;

    }

    imageCount.animate(

        [

            { transform: "scale(1.2)" },

            { transform: "scale(1)" }

        ],

        {

            duration: 250

        }

    );

    imageCount.textContent = images.length;

    images.forEach((imageData, index) => {

        const card = document.createElement("div");

        card.className = "image-card";
        card.dataset.index = index;

        const img = document.createElement("img");
        img.loading = "lazy";
        img.draggable = false;
        img.alt = imageData.name || "Uploaded Image";
        img.decoding = "async";
        img.src = imageData.src || imageData;

        img.onerror = () => {

            images.splice(index, 1);

            renderImages();

            console.error("Failed:", imageData.name);

        };

        img.style.transform =
            `rotate(${imageData.rotation || 0}deg)`;
        img.className =
            "w-full aspect-square object-cover rounded-xl cursor-pointer transition duration-300";

        img.style.pointerEvents = "auto";

        img.addEventListener("click", function () {

            openImagePreview(imageData.src);

        });



        card.append(img);

        preview.appendChild(card);

    });

    if (!preview.sortableInstance) {

        preview.sortableInstance = Sortable.create(preview, {

            animation: 180,

            ghostClass: "dragging",

            chosenClass: "chosen",

            dragClass: "dragging",

            onEnd(evt) {

                const moved =
                    images.splice(evt.oldIndex, 1)[0];

                images.splice(evt.newIndex, 0, moved);

                renderImages();

            }

        });

    }
}

// Image Compression Function 

async function compressImage(imageData, quality = 0.8) {

    return new Promise((resolve) => {

        const img = new Image();

        img.src = imageData.src;

        img.onload = () => {

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            let width = img.width;
            let height = img.height;

            // Max size
            const MAX = 2000;

            if (width > MAX || height > MAX) {

                const ratio = Math.min(MAX / width, MAX / height);

                width *= ratio;
                height *= ratio;

            }

            canvas.width = width;
            canvas.height = height;

            // Apply Rotation
            if (imageData.rotation % 360 !== 0) {

                const rotateCanvas = document.createElement("canvas");
                const rotateCtx = rotateCanvas.getContext("2d");

                if (Math.abs(imageData.rotation % 180) === 90) {

                    rotateCanvas.width = height;
                    rotateCanvas.height = width;

                } else {

                    rotateCanvas.width = width;
                    rotateCanvas.height = height;

                }

                rotateCtx.translate(
                    rotateCanvas.width / 2,
                    rotateCanvas.height / 2
                );

                rotateCtx.rotate(
                    imageData.rotation * Math.PI / 180
                );

                rotateCtx.drawImage(
                    img,
                    -width / 2,
                    -height / 2,
                    width,
                    height
                );

                resolve(
                    rotateCanvas.toDataURL(
                        "image/jpeg",
                        quality
                    )
                );

            } else {

                ctx.drawImage(
                    img,
                    0,
                    0,
                    width,
                    height
                );

                resolve(
                    canvas.toDataURL(
                        "image/jpeg",
                        quality
                    )
                );

            }

        };

        img.onerror = () => {
            resolve(imageData.src);
        };

    });

}

// Convert PDF

async function convertPDF() {

    const btn = document.getElementById("convertBtn");
    const progressContainer =
        document.getElementById("progressContainer");

    const progressFill =
        document.getElementById("progressFill");

    const progressPercent =
        document.getElementById("progressPercent");

    progressContainer.style.display = "block";
    const btnText = document.getElementById("btnText");
    const btnIcon = btn.querySelector("i");

    btn.disabled = true;
    btnText.innerHTML = "Generating PDF...";
    btnIcon.className = "fa-solid fa-spinner fa-spin";

    try {

        if (images.length === 0) {
            showToast("Please upload at least one image.");
            return;
        }

        const pageSize =
            document.getElementById("pageSize").value;

        const orientation =
            document.getElementById("orientation").value;

        const fitMode =
            document.getElementById("fitMode").value;

        const quality =
            parseFloat(document.getElementById("quality").value);

        const { jsPDF } = window.jspdf;

        const pdf = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: pageSize
        });

        const start = performance.now();

        pdf.setProperties({

            title: "Image to PDF",

            author: "ToolHub AI",

            subject: "Converted Images",

            creator: "ToolHub AI"

        });

        for (let i = 0; i < images.length; i++) {

            if (i > 0) pdf.addPage();

            const compressedImage =
                await compressImage(
                    images[i],
                    quality
                );

            const img = new Image();

            img.src = compressedImage;

            await new Promise((resolve, reject) => {

                img.onload = resolve;

                img.onerror = reject;

            });

            const pageWidth =
                pdf.internal.pageSize.getWidth();

            const pageHeight =
                pdf.internal.pageSize.getHeight();

            let imgWidth;
            let imgHeight;

            if (fitMode === "fill") {

                imgWidth = pageWidth;
                imgHeight = pageHeight;

            } else {

                const ratio = Math.min(
                    pageWidth / img.width,
                    pageHeight / img.height
                );

                imgWidth = img.width * ratio;
                imgHeight = img.height * ratio;

            }

            const margin = 10;

            const x = Math.max(margin, (pageWidth - imgWidth) / 2);

            const y = Math.max(margin, (pageHeight - imgHeight) / 2);

            pdf.addImage(
                compressedImage,
                images[i].type === "image/png"
                    ? "PNG"
                    : "JPEG",
                x,
                y,
                imgWidth,
                imgHeight,
                "",
                "FAST"
            );

            const percent = Math.round(((i + 1) / images.length) * 100);

            progressFill.style.width = percent + "%";

            progressPercent.textContent = percent + "%";

        }

        setTimeout(() => {

            const name =

                images.length === 1

                    ? images[0].name.replace(/\.[^/.]+$/, "")

                    : "Merged-Images";

            pdf.save(name + ".pdf");

            const end = performance.now();

            console.log(
                "PDF Generated in",
                ((end - start) / 1000).toFixed(2),
                "seconds"
            );

        }, 100);

    }

    catch (error) {

        console.error(error);

        showToast("Failed to generate PDF.");
    }

    finally {

        btn.disabled = false;

        btnText.innerHTML = "Convert Images to PDF";

        btnIcon.className = "fa-solid fa-file-pdf";

        progressContainer.style.display = "none";

        progressFill.style.width = "0%";

        progressPercent.textContent = "0%";

    }
}

function openCamera() {

    const input = document.getElementById("imageInput");

    input.removeAttribute("multiple");

    input.setAttribute("capture", "environment");

    input.click();

}

function openGallery() {

    const input = document.getElementById("imageInput");

    input.setAttribute("multiple", "multiple");

    input.removeAttribute("capture");

    input.click();

}

function openImagePreview(src) {

    currentPreviewIndex = images.findIndex(img => (img.src || img) === src);

    updatePreview();

    currentRotation = images[currentPreviewIndex].rotation || 0;

    document.getElementById("previewImage").style.transform =
        `rotate(${currentRotation}deg)`;

    document.getElementById("imagePreviewModal").style.display = "flex";

}

function closeImagePreview() {

    renderImages();

    document.getElementById("imagePreviewModal").style.display = "none";

}

const previewModal = document.getElementById("imagePreviewModal");

if (previewModal) {

    previewModal.addEventListener("click", function (e) {

        if (e.target === this) {

            closeImagePreview();

        }

    });

}

document.addEventListener("keydown", (e) => {

    const modal = document.getElementById("imagePreviewModal");

    if (modal.style.display !== "flex") return;

    switch (e.key) {

        case "Escape":

            closeImagePreview();

            break;

        case "ArrowRight":

            nextImage();

            break;

        case "ArrowLeft":

            prevImage();

            break;

    }

});

function updatePreview() {

    const img = images[currentPreviewIndex];

    const previewImg = document.getElementById("previewImage");

    previewImg.style.opacity = "0";

    previewImg.onload = () => {

        previewImg.style.opacity = "1";

    };

    previewImg.src = img.src || img;

    previewImg.style.transform =
        `rotate(${images[currentPreviewIndex].rotation || 0}deg)`;

    document.getElementById("previewCounter").textContent =
        `${currentPreviewIndex + 1} / ${images.length}`;

}

function nextImage() {

    if (currentPreviewIndex < images.length - 1) {

        currentPreviewIndex++;

        updatePreview();

    }

}

function prevImage() {

    if (currentPreviewIndex > 0) {

        currentPreviewIndex--;

        updatePreview();

    }

}

document.getElementById("rotateLeftPreview").onclick = () => {

    images[currentPreviewIndex].rotation =
        (images[currentPreviewIndex].rotation || 0) - 90;

    updatePreview();

};

document.getElementById("rotateRightPreview").onclick = () => {

    images[currentPreviewIndex].rotation =
        (images[currentPreviewIndex].rotation || 0) + 90;

    updatePreview();

};

document.getElementById("deletePreview").onclick = () => {

    const deleted = images.splice(currentPreviewIndex, 1)[0];

    if (deleted.src.startsWith("blob:")) {
        URL.revokeObjectURL(deleted.src);
    }

    showToast("Image Deleted");

    window.lastDeleted = deleted;

    if (images.length === 0) {

        closeImagePreview();

    } else {

        if (currentPreviewIndex >= images.length) {

            currentPreviewIndex = images.length - 1;

        }

        renderImages();

        updatePreview();

    }

};

const removeAllBtn =
    document.getElementById("removeAllBtn");

removeAllBtn.addEventListener("click", () => {

    if (images.length === 0) {

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

    renderImages();

});

function showToast(message) {

    const toast = document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    }, 2500);

}

document.addEventListener("keydown", (e) => {

    if (e.ctrlKey && e.key === "z") {

        if (window.lastDeleted) {

            images.push(window.lastDeleted);

            window.lastDeleted = null;

            renderImages();

            showToast("Undo Successful");

        }

    }

});

window.addEventListener("beforeunload", (e) => {

    if (images.length > 0) {

        e.preventDefault();

        e.returnValue = "";

    }

});