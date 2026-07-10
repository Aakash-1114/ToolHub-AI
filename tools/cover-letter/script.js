function generateLetter() {

    const name = document.getElementById("name").value.trim();
    const company = document.getElementById("company").value.trim();
    const job = document.getElementById("job").value.trim();
    const skills = document.getElementById("skills").value.trim();
    const template = document.getElementById("template").value;

    if (!name || !company || !job || !skills) {
        alert("Please fill all fields.");
        return;
    }

    let letter = "";

    if (template === "professional") {

        letter = `Dear Hiring Manager,

I am writing to express my interest in the ${job} position at ${company}.

My name is ${name}, and I possess strong skills in ${skills}. I am passionate about learning, solving problems, and contributing to a professional team.

I believe my dedication, adaptability, and willingness to learn make me a strong candidate for this role. I would welcome the opportunity to discuss how I can contribute to ${company}.

Thank you for your time and consideration.

Sincerely,

${name}`;

    }

    else if (template === "modern") {

        letter = `Hello Hiring Team,

I'm ${name}, and I'm excited to apply for the ${job} role at ${company}.

With experience in ${skills}, I enjoy creating practical solutions and continuously improving my skills. I would love the opportunity to bring my energy and creativity to your team.

Thank you for considering my application. I look forward to hearing from you.

Best Regards,

${name}`;

    }

    else {

        letter = `Dear Sir/Madam,

Please accept my application for the ${job} position at ${company}.

I have knowledge of ${skills} and am eager to contribute while learning from your organization.

Thank you for your valuable time.

Yours faithfully,

${name}`;

    }

    document.getElementById("previewLetter").textContent = letter;

    const text = letter.trim();

    document.getElementById("wordCount").textContent =
        text.split(/\s+/).length;

    document.getElementById("charCount").textContent =
        text.length;

}

function downloadPDF() {

    const element = document.getElementById("letterPreview");

    const options = {
        margin: 0.5,
        filename: "Cover-Letter.pdf",
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
    };

    html2pdf().set(options).from(element).save();

}

function copyLetter() {

    const letter =
        document.getElementById("previewLetter").textContent;

    navigator.clipboard.writeText(letter);

    alert("✅ Cover Letter copied successfully!");

}

function clearForm() {

    document.getElementById("name").value = "";
    document.getElementById("company").value = "";
    document.getElementById("job").value = "";
    document.getElementById("skills").value = "";

    document.getElementById("previewLetter").textContent =
        "Your cover letter will appear here...";

}

function printLetter() {

    const content = document.getElementById("letterPreview").innerHTML;

    const printWindow = window.open("", "", "width=900,height=700");

    printWindow.document.write(`
        <html>
        <head>
            <title>Cover Letter</title>
            <style>
                body{
                    font-family:Arial,sans-serif;
                    padding:40px;
                    line-height:1.7;
                }
            </style>
        </head>

        <body>

            ${content}

        </body>

        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    printWindow.print();

}