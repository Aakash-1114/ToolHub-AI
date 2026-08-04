/* ===========================================
   TOOLHUB AI — COVER LETTER GENERATOR
=========================================== */

const FIELD_IDS = ["fullName", "email", "phone", "address", "linkedin", "jobTitle", "companyName", "hiringManager", "companyAddress", "letterDate", "salutation", "opening", "body", "closing"];

const EXAMPLES = {
    opening: "I am excited to apply for the [Job Title] position at [Company Name]. With [X years] of experience in [your field], I was drawn to this role because [specific reason tied to the company or team].",
    body: "In my current role at [Current Company], I [a specific achievement, ideally with a number — e.g. \"led a redesign that improved conversion by 18%\"]. I bring strong skills in [key skill 1] and [key skill 2], along with a track record of [a strength relevant to this role]. I'm confident these experiences would translate well to the challenges of this position.",
    closing: "I would welcome the opportunity to discuss how my background aligns with your team's goals. Thank you for taking the time to consider my application — I look forward to hearing from you."
};

/* ---------- State ---------- */

let letterData = defaultLetterData();
let template = "modern";
let accentColor = "#2563eb";
let salutationTouched = false;

function defaultLetterData() {
    const today = new Date();
    const dateStr = today.toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" });
    const d = {};
    FIELD_IDS.forEach(id => d[id] = "");
    d.letterDate = dateStr;
    d.salutation = "Dear Hiring Manager,";
    return d;
}

/* ---------- Helpers ---------- */

function escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ===========================================
   PERSISTENCE
=========================================== */

const STORAGE_KEYS = { data: "toolhub-coverletter-data", template: "toolhub-coverletter-template", color: "toolhub-coverletter-color" };

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.data);
        if (raw) letterData = { ...defaultLetterData(), ...JSON.parse(raw) };
        template = localStorage.getItem(STORAGE_KEYS.template) || "modern";
        accentColor = localStorage.getItem(STORAGE_KEYS.color) || "#2563eb";
    } catch (err) {
        console.error(err);
        letterData = defaultLetterData();
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(letterData));
        localStorage.setItem(STORAGE_KEYS.template, template);
        localStorage.setItem(STORAGE_KEYS.color, accentColor);
        setSaveStatus("saved");
    } catch (err) {
        console.error(err);
        setSaveStatus("error");
    }
}

const scheduleSave = debounce(saveToStorage, 500);

function onDataChange() {
    setSaveStatus("saving");
    scheduleSave();
}

function setSaveStatus(state) {
    const el = document.getElementById("saveStatus");
    if (state === "saving") {
        el.className = "save-status saving";
        el.innerHTML = '<i class="fa-solid fa-rotate"></i> Saving…';
    } else if (state === "error") {
        el.className = "save-status";
        el.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Not saved';
    } else {
        el.className = "save-status saved";
        el.innerHTML = '<i class="fa-solid fa-cloud"></i> Saved';
    }
}

/* ===========================================
   FORM BINDING
=========================================== */

function bindFields() {
    FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", () => {
            letterData[id] = el.value;
            if (id === "salutation") salutationTouched = true;
            if (id === "hiringManager" && !salutationTouched) {
                const auto = letterData.hiringManager.trim()
                    ? `Dear ${letterData.hiringManager.trim()},`
                    : "Dear Hiring Manager,";
                letterData.salutation = auto;
                document.getElementById("salutation").value = auto;
            }
            schedulePreviewUpdate();
            onDataChange();
        });
    });

    document.getElementById("signOff").addEventListener("change", (e) => {
        letterData.signOff = e.target.value;
        schedulePreviewUpdate();
        onDataChange();
    });
}

function renderForm() {
    FIELD_IDS.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = letterData[id] || "";
    });
    const signOffEl = document.getElementById("signOff");
    if (letterData.signOff) signOffEl.value = letterData.signOff;
    else letterData.signOff = signOffEl.value;
}

/* ---------- Example text buttons ---------- */

function bindExampleButtons() {
    document.querySelectorAll(".example-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.example;
            const textarea = document.getElementById(key);
            textarea.value = EXAMPLES[key];
            letterData[key] = EXAMPLES[key];
            schedulePreviewUpdate();
            onDataChange();
        });
    });
}

/* ===========================================
   PREVIEW RENDERING
=========================================== */

const schedulePreviewUpdate = debounce(renderPreview, 100);

function renderPreview() {

    const el = document.getElementById("letterPreview");
    el.className = "letter " + template;
    el.style.setProperty("--letter-accent", accentColor);

    const d = letterData;
    const hasAnything = d.fullName || d.opening || d.body || d.closing || d.companyName;

    if (!hasAnything) {
        el.innerHTML = `
            <div class="letter-empty">
                <i class="fa-solid fa-envelope-open-text"></i>
                <h3>Your cover letter preview will appear here</h3>
                <p>Start filling the form to see it come alive.</p>
            </div>`;
        requestAnimationFrame(scalePreview);
        return;
    }

    const contactParts = [
        d.email ? `<span><i class="fa-solid fa-envelope"></i>${escapeHtml(d.email)}</span>` : "",
        d.phone ? `<span><i class="fa-solid fa-phone"></i>${escapeHtml(d.phone)}</span>` : "",
        d.address ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(d.address)}</span>` : "",
        d.linkedin ? `<span><i class="fa-solid fa-link"></i>${escapeHtml(d.linkedin)}</span>` : ""
    ].filter(Boolean).join("");

    let html = `
        <div class="sender-block">
            <div class="sender-name">${escapeHtml(d.fullName) || "Your Name"}</div>
            <div class="sender-contact">${contactParts}</div>
        </div>
        <hr class="letter-rule">
        <div class="letter-date">${escapeHtml(d.letterDate)}</div>
        <div class="recipient-block">
            ${d.hiringManager ? `<div>${escapeHtml(d.hiringManager)}</div>` : ""}
            ${d.companyName ? `<div class="company-name">${escapeHtml(d.companyName)}</div>` : ""}
            ${d.companyAddress ? `<div>${escapeHtml(d.companyAddress)}</div>` : ""}
        </div>
        <div class="salutation">${escapeHtml(d.salutation)}</div>
        <div class="letter-body">
            ${d.opening ? `<p>${escapeHtml(d.opening)}</p>` : ""}
            ${d.body ? `<p>${escapeHtml(d.body)}</p>` : ""}
            ${d.closing ? `<p>${escapeHtml(d.closing)}</p>` : ""}
        </div>
        <div class="signoff-block">
            <div class="signoff-line">${escapeHtml(d.signOff || "Sincerely,")}</div>
            <div class="signoff-name">${escapeHtml(d.fullName) || "Your Name"}</div>
        </div>`;

    el.innerHTML = html;
    requestAnimationFrame(scalePreview);
}

function scalePreview() {
    const wrap = document.querySelector(".preview-scale-wrap");
    const letterEl = document.getElementById("letterPreview");
    const panel = document.getElementById("previewPanel");
    if (!wrap || !letterEl || !panel) return;

    const naturalWidth = letterEl.scrollWidth;
    const naturalHeight = letterEl.scrollHeight;
    if (!naturalWidth || !naturalHeight) return;

    const available = panel.clientWidth - 40;
    const scale = Math.min(1, available / naturalWidth);

    wrap.style.transform = `scale(${scale})`;
    wrap.style.width = naturalWidth + "px";
    wrap.style.height = (naturalHeight * scale) + "px";
}

/* ===========================================
   TEMPLATE + COLOR SWITCH
=========================================== */

function bindDesignControls() {
    document.querySelectorAll(".template-swatch").forEach(btn => {
        btn.addEventListener("click", () => {
            template = btn.dataset.template;
            document.querySelectorAll(".template-swatch").forEach(b => b.classList.toggle("active", b === btn));
            renderPreview();
            onDataChange();
        });
    });

    document.querySelectorAll(".color-dot").forEach(btn => {
        btn.addEventListener("click", () => {
            accentColor = btn.dataset.color;
            document.querySelectorAll(".color-dot").forEach(b => b.classList.toggle("active", b === btn));
            renderPreview();
            onDataChange();
        });
    });
}

function syncDesignControlsUI() {
    document.querySelectorAll(".template-swatch").forEach(b => b.classList.toggle("active", b.dataset.template === template));
    document.querySelectorAll(".color-dot").forEach(b => b.classList.toggle("active", b.dataset.color === accentColor));
}

/* ===========================================
   MOBILE TABS
=========================================== */

function bindMobileTabs() {
    const layout = document.querySelector(".layout");
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.toggle("active", b === btn));
            layout.dataset.activeTab = btn.dataset.tab;
            if (btn.dataset.tab === "preview") requestAnimationFrame(scalePreview);
        });
    });
}

/* ===========================================
   CLEAR ALL
=========================================== */

function bindClearAll() {
    document.getElementById("clearAllBtn").addEventListener("click", () => {
        if (!confirm("Clear all cover letter data? This can't be undone.")) return;
        letterData = defaultLetterData();
        salutationTouched = false;
        renderForm();
        renderPreview();
        onDataChange();
        showToast("All data cleared");
    });
}

/* ===========================================
   TOAST / LOADER
=========================================== */

let toastTimer = null;

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function showLoader() { document.getElementById("loadingOverlay").style.display = "flex"; }
function hideLoader() { document.getElementById("loadingOverlay").style.display = "none"; }

/* ===========================================
   PDF GENERATION
=========================================== */

async function generatePDF() {

    const d = letterData;
    if (!d.fullName && !d.opening && !d.body) {
        showToast("Add a few details before downloading", true);
        return;
    }

    showLoader();
    await new Promise(r => setTimeout(r, 30));

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "mm", format: "a4" });

        const pageW = 210, pageH = 297;
        const marginX = 22, marginTop = 25, marginBottom = 20;
        const contentW = pageW - marginX * 2;
        let y = marginTop;

        const isClassic = template === "classic";
        const font = isClassic ? "times" : "helvetica";
        const [ar, ag, ab] = hexToRgb(accentColor);
        const dark = [15, 23, 42];
        const gray = [71, 85, 105];
        const body = [51, 65, 85];

        function checkPage(need) {
            if (y + need > pageH - marginBottom) {
                pdf.addPage();
                y = marginTop;
            }
        }

        function setColor(c) { pdf.setTextColor(c[0], c[1], c[2]); }

        function paragraph(text, size = 11, color = body, lineHeight = 5.6) {
            pdf.setFont(font, "normal");
            pdf.setFontSize(size);
            setColor(color);
            pdf.splitTextToSize(text, contentW).forEach(line => {
                checkPage(lineHeight);
                pdf.text(line, marginX, y);
                y += lineHeight;
            });
        }

        /* ---- Sender header ---- */

        const nameText = d.fullName || "Your Name";
        const nameAlign = isClassic ? "center" : "left";
        const nameX = isClassic ? pageW / 2 : marginX;

        pdf.setFont(font, "bold");
        pdf.setFontSize(17);
        setColor(dark);
        pdf.text(isClassic ? nameText.toUpperCase() : nameText, nameX, y, { align: nameAlign });
        y += 6.5;

        const contactParts = [d.email, d.phone, d.address, d.linkedin].filter(Boolean);
        if (contactParts.length) {
            pdf.setFont(font, "normal");
            pdf.setFontSize(9.5);
            setColor(gray);
            const line = contactParts.join("   •   ");
            pdf.splitTextToSize(line, contentW).forEach(l => {
                pdf.text(l, nameX, y, { align: nameAlign });
                y += 4.6;
            });
        }

        y += 3;
        pdf.setDrawColor(isClassic ? 15 : ar, isClassic ? 23 : ag, isClassic ? 42 : ab);
        pdf.setLineWidth(isClassic ? 0.3 : 0.8);
        pdf.line(marginX, y, pageW - marginX, y);
        y += 10;

        /* ---- Date ---- */
        paragraph(d.letterDate || "", 10.5, body, 5.2);
        y += 4;

        /* ---- Recipient block ---- */
        if (d.hiringManager) paragraph(d.hiringManager, 10.5, body, 5.2);
        if (d.companyName) {
            pdf.setFont(font, "bold");
            pdf.setFontSize(10.5);
            setColor(dark);
            checkPage(5.2);
            pdf.text(d.companyName, marginX, y);
            y += 5.2;
        }
        if (d.companyAddress) paragraph(d.companyAddress, 10.5, body, 5.2);
        y += 6;

        /* ---- Salutation ---- */
        paragraph(d.salutation || "Dear Hiring Manager,", 11, dark, 5.6);
        y += 4;

        /* ---- Body paragraphs ---- */
        [d.opening, d.body, d.closing].filter(Boolean).forEach(p => {
            paragraph(p, 11, body, 5.6);
            y += 4;
        });

        /* ---- Sign-off ---- */
        y += 6;
        paragraph(d.signOff || "Sincerely,", 11, body, 5.6);
        y += 12;
        pdf.setFont(font, "bold");
        pdf.setFontSize(11);
        setColor(dark);
        checkPage(6);
        pdf.text(d.fullName || "Your Name", marginX, y);

        const fileName = (d.fullName ? d.fullName.trim().replace(/\s+/g, "_") : "Cover_Letter") + "_Cover_Letter.pdf";
        pdf.save(fileName);
        showToast("Cover letter downloaded");

    } catch (err) {
        console.error(err);
        showToast("Something went wrong generating the PDF", true);
    } finally {
        hideLoader();
    }
}

/* ===========================================
   STARTUP
=========================================== */

function init() {
    loadFromStorage();
    salutationTouched = true; // don't auto-overwrite a salutation restored from storage

    renderForm();
    bindFields();
    bindExampleButtons();

    bindDesignControls();
    syncDesignControlsUI();

    bindMobileTabs();
    document.querySelector(".layout").dataset.activeTab = "edit";

    bindClearAll();
    document.getElementById("downloadBtn").addEventListener("click", generatePDF);

    renderPreview();
    setSaveStatus("saved");

    window.addEventListener("resize", debounce(scalePreview, 150));
}

init();