const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("imageCount");
const dropZone = document.getElementById("dropZone");

let images = [];

// Upload Images
imageInput.addEventListener("change", function () {
    loadFiles(this.files);
});

// Drag & Drop
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("bg-slate-700");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("bg-slate-700");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("bg-slate-700");

    loadFiles(e.dataTransfer.files);
});

// Load Images
function loadFiles(files) {

    preview.innerHTML = "";
    images = [];

    Array.from(files).forEach(file => {

        const reader = new FileReader();

        reader.onload = function (e) {

            images.push(e.target.result);

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

        const container = document.createElement("div");
        container.className = "relative";

        const img = document.createElement("img");
        img.src = imageData;
        img.className =
            "rounded-xl shadow-lg w-full h-52 object-cover";

        // Remove Button
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "❌";
        removeBtn.className =
            "absolute top-2 right-2 bg-red-600 text-white rounded-full px-2 py-1";

        removeBtn.onclick = () => {

            images.splice(index, 1);

            renderImages();

        };

        // Controls
        const controls = document.createElement("div");
        controls.className =
            "flex justify-center gap-2 mt-3";

        // Left Button
        const leftBtn = document.createElement("button");
        leftBtn.innerHTML = "⬅️";
        leftBtn.className =
            "bg-blue-600 px-3 py-1 rounded";

        leftBtn.onclick = () => {

            if (index > 0) {

                [images[index], images[index - 1]] =
                [images[index - 1], images[index]];

                renderImages();

            }

        };

        // Right Button
        const rightBtn = document.createElement("button");
        rightBtn.innerHTML = "➡️";
        rightBtn.className =
            "bg-blue-600 px-3 py-1 rounded";

        rightBtn.onclick = () => {

            if (index < images.length - 1) {

                [images[index], images[index + 1]] =
                [images[index + 1], images[index]];

                renderImages();

            }

        };

        controls.appendChild(leftBtn);
        controls.appendChild(rightBtn);

        container.appendChild(img);
        container.appendChild(removeBtn);
        container.appendChild(controls);

        preview.appendChild(container);

    });

}

// Convert PDF
async function convertPDF() {

    if (images.length === 0) {

        alert("Please select at least one image.");

        return;

    }

    const { jsPDF } = window.jspdf;

    const pdf = new jsPDF();

    for (let i = 0; i < images.length; i++) {

        if (i > 0) pdf.addPage();

        const img = new Image();

        img.src = images[i];

        await new Promise(resolve => img.onload = resolve);

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        const ratio = Math.min(
            pageWidth / img.width,
            pageHeight / img.height
        );

        const imgWidth = img.width * ratio;
        const imgHeight = img.height * ratio;

        const x = (pageWidth - imgWidth) / 2;
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(
            images[i],
            "JPEG",
            x,
            y,
            imgWidth,
            imgHeight
        );

    }

    pdf.save("ToolHubAI-Images.pdf");

}