const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("imageCount");
const dropZone = document.getElementById("dropZone");

let images = [];
let currentPreviewIndex = 0;

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
function loadFiles(files) {

    Array.from(files).forEach(file => {

        if (!file.type.startsWith("image/")) return;

        const reader = new FileReader();

        reader.onload = function (e) {

            images.push({
                src: e.target.result,
                rotation: 0
            });

            renderImages();

        };

        reader.readAsDataURL(file);

    });

}

// Render Images

function renderImages() {

    preview.innerHTML = "";

    imageCount.textContent = images.length;

    images.forEach((imageData, index) => {

        const card = document.createElement("div");

        card.className = "image-card";
        card.dataset.index = index;

        const img = document.createElement("img");
        img.src = imageData.src || imageData;
        img.style.transform =
            `rotate(${imageData.rotation || 0}deg)`;
        img.className =
            "w-full aspect-square object-cover rounded-xl cursor-pointer transition duration-300 hover:scale-105";

            img.onclick = () => openImagePreview(img.src);

        // Buttons
        const buttons = document.createElement("div");

        buttons.className = "action-bar";

        // LEFT
        const leftBtn = document.createElement("button");
        leftBtn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        leftBtn.className = "action-btn bg-blue-600 rounded p-2";

        leftBtn.dataset.title = "Move Up";

        leftBtn.onclick = () => {

            if (index > 0) {

                [images[index], images[index - 1]] =
                    [images[index - 1], images[index]];

                renderImages();

            }

        };

        // ROTATE LEFT
        const rotateLeft = document.createElement("button");
        rotateLeft.innerHTML = '<i class="fa-solid fa-rotate-left"></i>';
        rotateLeft.className = "action-btn bg-yellow-600 rounded p-2";

        rotateLeft.dataset.title = "Rotate Left";

        rotateLeft.onclick = () => {

            if (!images[index].rotation)
                images[index].rotation = 0;

            images[index].rotation -= 90;

            renderImages();

        };

        // DELETE
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
        removeBtn.className = "action-btn bg-red-600 rounded p-2";

        removeBtn.dataset.title = "Delete Image";

        removeBtn.onclick = () => {

            images.splice(index, 1);

            renderImages();

        };

        // ROTATE RIGHT
        const rotateRight = document.createElement("button");
        rotateRight.innerHTML = '<i class="fa-solid fa-rotate-right"></i>';
        rotateRight.className = "action-btn bg-yellow-600 rounded p-2";

        rotateRight.dataset.title = "Rotate Right";

        rotateRight.onclick = () => {

            if (!images[index].rotation)
                images[index].rotation = 0;

            images[index].rotation += 90;

            renderImages();

        };

        // RIGHT
        const rightBtn = document.createElement("button");
        rightBtn.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';
        rightBtn.className = "action-btn bg-blue-600 rounded p-2";

        rightBtn.dataset.title = "Move Down";

        rightBtn.onclick = () => {

            if (index < images.length - 1) {

                [images[index], images[index + 1]] =
                    [images[index + 1], images[index]];

                renderImages();

            }

        };

        buttons.append(
            leftBtn,
            rotateLeft,
            removeBtn,
            rotateRight,
            rightBtn
        );

        card.append(img, buttons);

        preview.appendChild(card);

    });

    if (!preview.sortableInstance) {

        preview.sortableInstance = Sortable.create(preview, {

            animation: 200,

            onEnd(evt) {

                const moved =
                    images.splice(evt.oldIndex, 1)[0];

                images.splice(evt.newIndex, 0, moved);

                renderImages();

            }

        });

    }
}

// Convert PDF

async function convertPDF() {

    const btn = document.getElementById("convertBtn");
    const btnText = document.getElementById("btnText");
    const btnIcon = btn.querySelector("i");

    btn.disabled = true;
    btnText.innerHTML = "Generating PDF...";
    btnIcon.className = "fa-solid fa-spinner fa-spin";

    try {

        if (images.length === 0) {
            alert("Please select at least one image.");
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

        for (let i = 0; i < images.length; i++) {

            if (i > 0) pdf.addPage();

            const img = new Image();

            img.src = images[i].src;

            await new Promise(resolve => {
                img.onload = resolve;
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

            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;

            pdf.addImage(
                images[i].src,
                "JPEG",
                x,
                y,
                imgWidth,
                imgHeight,
                "",
                quality > 0.9 ? "FAST" : "MEDIUM"
            );

        }

        pdf.save("ToolHubAI-Images.pdf");

    }

    catch (error) {

        console.error(error);

        alert("Failed to generate PDF.");

    }

    finally {

        btn.disabled = false;

        btnText.innerHTML = "Convert Images to PDF";

        btnIcon.className = "fa-solid fa-file-pdf";

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

function openImagePreview(src){

    currentPreviewIndex = images.findIndex(img => (img.src || img) === src);

    updatePreview();

    document.getElementById("imagePreviewModal").style.display="flex";

}

function closeImagePreview(){

    document.getElementById("imagePreviewModal").style.display = "none";

}
document.getElementById("imagePreviewModal").addEventListener("click", function(e){

    if(e.target===this){

        closeImagePreview();

    }

});

document.addEventListener("keydown",function(e){

    if(e.key==="Escape"){

        closeImagePreview();

    }

});

function updatePreview(){

    const img = images[currentPreviewIndex];

    document.getElementById("previewImage").src = img.src || img;

    document.getElementById("previewCounter").textContent =
        `${currentPreviewIndex + 1} / ${images.length}`;

}

function nextImage(){

    if(currentPreviewIndex < images.length - 1){

        currentPreviewIndex++;

        updatePreview();

    }

}

function prevImage(){

    if(currentPreviewIndex > 0){

        currentPreviewIndex--;

        updatePreview();

    }

}