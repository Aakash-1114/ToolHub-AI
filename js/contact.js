/* ===========================================
   TOOLHUB AI — CONTACT FORM
   No backend: builds a pre-filled mailto: link so the
   visitor's own email client sends the message.
=========================================== */

const CONTACT_EMAIL = "hello@toolhubai.app";

document.getElementById("contactForm").addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("cName").value.trim();
    const email = document.getElementById("cEmail").value.trim();
    const topic = document.getElementById("cTopic").value;
    const message = document.getElementById("cMessage").value.trim();

    if (!name || !email || !message) return;

    const subject = `[ToolHub AI] ${topic} from ${name}`;
    const body = `${message}\n\n— ${name} (${email})`;

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;

    const successBox = document.getElementById("formSuccess");
    successBox.classList.add("show");
    setTimeout(() => successBox.classList.remove("show"), 6000);
});