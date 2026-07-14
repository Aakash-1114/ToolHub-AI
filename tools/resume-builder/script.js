// ===============================
// ToolHub AI Resume Builder
// Part 1
// ===============================

// Inputs
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const addressInput = document.getElementById("address");

const summaryInput = document.getElementById("summary");
const skillsInput = document.getElementById("skills");

const collegeInput = document.getElementById("college");
const degreeInput = document.getElementById("degree");
const yearInput = document.getElementById("year");

const companyInput = document.getElementById("company");
const jobInput = document.getElementById("job");
const durationInput = document.getElementById("duration");

const projectInput = document.getElementById("project");
const projectDescInput = document.getElementById("projectDesc");

const linkedinInput = document.getElementById("linkedin");
const githubInput = document.getElementById("github");

const certificateInput = document.getElementById("certificate");
const languagesInput = document.getElementById("languages");

const photoInput = document.getElementById("photo");

// Preview
const previewName = document.getElementById("previewName");
const previewEmail = document.getElementById("previewEmail");
const previewPhone = document.getElementById("previewPhone");
const previewAddress = document.getElementById("previewAddress");

const previewSummary = document.getElementById("previewSummary");
const previewSkills = document.getElementById("previewSkills");

const previewEducation = document.getElementById("previewEducation");
const previewExperience = document.getElementById("previewExperience");
const previewProject = document.getElementById("previewProject");

const previewLinkedin = document.getElementById("previewLinkedin");
const previewGithub = document.getElementById("previewGithub");

const previewCertificate = document.getElementById("previewCertificate");
const previewLanguages = document.getElementById("previewLanguages");

const previewPhoto = document.getElementById("previewPhoto");

// Arrays
let educationData = [];
let experienceData = [];
let projectData = [];

// ===============================
// Generate Resume
// ===============================

function generateResume() {

    previewName.textContent =
        nameInput.value.trim() || "Your Name";

    previewEmail.textContent =
        emailInput.value.trim() || "email@example.com";

    previewPhone.textContent =
        phoneInput.value.trim() || "+91 XXXXX XXXXX";

    previewAddress.textContent =
        addressInput.value.trim() || "Your Address";

    previewSummary.textContent =
        summaryInput.value.trim() ||
        "Your professional summary will appear here.";

    previewSkills.textContent =
        skillsInput.value.trim() ||
        "HTML, CSS, JavaScript";

    previewLinkedin.textContent =
        linkedinInput.value.trim() || "Not Added";

    previewGithub.textContent =
        githubInput.value.trim() || "Not Added";

    previewCertificate.textContent =
        certificateInput.value.trim() || "Not Added";

    previewLanguages.textContent =
        languagesInput.value.trim() || "Not Added";

    // Education
    let educationHTML = "";

    if (degreeInput.value || collegeInput.value || yearInput.value) {

        educationHTML += `
        <p>
        <b>${degreeInput.value}</b><br>
        ${collegeInput.value}<br>
        ${yearInput.value}
        </p>`;
    }

    educationData.forEach(item => {

        educationHTML += `
        <p class="mt-3">
        <b>${item.degree}</b><br>
        ${item.college}<br>
        ${item.year}
        </p>`;

    });

    previewEducation.innerHTML =
        educationHTML || "Your education will appear here.";

    // Experience
    let experienceHTML = "";

    if (jobInput.value || companyInput.value) {

        experienceHTML += `
        <p>
        <b>${jobInput.value}</b><br>
        ${companyInput.value}<br>
        ${durationInput.value}
        </p>`;
    }

    experienceData.forEach(item => {

        experienceHTML += `
        <p class="mt-3">
        <b>${item.job}</b><br>
        ${item.company}<br>
        ${item.duration}
        </p>`;

    });

    previewExperience.innerHTML =
        experienceHTML || "Your experience will appear here.";

    // Projects
    let projectHTML = "";

    if (projectInput.value || projectDescInput.value) {

        projectHTML += `
        <p>
        <b>${projectInput.value}</b><br>
        ${projectDescInput.value}
        </p>`;
    }

    projectData.forEach(item => {

        projectHTML += `
        <p class="mt-3">
        <b>${item.name}</b><br>
        ${item.desc}
        </p>`;

    });

    previewProject.innerHTML =
        projectHTML || "Your projects will appear here.";

}

// ===============================
// Profile Photo
// ===============================

photoInput.addEventListener("change", function () {

    const file = this.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (e) {

        previewPhoto.src = e.target.result;

        previewPhoto.classList.remove("hidden");

    };

    reader.readAsDataURL(file);

});

// ===============================
// Live Preview
// ===============================

const liveInputs = document.querySelectorAll(
"input, textarea"
);

liveInputs.forEach(input => {

    input.addEventListener("input", generateResume);

});

// ===============================
// Add Education
// ===============================

document.getElementById("addEducation").addEventListener("click", () => {

    if (
        collegeInput.value.trim() === "" ||
        degreeInput.value.trim() === ""
    ) {
        alert("Please enter education details.");
        return;
    }

    educationData.push({

        college: collegeInput.value,
        degree: degreeInput.value,
        year: yearInput.value

    });

    collegeInput.value = "";
    degreeInput.value = "";
    yearInput.value = "";

    generateResume();

});

// ===============================
// Add Experience
// ===============================

document.getElementById("addExperience").addEventListener("click", () => {

    if (
        companyInput.value.trim() === "" ||
        jobInput.value.trim() === ""
    ) {
        alert("Please enter experience details.");
        return;
    }

    experienceData.push({

        company: companyInput.value,
        job: jobInput.value,
        duration: durationInput.value

    });

    companyInput.value = "";
    jobInput.value = "";
    durationInput.value = "";

    generateResume();

});

// ===============================
// Add Project
// ===============================

document.getElementById("addProject").addEventListener("click", () => {

    if (
        projectInput.value.trim() === "" ||
        projectDescInput.value.trim() === ""
    ) {
        alert("Please enter project details.");
        return;
    }

    projectData.push({

        name: projectInput.value,
        desc: projectDescInput.value

    });

    projectInput.value = "";
    projectDescInput.value = "";

    generateResume();

});

// ===============================
// Auto Save
// ===============================

const allFields = document.querySelectorAll("input, textarea, select");

allFields.forEach(field => {

    field.addEventListener("input", () => {

        if (field.type !== "file") {

            localStorage.setItem(field.id, field.value);

        }

    });

});

// ===============================
// Load Saved Data
// ===============================

function loadSavedData() {

    allFields.forEach(field => {

        if (field.type === "file") return;

        const saved = localStorage.getItem(field.id);

        if (saved !== null) {

            field.value = saved;

        }

    });

}

// ===============================
// Resume Templates
// ===============================

document.getElementById("template").addEventListener("change", changeTemplate);

function changeTemplate() {

    const template = document.getElementById("template").value;

    const resume = document.getElementById("resumePreview");

    resume.style.background = "#ffffff";
    resume.style.color = "#111827";
    resume.style.borderTop = "8px solid #2563eb";

    if (template === "professional") {

        resume.style.borderTop = "8px solid #111827";

    }

    else if (template === "creative") {

        resume.style.background = "#fff8e7";
        resume.style.color = "#7c2d12";
        resume.style.borderTop = "8px solid orange";

    }

}

// ===============================
// First Load
// ===============================

window.addEventListener("load", () => {

    loadSavedData();

    changeTemplate();

    generateResume();

});

// ===============================
// Download PDF (Mobile Optimized)
// ===============================

async function downloadPDF() {

    generateResume();

    const resume = document.getElementById("resumePreview");

    const { jsPDF } = window.jspdf;

    try {

        const canvas = await html2canvas(resume, {

            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
            scrollX: 0,
            scrollY: -window.scrollY

        });

        const imgData = canvas.toDataURL("image/jpeg", 1.0);

        const pdf = new jsPDF("p", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();

        const pdfHeight = pdf.internal.pageSize.getHeight();

        const imgWidth = pdfWidth;

        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;

        let position = 0;

        pdf.addImage(
            imgData,
            "JPEG",
            0,
            position,
            imgWidth,
            imgHeight
        );

        heightLeft -= pdfHeight;

        while (heightLeft > 0) {

            position = heightLeft - imgHeight;

            pdf.addPage();

            pdf.addImage(
                imgData,
                "JPEG",
                0,
                position,
                imgWidth,
                imgHeight
            );

            heightLeft -= pdfHeight;

        }

        pdf.save("Resume.pdf");

    }

    catch (error) {

        console.error(error);

        alert("Unable to generate PDF.");

    }

}

// ===============================
// Print Resume
// ===============================

function printResume() {

    generateResume();

    const printContents =
        document.getElementById("resumePreview").innerHTML;

    const printWindow = window.open("", "_blank");

    printWindow.document.write(`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>Resume</title>

<style>

body{

margin:0;
padding:20px;
font-family:Arial,sans-serif;
background:#ffffff;

}

#resume{

width:210mm;
min-height:297mm;
margin:auto;
padding:20mm;
background:#ffffff;
color:#000000;

}

img{

max-width:120px;
border-radius:50%;

}

h1{

margin-bottom:5px;

}

h2{

border-bottom:2px solid #2563eb;
padding-bottom:5px;
margin-top:20px;

}

</style>

</head>

<body>

<div id="resume">

${printContents}

</div>

</body>

</html>
`);

    printWindow.document.close();

    printWindow.onload = () => {

        setTimeout(() => {

            printWindow.focus();

            printWindow.print();

            printWindow.close();

        }, 800);

    };

}

// ===============================
// Final Initialization
// ===============================

window.addEventListener("load", () => {

    loadSavedData();

    changeTemplate();

    generateResume();

});

// ===============================
// Console
// ===============================

console.log("✅ ToolHub AI Resume Builder Loaded");