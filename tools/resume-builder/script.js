// =========================================
// TOOLHUB AI RESUME BUILDER v3.0
// GLOBAL DATA
// =========================================

let educationData = [];
let experienceData = [];
let projectData = [];

function escapeHTML(text) {

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;

}

function createItem(title, subtitle, extra = "") {

    return `
        <div class="resume-item">

            <h3>${escapeHTML(title)}</h3>

            <p>${escapeHTML(subtitle)}</p>

            ${extra ? `<span>${escapeHTML(extra)}</span>` : ""}

        </div>
    `;

}

// =========================================
// TOOLHUB AI RESUME BUILDER v2.0
// PREMIUM TEMPLATE ENGINE
// =========================================

function changeTemplate() {

    const template = document.getElementById("template").value;

    const resume = document.getElementById("resumePreview");

    // Reset
    resume.className =
        "bg-white rounded-3xl overflow-hidden shadow-2xl max-w-4xl mx-auto";

    resume.style.background = "#ffffff";
    resume.style.color = "#111827";
    resume.style.borderTop = "none";
    resume.style.borderRadius = "24px";
    resume.style.boxShadow = "0 20px 45px rgba(0,0,0,.20)";

    switch (template) {

        case "classic":

            resume.style.borderTop =
                "8px solid #111827";

            break;

        case "modern":

            resume.style.borderTop =
                "8px solid #2563eb";

            break;

        case "minimal":

            resume.style.borderTop =
                "2px solid #d1d5db";

            resume.style.boxShadow =
                "none";

            break;

        case "creative":

            resume.style.borderTop =
                "8px solid orange";

            resume.style.background =
                "#fffaf0";

            break;

        case "premium":

            resume.style.borderTop =
                "12px solid #8b5cf6";

            resume.style.boxShadow =
                "0 25px 60px rgba(0,0,0,.30)";

            document.querySelector(".bg-slate-100").style.background = "#f8fafc";

            document.querySelector(".bg-slate-100").style.borderRight = "none";

            document.getElementById("previewPhoto").style.border =
                "5px solid white";

            document.getElementById("previewPhoto").style.boxShadow =
                "0 10px 30px rgba(0,0,0,.25)";

            break;

        case "plain":

            resume.style.background = "#ffffff";
            resume.style.color = "#000000";
            resume.style.borderTop = "none";
            resume.style.borderRadius = "0";
            resume.style.boxShadow = "none";

            document.querySelector(".bg-gradient-to-r").style.background =
                "#ffffff";

            document.querySelector(".bg-gradient-to-r").style.color =
                "#000000";

            document.getElementById("previewEmail").style.color =
                "#000000";

            document.getElementById("previewPhone").style.color =
                "#000000";

            document.getElementById("previewAddress").style.color =
                "#000000";

            document.querySelector(".bg-slate-100").style.background = "#ffffff";

            document.querySelector(".bg-slate-100").style.borderRight =
                "1px solid #d1d5db";

            document.querySelector(".bg-slate-100").style.padding = "30px";

            document.querySelector(".md\\:col-span-2").style.padding = "30px";

            document.getElementById("previewPhoto").style.border =
                "2px solid #000";

            document.getElementById("previewPhoto").style.boxShadow =
                "none";

            break;

        case "ats":

            resume.style.borderRadius = "0";
            resume.style.boxShadow = "none";
            resume.style.borderTop = "none";

            break;

    }

}

function changeTheme() {

    const color = document.getElementById("themeColor").value;

    const header = document.querySelector(".bg-gradient-to-r");

    const headings = document.querySelectorAll(".resume-heading");

    let theme = "#2563eb";

    switch (color) {

        case "green":
            theme = "#16a34a";
            break;

        case "purple":
            theme = "#7c3aed";
            break;

        case "red":
            theme = "#dc2626";
            break;

        case "black":
            theme = "#111827";
            break;

        case "white":
            theme = "#ffffff";
            break;

        default:
            theme = "#2563eb";

    }

    if (header) {
        header.style.background = theme;
    }

    headings.forEach(item => {
        item.style.color = theme;
        item.style.borderBottom = `2px solid ${theme}`;
    });

    const name = document.getElementById("previewName");

    if (name) {
        name.style.color = "white";
    }

}

// =========================================
// GENERATE RESUME v2
// =========================================

function generateResume() {

    document.getElementById("previewName").textContent =
        document.getElementById("name").value || "Your Name";

    document.getElementById("previewEmail").textContent =
        document.getElementById("email").value || "email@example.com";

    document.getElementById("previewPhone").textContent =
        document.getElementById("phone").value || "+91 XXXXX XXXXX";

    const address = document.getElementById("address");

    if (address) {

        document.getElementById("previewAddress").textContent =
            address.value || "Your Address";

    }

    document.getElementById("previewSummary").textContent =
        document.getElementById("summary").value ||
        "Your professional summary will appear here.";

    document.getElementById("previewSkills").textContent =
        document.getElementById("skills").value ||
        "HTML, CSS, JavaScript";

    document.getElementById("previewLinkedin").textContent =
        document.getElementById("linkedin").value ||
        "Not Added";

    document.getElementById("previewGithub").textContent =
        document.getElementById("github").value ||
        "Not Added";

    document.getElementById("previewCertificate").textContent =
        document.getElementById("certificate").value ||
        "Not Added";

    document.getElementById("previewLanguages").textContent =
        document.getElementById("languages").value ||
        "Not Added";

    document.getElementById("previewEducation").innerHTML =
        `${document.getElementById("degree").value}
<br>
${document.getElementById("college").value}
<br>
${document.getElementById("year").value}`;

    document.getElementById("previewExperience").innerHTML =
        `<b>${document.getElementById("job").value}</b>
<br>
${document.getElementById("company").value}
<br>
${document.getElementById("duration").value}`;

    document.getElementById("previewProject").innerHTML =
        `<b>${document.getElementById("project").value}</b>
<br>
${document.getElementById("projectDesc").value}`;

    hideEmptySections();

}

// =========================================
// HIDE EMPTY SECTIONS
// =========================================

function hideEmptySections() {

    const map = [

        ["previewSummary", "summary"],
        ["previewSkills", "skills"],
        ["previewEducation", "degree"],
        ["previewExperience", "job"],
        ["previewProject", "project"],
        ["previewLinkedin", "linkedin"],
        ["previewGithub", "github"],
        ["previewCertificate", "certificate"],
        ["previewLanguages", "languages"]

    ];

    map.forEach(item => {

        const preview = document.getElementById(item[0]);

        const input = document.getElementById(item[1]);

        if (!preview || !input) return;

        const section = preview.closest("div") || preview.parentElement;

        if (input.value.trim() === "") {

            if (section) section.style.display = "none";

        } else {

            if (section) section.style.display = "block";

        }

    });

}

// =========================================
// PHOTO PREVIEW
// =========================================

document.getElementById("photo").addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        const img = document.getElementById("previewPhoto");

        img.src = e.target.result;

        img.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});

// =========================================
// EDUCATION ENGINE
// =========================================

document.getElementById("addEducation").addEventListener("click", () => {

    const degree = document.getElementById("degree").value.trim();
    const college = document.getElementById("college").value.trim();
    const year = document.getElementById("year").value.trim();

    if (!degree || !college || !year) {

        alert("Please fill all education fields.");
        return;

    }

    educationData.push({

        degree,
        college,
        year

    });

    renderEducation();

    document.getElementById("degree").value = "";
    document.getElementById("college").value = "";
    document.getElementById("year").value = "";

});

function renderEducation() {

    const list = document.getElementById("educationList");
    const preview = document.getElementById("previewEducation");

    list.innerHTML = "";
    preview.innerHTML = "";

    educationData.forEach((item, index) => {

        list.innerHTML += `

        <div class="bg-slate-700 rounded-xl p-4 mb-3 flex justify-between items-center">

            <div>

                <b>${escapeHTML(item.degree)}</b><br>

                ${escapeHTML(item.college)}<br>

                ${escapeHTML(item.year)}

            </div>

            <button
            onclick="deleteEducation(${index})"
            class="bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg">

            Delete

            </button>

        </div>

        `;

        preview.innerHTML += createItem(

            item.degree,

            item.college,

            item.year

        );

    });

}

function deleteEducation(index){

    educationData.splice(index,1);

    renderEducation();

}

// Initial Preview
window.onload = function () {

    generateResume();
    changeTemplate();
    changeTheme();

};

// =========================================
// ADD MULTIPLE EDUCATION
// =========================================

let educationData = [];

document.getElementById("addEducation").onclick = function () {

    const degree = document.getElementById("degree").value.trim();
    const college = document.getElementById("college").value.trim();
    const year = document.getElementById("year").value.trim();

    if (!degree || !college || !year) {
        alert("Please fill all Education fields.");
        return;
    }

    educationData.push({
        degree,
        college,
        year
    });

    renderEducation();

    document.getElementById("degree").value = "";
    document.getElementById("college").value = "";
    document.getElementById("year").value = "";

};

function renderEducation() {

    const list = document.getElementById("educationList");
    const preview = document.getElementById("previewEducation");

    list.innerHTML = "";
    preview.innerHTML = "";

    educationData.forEach((item, index) => {

        list.innerHTML += `
        <div class="bg-slate-700 rounded-lg p-3 mb-3 flex justify-between items-center">
            <div>
                <b>${item.degree}</b><br>
                ${item.college}<br>
                ${item.year}
            </div>

            <button onclick="removeEducation(${index})"
            class="bg-red-600 px-3 py-1 rounded">
            Delete
            </button>
        </div>
        `;

        preview.innerHTML += `
        <div class="mb-5">
            <b>${item.degree}</b><br>
            ${item.college}<br>
            ${item.year}
        </div>
        `;

    });

}

function removeEducation(index){

    educationData.splice(index,1);

    renderEducation();

}

// =========================================
// ADD MULTIPLE EXPERIENCE
// =========================================

let experienceData = [];

document.getElementById("addExperience").onclick = function () {

    const job = document.getElementById("job").value.trim();
    const company = document.getElementById("company").value.trim();
    const duration = document.getElementById("duration").value.trim();

    if (!job || !company || !duration) {

        alert("Please fill all Experience fields.");

        return;

    }

    experienceData.push({

        job,
        company,
        duration

    });

    renderExperience();

    document.getElementById("job").value = "";
    document.getElementById("company").value = "";
    document.getElementById("duration").value = "";

};

function renderExperience() {

    const list = document.getElementById("experienceList");

    const preview = document.getElementById("previewExperience");

    list.innerHTML = "";

    preview.innerHTML = "";

    experienceData.forEach((item,index)=>{

        list.innerHTML += `
        <div class="bg-slate-700 rounded-lg p-3 mb-3 flex justify-between items-center">

            <div>

                <b>${item.job}</b><br>

                ${item.company}<br>

                ${item.duration}

            </div>

            <button onclick="removeExperience(${index})"

            class="bg-red-600 px-3 py-1 rounded">

            Delete

            </button>

        </div>
        `;

        preview.innerHTML += `
        <div class="mb-5">

            <b>${item.job}</b><br>

            ${item.company}<br>

            ${item.duration}

        </div>
        `;

    });

}

function removeExperience(index){

    experienceData.splice(index,1);

    renderExperience();

}

// =========================================
// ADD MULTIPLE PROJECTS
// =========================================

let projectData = [];

document.getElementById("addProject").onclick = function () {

    const project = document.getElementById("project").value.trim();

    const projectDesc = document.getElementById("projectDesc").value.trim();

    if (!project || !projectDesc) {

        alert("Please fill all Project fields.");

        return;

    }

    projectData.push({

        project,
        projectDesc

    });

    renderProjects();

    document.getElementById("project").value = "";

    document.getElementById("projectDesc").value = "";

};

function renderProjects() {

    const list = document.getElementById("projectList");

    const preview = document.getElementById("previewProject");

    list.innerHTML = "";

    preview.innerHTML = "";

    projectData.forEach((item,index)=>{

        list.innerHTML += `
        <div class="bg-slate-700 rounded-lg p-3 mb-3 flex justify-between items-center">

            <div>

                <b>${item.project}</b><br>

                ${item.projectDesc}

            </div>

            <button onclick="removeProject(${index})"

            class="bg-red-600 px-3 py-1 rounded">

            Delete

            </button>

        </div>
        `;

        preview.innerHTML += `
        <div class="mb-5">

            <b>${item.project}</b><br>

            ${item.projectDesc}

        </div>
        `;

    });

}

function removeProject(index){

    projectData.splice(index,1);

    renderProjects();

}

// =========================================
// DOWNLOAD PDF (PRO VERSION)
// =========================================

async function downloadPDF() {

    const { jsPDF } = window.jspdf;

    const resume = document.getElementById("resumePreview");

    const downloadBtn = document.getElementById("downloadBtn");

    downloadBtn.innerHTML = "Generating PDF...";

    downloadBtn.disabled = true;

    const canvas = await html2canvas(resume, {

        scale: 2,

        useCORS: true,

        backgroundColor: "#ffffff",

        scrollY: -window.scrollY

    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;

    const pageHeight = 297;

    const imgWidth = pageWidth;

    const imgHeight = canvas.height * imgWidth / canvas.width;

    if (imgHeight <= pageHeight) {

        pdf.addImage(

            imgData,

            "PNG",

            0,

            0,

            imgWidth,

            imgHeight

        );

    } else {

        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(

            imgData,

            "PNG",

            0,

            position,

            imgWidth,

            imgHeight

        );

        heightLeft -= pageHeight;

        while (heightLeft > 0) {

            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(

                imgData,

                "PNG",

                0,

                position,

                imgWidth,

                imgHeight

            );

            heightLeft -= pageHeight;

        }

    }

    pdf.save("Resume.pdf");

    downloadBtn.innerHTML = "⬇ Download PDF";

    downloadBtn.disabled = false;

}

// =========================================
// PRINT RESUME
// =========================================

function printResume(){

    window.print();

}