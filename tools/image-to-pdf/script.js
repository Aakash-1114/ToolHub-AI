const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const imageCount = document.getElementById("imageCount");
const dropZone = document.getElementById("dropZone");

let images = [];

// Upload Images
imageInput.addEventListener("change", () => {
    loadFiles(imageInput.files);
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
        card.className =
            "bg-slate-800 rounded-xl p-3";
        card.dataset.index = index;

        const img = document.createElement("img");
        img.src = imageData.src || imageData;
        img.style.transform =
            `rotate(${imageData.rotation || 0}deg)`;
        img.className =
            "w-full h-52 object-cover rounded-lg";

        // Buttons
        const buttons = document.createElement("div");
        buttons.className =
            "grid grid-cols-5 gap-2 mt-3";

        // LEFT
        const leftBtn = document.createElement("button");
        leftBtn.innerHTML = "⬅️";
        leftBtn.className =
            "bg-blue-600 rounded p-2";

        leftBtn.onclick = () => {

            if (index > 0) {

                [images[index], images[index - 1]] =
                    [images[index - 1], images[index]];

                renderImages();

            }

        };

        // ROTATE LEFT
        const rotateLeft = document.createElement("button");
        rotateLeft.innerHTML = "↺";
        rotateLeft.className =
            "bg-yellow-600 rounded p-2";

        rotateLeft.onclick = () => {

            if (!images[index].rotation)
                images[index].rotation = 0;

            images[index].rotation -= 90;

            renderImages();

        };

        // DELETE
        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "🗑️";
        removeBtn.className =
            "bg-red-600 rounded p-2";

        removeBtn.onclick = () => {

            images.splice(index, 1);

            renderImages();

        };

        // ROTATE RIGHT
        const rotateRight = document.createElement("button");
        rotateRight.innerHTML = "↻";
        rotateRight.className =
            "bg-yellow-600 rounded p-2";

        rotateRight.onclick = () => {

            if (!images[index].rotation)
                images[index].rotation = 0;

            images[index].rotation += 90;

            renderImages();

        };

        // RIGHT
        const rightBtn = document.createElement("button");
        rightBtn.innerHTML = "➡️";
        rightBtn.className =
            "bg-blue-600 rounded p-2";

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