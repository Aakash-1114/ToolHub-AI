function generateResume() {

    // // Validation

    // const name = document.getElementById("name").value.trim();
    // const email = document.getElementById("email").value.trim();
    // const phone = document.getElementById("phone").value.trim();

    // if (name === "") {
    //     alert("Please enter your Full Name");
    //     return;
    // }

    // if (email === "") {
    //     alert("Please enter your Email");
    //     return;
    // }

    // if (phone === "") {
    //     alert("Please enter your Phone Number");
    //     return;
    // }

    // Input Values
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const summary = document.getElementById("summary").value;
    const skills = document.getElementById("skills").value;
    const linkedin = document.getElementById("linkedin").value;
    const github = document.getElementById("github").value;
    const certificate = document.getElementById("certificate").value;
    const languages = document.getElementById("languages").value;
    const college = document.getElementById("college").value;
    const degree = document.getElementById("degree").value;
    const year = document.getElementById("year").value;
    const company = document.getElementById("company").value;
    const job = document.getElementById("job").value;
    const duration = document.getElementById("duration").value;
    const project = document.getElementById("project").value;
    const projectDesc = document.getElementById("projectDesc").value;

    let educationHTML = `${degree} - ${college} (${year} ) `;

    const extraEducation =
        document.querySelectorAll("#educationList > div");

    extraEducation.forEach(item => {

        const inputs = item.querySelectorAll("input");

        educationHTML += `< br > <br>
        ${inputs[1].value} - ${inputs[0].value} (${inputs[2].value})`;

    });

    document.getElementById("previewEducation").innerHTML =
        educationHTML;

    let experienceHTML = `${job} - ${company} (${duration})`;

    const extraExperience =
        document.querySelectorAll("#experienceList > div");

    extraExperience.forEach(item => {

        const inputs = item.querySelectorAll("input");

        experienceHTML += `<br><br>
            ${inputs[1].value} - ${inputs[0].value} (${inputs[2].value})`;

    });

    document.getElementById("previewExperience").innerHTML =
        experienceHTML;

    let projectHTML = `<b>${project}</b><br>${projectDesc}`;

    const extraProjects =
        document.querySelectorAll("#projectList > div");

    extraProjects.forEach(item => {

        const inputs = item.querySelectorAll("input, textarea");

        projectHTML += `<br><br><b>${inputs[0].value}</b><br>${inputs[1].value}`;

    });

    document.getElementById("previewProject").innerHTML =
        projectHTML;

    document.getElementById("previewSummary").textContent =
        summary || "Your professional summary will appear here.";

    // Preview Update
    document.getElementById("previewName").textContent =
        name || "Your Name";

    document.getElementById("previewEmail").textContent =
        email || "email@example.com";

    document.getElementById("previewPhone").textContent =
        phone || "+91 XXXXX XXXXX";

    document.getElementById("previewSummary").textContent =
        summary || "Your professional summary will appear here.";

    // Skills
    if (skills.trim() === "") {
        document.getElementById("previewSkills").textContent =
            "HTML, CSS, JavaScript";
    } else {
        document.getElementById("previewSkills").textContent = skills;
    }
    document.getElementById("previewLinkedin").textContent =
        linkedin || "Not Added";

    document.getElementById("previewGithub").textContent =
        github || "Not Added";

    document.getElementById("previewCertificate").textContent =
        certificate || "Not Added";

    document.getElementById("previewLanguages").textContent =
        languages || "Not Added";
}

// Photo Preview
document.getElementById("photo").addEventListener("change", function () {

    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {

        document.getElementById("previewPhoto").src = e.target.result;
    };
    reader.readAsDataURL(file);
});
function downloadPDF() {

    const element = document.getElementById("resumePreview");

    html2pdf()
        .from(element)
        .set({
            margin: 0.5,
            filename: "Resume.pdf",
            image: {
                type: "jpeg",
                quality: 1
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: "in",
                format: "a4",
                orientation: "portrait"
            }
        })
        .save();
}

function printResume() {

    const printContents = document.getElementById("resumePreview").innerHTML;

    const newWindow = window.open("", "", "width=900,height=700");

    newWindow.document.write(`
        <html>
        <head>
            <title>Print Resume</title>
        </head>
        <body>
            ${printContents}
        </body>
        </html>
    `);

    newWindow.document.close();
    newWindow.focus();
    newWindow.print();
    newWindow.close();
}

function changeTemplate() {

    const template = document.getElementById("template").value;

    const resume = document.getElementById("resumePreview");

    if (template === "modern") {

        resume.style.background = "white";
        resume.style.color = "black";
        resume.style.borderTop = "10px solid #2563eb";

    }

    else if (template === "professional") {

        resume.style.background = "#ffffff";
        resume.style.color = "#111827";
        resume.style.borderTop = "10px solid black";

    }

    else if (template === "creative") {

        resume.style.background = "#fef3c7";
        resume.style.color = "#7c2d12";
        resume.style.borderTop = "10px solid orange";

    }
}

let educationCount = 0;

document.getElementById("addEducation").addEventListener("click", function () {

    educationCount++;

    const div = document.createElement("div");

    div.className = "mt-4";

    div.innerHTML = `
            <input
                type="text"
                placeholder="College / University ${educationCount}"
                class="w-full p-3 mb-2 rounded bg-slate-900">

                <input
                    type="text"
                    placeholder="Degree ${educationCount}"
                    class="w-full p-3 mb-2 rounded bg-slate-900">

                    <input
                        type="text"
                        placeholder="Passing Year ${educationCount}"
                        class="w-full p-3 mb-4 rounded bg-slate-900">
                        `;

    document.getElementById("educationList").appendChild(div);

});

let experienceCount = 0;

document.getElementById("addExperience").addEventListener("click", function () {

    experienceCount++;

    const div = document.createElement("div");

    div.className = "mt-4";

    div.innerHTML = `
                        <input
                            type="text"
                            placeholder="Company ${experienceCount}"
                            class="w-full p-3 mb-2 rounded bg-slate-900">

                            <input
                                type="text"
                                placeholder="Job Title ${experienceCount}"
                                class="w-full p-3 mb-2 rounded bg-slate-900">

                                <input
                                    type="text"
                                    placeholder="Duration ${experienceCount}"
                                    class="w-full p-3 mb-4 rounded bg-slate-900">
                                    `;

    document.getElementById("experienceList").appendChild(div);

});

let projectCount = 0;

document.getElementById("addProject").addEventListener("click", function () {

    projectCount++;

    const div = document.createElement("div");

    div.className = "mt-4";

    div.innerHTML = `
        <input
        type="text"
        placeholder="Project Name ${projectCount}"
        class="w-full p-3 mb-2 rounded bg-slate-900">

        <textarea
        placeholder="Project Description ${projectCount}"
        class="w-full p-3 mb-4 rounded bg-slate-900 h-24"></textarea>
    `;

    document.getElementById("projectList").appendChild(div);

});

// =======================
// AUTO SAVE
// =======================

const fields = document.querySelectorAll("input, textarea, select");

fields.forEach(field => {

    field.addEventListener("input", () => {

        localStorage.setItem(field.id, field.value);

    });

});

// =======================
// LOAD SAVED DATA
// =======================

window.onload = function () {

    fields.forEach(field => {

        const saved = localStorage.getItem(field.id);

        if (saved !== null) {

            field.value = saved;

        }

    });

    generateResume();

};