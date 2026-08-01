/* ===========================================
   TOOLHUB AI — RESUME BUILDER
=========================================== */

/* ---------- Repeater section config ---------- */

const SECTIONS = {
    experience: {
        listId: "experienceList", emptyId: "experienceEmpty", addBtnId: "addExperience",
        fields: [
            { key: "company", label: "Company", placeholder: "Google" },
            { key: "role", label: "Role", placeholder: "Senior Product Designer" },
            { key: "location", label: "Location", placeholder: "Bengaluru, India" },
            { key: "start", label: "Start", placeholder: "Jan 2022" },
            { key: "end", label: "End", placeholder: "Present" },
            { key: "bullets", label: "Highlights (one per line)", type: "textarea", full: true,
              placeholder: "Led a team of 5 designers to ship a redesign\nImproved conversion rate by 18%" }
        ],
        titleFn: item => [item.company, item.role].filter(Boolean).join(" — ") || "New experience"
    },
    education: {
        listId: "educationList", emptyId: "educationEmpty", addBtnId: "addEducation",
        fields: [
            { key: "school", label: "School", placeholder: "IIT Bombay" },
            { key: "degree", label: "Degree", placeholder: "B.Tech, Computer Science" },
            { key: "location", label: "Location", placeholder: "Mumbai, India" },
            { key: "start", label: "Start", placeholder: "2018" },
            { key: "end", label: "End", placeholder: "2022" },
            { key: "gpa", label: "GPA (optional)", placeholder: "8.7 / 10" }
        ],
        titleFn: item => [item.school, item.degree].filter(Boolean).join(" — ") || "New education"
    },
    projects: {
        listId: "projectsList", emptyId: null, addBtnId: "addProject",
        fields: [
            { key: "name", label: "Project Name", placeholder: "ToolHub AI" },
            { key: "tech", label: "Tech Used", placeholder: "React, Node.js" },
            { key: "link", label: "Link", placeholder: "github.com/you/project" },
            { key: "description", label: "Description (one point per line)", type: "textarea", full: true,
              placeholder: "Built a tool that..." }
        ],
        titleFn: item => item.name || "New project"
    },
    certifications: {
        listId: "certificationsList", emptyId: null, addBtnId: "addCertification",
        fields: [
            { key: "name", label: "Certification", placeholder: "AWS Certified Solutions Architect" },
            { key: "issuer", label: "Issued By", placeholder: "Amazon Web Services" },
            { key: "year", label: "Year", placeholder: "2024" }
        ],
        titleFn: item => item.name || "New certification"
    },
    languages: {
        listId: "languagesList", emptyId: null, addBtnId: "addLanguage",
        fields: [
            { key: "name", label: "Language", placeholder: "English" },
            { key: "level", label: "Level", type: "select", options: ["Basic", "Conversational", "Fluent", "Native"] }
        ],
        titleFn: item => item.name || "New language"
    }
};

const PERSONAL_FIELDS = ["fullName", "jobTitle", "email", "phone", "location", "website"];

/* ---------- State ---------- */

let resumeData = defaultResumeData();
let template = "modern";
let accentColor = "#2563eb";

function defaultResumeData() {
    return {
        personal: { fullName: "", jobTitle: "", email: "", phone: "", location: "", website: "", summary: "" },
        experience: [], education: [], skills: [], projects: [], certifications: [], languages: []
    };
}

function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : Date.now() + "-" + Math.random().toString(16).slice(2);
}

/* ---------- Helpers ---------- */

function escapeHtml(str) {
    if (str == null) return "";
    const div = document.createElement("div");
    div.textContent = String(str);
    return div.innerHTML;
}

function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, "&quot;");
}

function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

function hexToRgb(hex) {
    const n = parseInt(hex.replace("#", ""), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/* ===========================================
   PERSISTENCE
=========================================== */

const STORAGE_KEYS = { data: "toolhub-resume-data", template: "toolhub-resume-template", color: "toolhub-resume-color" };

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.data);
        if (raw) {
            const parsed = JSON.parse(raw);
            resumeData = { ...defaultResumeData(), ...parsed, personal: { ...defaultResumeData().personal, ...(parsed.personal || {}) } };
        }
        template = localStorage.getItem(STORAGE_KEYS.template) || "modern";
        accentColor = localStorage.getItem(STORAGE_KEYS.color) || "#2563eb";
    } catch (err) {
        console.error(err);
        resumeData = defaultResumeData();
    }
}

function saveToStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(resumeData));
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
   PREVIEW RENDERING
=========================================== */

const schedulePreviewUpdate = debounce(renderPreview, 100);

function renderPreview() {

    const el = document.getElementById("resumePreview");
    el.className = "resume " + template;
    el.style.setProperty("--resume-accent", accentColor);

    const p = resumeData.personal;
    const hasAnything = p.fullName || p.jobTitle || p.summary ||
        resumeData.experience.length || resumeData.education.length || resumeData.skills.length;

    if (!hasAnything) {
        el.innerHTML = `
            <div class="resume-empty">
                <i class="fa-solid fa-file-lines"></i>
                <h3>Your resume preview will appear here</h3>
                <p>Start filling the form to see it come alive.</p>
            </div>`;
        requestAnimationFrame(scalePreview);
        return;
    }

    let html = "";

    html += `<div class="resume-header">
        <h1>${escapeHtml(p.fullName) || "Your Name"}</h1>
        ${p.jobTitle ? `<div class="role">${escapeHtml(p.jobTitle)}</div>` : ""}
        <div class="contact-row">
            ${p.email ? `<span><i class="fa-solid fa-envelope"></i>${escapeHtml(p.email)}</span>` : ""}
            ${p.phone ? `<span><i class="fa-solid fa-phone"></i>${escapeHtml(p.phone)}</span>` : ""}
            ${p.location ? `<span><i class="fa-solid fa-location-dot"></i>${escapeHtml(p.location)}</span>` : ""}
            ${p.website ? `<span><i class="fa-solid fa-link"></i>${escapeHtml(p.website)}</span>` : ""}
        </div>
    </div>`;

    if (p.summary) {
        html += `<div class="section-title">Summary</div><div class="summary-text">${escapeHtml(p.summary)}</div>`;
    }

    if (resumeData.experience.length) {
        html += `<div class="section-title">Experience</div>`;
        resumeData.experience.forEach(item => {
            html += entryPreviewHTML({
                top: [item.company, item.role].filter(Boolean).join(" — "),
                dates: [item.start, item.end].filter(Boolean).join(" – "),
                sub: item.location,
                bullets: (item.bullets || "").split("\n").map(s => s.trim()).filter(Boolean)
            });
        });
    }

    if (resumeData.education.length) {
        html += `<div class="section-title">Education</div>`;
        resumeData.education.forEach(item => {
            html += entryPreviewHTML({
                top: [item.school, item.degree].filter(Boolean).join(" — "),
                dates: [item.start, item.end].filter(Boolean).join(" – "),
                sub: [item.location, item.gpa ? "GPA: " + item.gpa : ""].filter(Boolean).join(" • ")
            });
        });
    }

    if (resumeData.skills.length) {
        html += `<div class="section-title">Skills</div>`;
        html += template === "modern"
            ? `<div class="skills-row">${resumeData.skills.map(s => `<span class="skill-pill">${escapeHtml(s)}</span>`).join("")}</div>`
            : `<div class="skills-plain">${resumeData.skills.map(escapeHtml).join(" • ")}</div>`;
    }

    if (resumeData.projects.length) {
        html += `<div class="section-title">Projects</div>`;
        resumeData.projects.forEach(item => {
            html += entryPreviewHTML({
                top: [item.name, item.tech].filter(Boolean).join(" — "),
                dates: "",
                sub: item.link,
                bullets: (item.description || "").split("\n").map(s => s.trim()).filter(Boolean)
            });
        });
    }

    if (resumeData.certifications.length) {
        html += `<div class="section-title">Certifications</div>`;
        resumeData.certifications.forEach(item => {
            html += entryPreviewHTML({
                top: [item.name, item.issuer].filter(Boolean).join(" — "),
                dates: item.year || "",
                sub: ""
            });
        });
    }

    if (resumeData.languages.length) {
        html += `<div class="section-title">Languages</div>`;
        html += `<div class="skills-plain">${resumeData.languages
            .map(l => l.level ? `${escapeHtml(l.name)} (${escapeHtml(l.level)})` : escapeHtml(l.name))
            .join(" • ")}</div>`;
    }

    el.innerHTML = html;
    requestAnimationFrame(scalePreview);
}

function entryPreviewHTML({ top, dates, sub, bullets }) {
    let h = `<div class="resume-entry"><div class="entry-top"><span>${escapeHtml(top)}</span>${dates ? `<span class="entry-dates">${escapeHtml(dates)}</span>` : ""}</div>`;
    if (sub) h += `<div class="entry-sub">${escapeHtml(sub)}</div>`;
    if (bullets && bullets.length) h += `<ul class="entry-bullets">${bullets.map(b => `<li>${escapeHtml(b)}</li>`).join("")}</ul>`;
    h += `</div>`;
    return h;
}

/* Scale the A4 preview to fit its panel, and clip the scroll box to the
   scaled height so there's no dead space below the shrunk page. */

function scalePreview() {
    const wrap = document.querySelector(".preview-scale-wrap");
    const resumeEl = document.getElementById("resumePreview");
    const panel = document.getElementById("previewPanel");
    if (!wrap || !resumeEl || !panel) return;

    const naturalWidth = resumeEl.scrollWidth;
    const naturalHeight = resumeEl.scrollHeight;
    if (!naturalWidth || !naturalHeight) return;

    const available = panel.clientWidth - 40;
    const scale = Math.min(1, available / naturalWidth);

    wrap.style.transform = `scale(${scale})`;
    wrap.style.width = naturalWidth + "px";
    wrap.style.height = (naturalHeight * scale) + "px";
}

/* ===========================================
   FORM: PERSONAL + SUMMARY
=========================================== */

function bindPersonalFields() {
    PERSONAL_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener("input", () => {
            resumeData.personal[id] = el.value;
            schedulePreviewUpdate();
            onDataChange();
        });
    });

    const summary = document.getElementById("summary");
    summary.addEventListener("input", () => {
        resumeData.personal.summary = summary.value;
        schedulePreviewUpdate();
        onDataChange();
    });
}

function renderPersonalForm() {
    PERSONAL_FIELDS.forEach(id => {
        document.getElementById(id).value = resumeData.personal[id] || "";
    });
    document.getElementById("summary").value = resumeData.personal.summary || "";
}

/* ===========================================
   REPEATER SECTIONS (experience, education, projects, certifications, languages)
=========================================== */

function newEntry(section) {
    const cfg = SECTIONS[section];
    const obj = { id: uid() };
    cfg.fields.forEach(f => { obj[f.key] = f.type === "select" ? (f.options[0] || "") : ""; });
    return obj;
}

function fieldHTML(f, item) {
    const wrapClass = f.full ? "field full" : "field";
    if (f.type === "textarea") {
        return `<div class="${wrapClass}"><label>${f.label}</label><textarea data-field="${f.key}" rows="3" placeholder="${escapeAttr(f.placeholder || "")}">${escapeHtml(item[f.key] || "")}</textarea></div>`;
    }
    if (f.type === "select") {
        const opts = f.options.map(o => `<option value="${escapeAttr(o)}" ${item[f.key] === o ? "selected" : ""}>${escapeHtml(o)}</option>`).join("");
        return `<div class="${wrapClass}"><label>${f.label}</label><select data-field="${f.key}">${opts}</select></div>`;
    }
    return `<div class="${wrapClass}"><label>${f.label}</label><input type="text" data-field="${f.key}" placeholder="${escapeAttr(f.placeholder || "")}" value="${escapeAttr(item[f.key] || "")}"></div>`;
}

function entryCardHTML(section, item) {
    const cfg = SECTIONS[section];
    const fieldsHtml = cfg.fields.map(f => fieldHTML(f, item)).join("");
    return `
    <div class="entry-card" data-id="${item.id}">
        <div class="entry-head">
            <span class="drag-handle" title="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span>
            <span class="entry-title">${escapeHtml(cfg.titleFn(item))}</span>
            <button type="button" class="entry-delete" data-remove="${item.id}" aria-label="Remove"><i class="fa-solid fa-trash"></i></button>
        </div>
        <div class="field-grid">${fieldsHtml}</div>
    </div>`;
}

function renderRepeater(section) {
    const cfg = SECTIONS[section];
    const list = document.getElementById(cfg.listId);
    list.innerHTML = resumeData[section].map(item => entryCardHTML(section, item)).join("");
    if (cfg.emptyId) {
        const emptyEl = document.getElementById(cfg.emptyId);
        if (emptyEl) emptyEl.style.display = resumeData[section].length ? "none" : "block";
    }
}

function bindRepeaterEvents(section) {
    const cfg = SECTIONS[section];
    const list = document.getElementById(cfg.listId);

    list.addEventListener("input", (e) => {
        const field = e.target.dataset.field;
        if (!field) return;
        const card = e.target.closest(".entry-card");
        const item = resumeData[section].find(i => i.id === card.dataset.id);
        if (!item) return;
        item[field] = e.target.value;
        const titleEl = card.querySelector(".entry-title");
        if (titleEl) titleEl.textContent = cfg.titleFn(item);
        schedulePreviewUpdate();
        onDataChange();
    });

    list.addEventListener("click", (e) => {
        const removeBtn = e.target.closest("[data-remove]");
        if (!removeBtn) return;
        resumeData[section] = resumeData[section].filter(i => i.id !== removeBtn.dataset.remove);
        renderRepeater(section);
        schedulePreviewUpdate();
        onDataChange();
    });

    document.getElementById(cfg.addBtnId).addEventListener("click", () => {
        resumeData[section].push(newEntry(section));
        renderRepeater(section);
        schedulePreviewUpdate();
        onDataChange();
        const cards = list.querySelectorAll(".entry-card");
        const last = cards[cards.length - 1];
        if (last) last.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    Sortable.create(list, {
        animation: 200,
        handle: ".drag-handle",
        ghostClass: "sortable-ghost",
        onEnd: () => {
            const order = [...list.querySelectorAll(".entry-card")].map(c => c.dataset.id);
            resumeData[section].sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
            schedulePreviewUpdate();
            onDataChange();
        }
    });
}

/* select's native "change" re-triggers our input handler above via a
   synthetic bubbling input event isn't reliable across browsers, so
   handle select updates directly instead: */
function patchSelectHandling(section) {
    const cfg = SECTIONS[section];
    const list = document.getElementById(cfg.listId);
    list.addEventListener("change", (e) => {
        if (e.target.tagName !== "SELECT") return;
        const field = e.target.dataset.field;
        const card = e.target.closest(".entry-card");
        const item = resumeData[section].find(i => i.id === card.dataset.id);
        if (!item) return;
        item[field] = e.target.value;
        schedulePreviewUpdate();
        onDataChange();
    });
}

/* ===========================================
   SKILLS (tag input)
=========================================== */

function addSkill(name) {
    const trimmed = name.trim();
    if (!trimmed || resumeData.skills.includes(trimmed)) return;
    resumeData.skills.push(trimmed);
    renderSkillTags();
    schedulePreviewUpdate();
    onDataChange();
}

function renderSkillTags() {
    const wrap = document.getElementById("skillsTags");
    wrap.innerHTML = resumeData.skills.map(s =>
        `<span class="tag-chip">${escapeHtml(s)}<button type="button" data-skill="${escapeAttr(s)}" aria-label="Remove ${escapeAttr(s)}"><i class="fa-solid fa-xmark"></i></button></span>`
    ).join("");
}

function bindSkillsInput() {
    const input = document.getElementById("skillsInput");

    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addSkill(input.value);
            input.value = "";
        } else if (e.key === "Backspace" && input.value === "" && resumeData.skills.length) {
            resumeData.skills.pop();
            renderSkillTags();
            schedulePreviewUpdate();
            onDataChange();
        }
    });

    input.addEventListener("input", () => {
        if (input.value.includes(",")) {
            const parts = input.value.split(",");
            const remainder = parts.pop();
            parts.forEach(addSkill);
            input.value = remainder;
        }
    });

    document.getElementById("skillsTags").addEventListener("click", (e) => {
        const btn = e.target.closest("[data-skill]");
        if (!btn) return;
        resumeData.skills = resumeData.skills.filter(s => s !== btn.dataset.skill);
        renderSkillTags();
        schedulePreviewUpdate();
        onDataChange();
    });
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
        if (!confirm("Clear all resume data? This can't be undone.")) return;
        resumeData = defaultResumeData();
        renderPersonalForm();
        Object.keys(SECTIONS).forEach(renderRepeater);
        renderSkillTags();
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
   PDF GENERATION (sharp, selectable text)
=========================================== */

async function generatePDF() {

    const p = resumeData.personal;
    if (!p.fullName && !resumeData.experience.length && !resumeData.education.length) {
        showToast("Add a few details before downloading", true);
        return;
    }

    showLoader();
    await new Promise(r => setTimeout(r, 30)); // let the loader paint before the heavy sync work

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: "mm", format: "a4" });

        const pageW = 210, pageH = 297;
        const marginX = 18, marginTop = 20, marginBottom = 18;
        const contentW = pageW - marginX * 2;
        let y = marginTop;

        const isClassic = template === "classic";
        const font = isClassic ? "times" : "helvetica";
        const [ar, ag, ab] = hexToRgb(accentColor);
        const dark = [15, 23, 42];
        const gray = [90, 100, 116];
        const body = [51, 65, 85];
        const lineRgb = isClassic ? [203, 213, 225] : [ar, ag, ab];

        function checkPage(need) {
            if (y + need > pageH - marginBottom) {
                pdf.addPage();
                y = marginTop;
            }
        }

        function setColor(c) { pdf.setTextColor(c[0], c[1], c[2]); }

        function sectionTitle(text) {
            checkPage(11);
            pdf.setFont(font, "bold");
            pdf.setFontSize(11);
            setColor(isClassic ? dark : [ar, ag, ab]);
            if (isClassic) pdf.text(text.toUpperCase(), pageW / 2, y, { align: "center" });
            else pdf.text(text.toUpperCase(), marginX, y);
            y += 2;
            pdf.setDrawColor(...(isClassic ? [203, 213, 225] : [ar, ag, ab]));
            pdf.setLineWidth(0.3);
            pdf.line(marginX, y, pageW - marginX, y);
            y += 6;
        }

        function bodyText(text, size, color) {
            pdf.setFont(font, "normal");
            pdf.setFontSize(size);
            setColor(color);
            pdf.splitTextToSize(text, contentW).forEach(line => {
                checkPage(5);
                pdf.text(line, marginX, y);
                y += 5;
            });
        }

        function entryHeader(left, right) {
            checkPage(6);
            pdf.setFont(font, "bold");
            pdf.setFontSize(10.5);
            setColor(dark);
            pdf.text(left || " ", marginX, y);
            if (right) {
                pdf.setFont(font, "normal");
                pdf.setFontSize(9);
                setColor(gray);
                pdf.text(right, pageW - marginX, y, { align: "right" });
            }
            y += 5;
        }

        function subLine(text) {
            if (!text) return;
            checkPage(5);
            pdf.setFont(font, "italic");
            pdf.setFontSize(9.5);
            setColor(gray);
            pdf.text(text, marginX, y);
            y += 5;
        }

        function bulletList(bullets) {
            bullets.forEach(b => {
                const wrapped = pdf.splitTextToSize(b, contentW - 8);
                wrapped.forEach((line, i) => {
                    checkPage(5);
                    pdf.setFont(font, "normal");
                    pdf.setFontSize(9.5);
                    setColor(body);
                    if (i === 0) pdf.text("•", marginX + 2, y);
                    pdf.text(line, marginX + 8, y);
                    y += 4.8;
                });
            });
        }

        /* ---- Header ---- */

        const nameText = p.fullName || "Your Name";
        checkPage(26);
        pdf.setFont(font, "bold");
        pdf.setFontSize(20);
        setColor(dark);
        pdf.text(isClassic ? nameText.toUpperCase() : nameText, isClassic ? pageW / 2 : marginX, y, { align: isClassic ? "center" : "left" });
        y += 7;

        if (p.jobTitle) {
            pdf.setFont(font, "normal");
            pdf.setFontSize(12);
            setColor(isClassic ? gray : [ar, ag, ab]);
            pdf.text(p.jobTitle, isClassic ? pageW / 2 : marginX, y, { align: isClassic ? "center" : "left" });
            y += 6;
        }

        const contactParts = [p.email, p.phone, p.location, p.website].filter(Boolean);
        if (contactParts.length) {
            pdf.setFont(font, "normal");
            pdf.setFontSize(9.5);
            setColor(gray);
            const line = contactParts.join("   •   ");
            pdf.splitTextToSize(line, contentW).forEach(l => {
                pdf.text(l, isClassic ? pageW / 2 : marginX, y, { align: isClassic ? "center" : "left" });
                y += 4.6;
            });
        }

        y += 2;
        pdf.setDrawColor(...lineRgb);
        pdf.setLineWidth(isClassic ? 0.4 : 0.8);
        pdf.line(marginX, y, pageW - marginX, y);
        y += 8;

        /* ---- Sections ---- */

        if (p.summary) {
            sectionTitle("Summary");
            bodyText(p.summary, 10, body);
            y += 4;
        }

        if (resumeData.experience.length) {
            sectionTitle("Experience");
            resumeData.experience.forEach(item => {
                entryHeader(
                    [item.company, item.role].filter(Boolean).join(" — ") || "Untitled role",
                    [item.start, item.end].filter(Boolean).join(" – ")
                );
                subLine(item.location);
                bulletList((item.bullets || "").split("\n").map(s => s.trim()).filter(Boolean));
                y += 3;
            });
        }

        if (resumeData.education.length) {
            sectionTitle("Education");
            resumeData.education.forEach(item => {
                entryHeader(
                    [item.school, item.degree].filter(Boolean).join(" — ") || "Education",
                    [item.start, item.end].filter(Boolean).join(" – ")
                );
                subLine([item.location, item.gpa ? "GPA: " + item.gpa : ""].filter(Boolean).join(" • "));
                y += 3;
            });
        }

        if (resumeData.skills.length) {
            sectionTitle("Skills");
            bodyText(resumeData.skills.join("   •   "), 10, body);
            y += 4;
        }

        if (resumeData.projects.length) {
            sectionTitle("Projects");
            resumeData.projects.forEach(item => {
                entryHeader([item.name, item.tech].filter(Boolean).join(" — ") || "Project", "");
                subLine(item.link);
                bulletList((item.description || "").split("\n").map(s => s.trim()).filter(Boolean));
                y += 3;
            });
        }

        if (resumeData.certifications.length) {
            sectionTitle("Certifications");
            resumeData.certifications.forEach(item => {
                entryHeader([item.name, item.issuer].filter(Boolean).join(" — ") || "Certification", item.year || "");
                y += 2;
            });
        }

        if (resumeData.languages.length) {
            sectionTitle("Languages");
            const text = resumeData.languages
                .map(l => l.level ? `${l.name} (${l.level})` : l.name)
                .filter(Boolean).join("   •   ");
            bodyText(text, 10, body);
        }

        const fileName = (p.fullName ? p.fullName.trim().replace(/\s+/g, "_") : "Resume") + ".pdf";
        pdf.save(fileName);
        showToast("Resume downloaded");

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

    renderPersonalForm();
    bindPersonalFields();

    Object.keys(SECTIONS).forEach(section => {
        renderRepeater(section);
        bindRepeaterEvents(section);
        patchSelectHandling(section);
    });

    renderSkillTags();
    bindSkillsInput();

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