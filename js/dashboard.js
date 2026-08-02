/* ===========================================
   TOOLHUB AI — DASHBOARD
   Reads the shared TOOLS catalog from js/tools-data.js
=========================================== */

/* ---------- Card rendering ---------- */

function badgesHTML(tool) {
    const badges = [];
    if (tool.isNew) badges.push(`<span class="tool-badge">New</span>`);
    if (tool.popular) badges.push(`<span class="tool-badge popular">Popular</span>`);
    if (!badges.length) return "";
    return `<div class="tool-card-badges">${badges.join("")}</div>`;
}

function toolCardHTML(tool) {
    return `
    <a class="tool-card" href="${tool.href}">
        ${badgesHTML(tool)}
        <div class="tool-card-icon ${tool.iconClass}"><i class="fa-solid ${tool.icon}"></i></div>
        <span class="tool-category-tag">${tool.category}</span>
        <h3>${tool.name}</h3>
        <p>${tool.desc}</p>
        <div class="tool-card-footer">
            <span class="tool-try">Try it <i class="fa-solid fa-arrow-right"></i></span>
        </div>
    </a>`;
}

function renderGrid(id, list) {
    document.getElementById(id).innerHTML = list.map(toolCardHTML).join("");
}

/* ---------- Popular + Recently Added ---------- */

function renderPopular() {
    const popular = TOOLS.filter(t => t.popular);
    document.getElementById("popularSection").style.display = popular.length ? "block" : "none";
    renderGrid("popularGrid", popular);
}

function renderRecent() {
    const recent = [...TOOLS].sort((a, b) => b.addedOrder - a.addedOrder).slice(0, 3);
    document.getElementById("recentSection").style.display = recent.length ? "block" : "none";
    renderGrid("recentGrid", recent);
}

/* ---------- All tools: search + category filter ---------- */

let activeCategory = "all";

function applyFilter(query) {
    const q = query.trim().toLowerCase();
    let list = TOOLS;

    if (activeCategory !== "all") {
        list = list.filter(t => t.category === activeCategory);
    }

    if (q) {
        list = list.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.category.includes(q)
        );
    }

    const grid = document.getElementById("allToolsGrid");
    const noResults = document.getElementById("noResults");
    const heading = document.getElementById("allToolsHeading");

    heading.textContent = activeCategory === "all" ? "All tools" : categoryLabel(activeCategory);

    if (list.length === 0) {
        grid.innerHTML = "";
        noResults.style.display = "block";
    } else {
        noResults.style.display = "none";
        renderGrid("allToolsGrid", list);
    }

    // hide the popular/recent teaser sections while actively searching or filtering,
    // so results aren't split across three grids at once
    const isFiltering = q.length > 0 || activeCategory !== "all";
    document.getElementById("popularSection").style.display = isFiltering ? "none" : (TOOLS.some(t => t.popular) ? "block" : "none");
    document.getElementById("recentSection").style.display = isFiltering ? "none" : "block";
}

function categoryLabel(cat) {
    const labels = { pdf: "PDF Tools", image: "Image Tools", ai: "AI Tools", text: "Text & Docs" };
    return labels[cat] || "All tools";
}

/* ---------- Search inputs (kept in sync) ---------- */

function bindSearchInputs() {
    const inputs = [
        document.getElementById("navSearchInput"),
        document.getElementById("navSearchInputMobile"),
        document.getElementById("dashSearchInput")
    ].filter(Boolean);

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            inputs.forEach(other => { if (other !== input) other.value = input.value; });
            applyFilter(input.value);
        });
    });
}

/* ---------- Category chips ---------- */

function bindCategoryChips() {
    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            activeCategory = chip.dataset.category;

            const inputs = [document.getElementById("navSearchInput"), document.getElementById("navSearchInputMobile"), document.getElementById("dashSearchInput")].filter(Boolean);
            inputs.forEach(i => i.value = "");

            applyFilter("");
            document.getElementById("allToolsSection").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function applyCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);

    const q = params.get("q");
    if (q) {
        const input = document.getElementById("dashSearchInput");
        if (input) input.value = q;
        applyFilter(q);
    }

    const cat = params.get("category");
    if (!cat) return;
    const chip = document.querySelector(`.chip[data-category="${cat}"]`);
    if (chip) chip.click();
}

/* ---------- Mobile menu ---------- */

function bindMobileMenu() {
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("mobileMenu");
    if (!menuBtn || !menu) return;

    menuBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
        const icon = menuBtn.querySelector("i");
        icon.className = menu.classList.contains("open") ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });

    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
        menu.classList.remove("open");
        menuBtn.querySelector("i").className = "fa-solid fa-bars";
    }));
}

/* ---------- Reveal-on-scroll ---------- */

function bindRevealAnimation() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    items.forEach(el => observer.observe(el));
}

/* ---------- Theme toggle now lives in js/theme.js (shared across every page) ---------- */

/* ===========================================
   STARTUP
=========================================== */

renderPopular();
renderRecent();
renderGrid("allToolsGrid", TOOLS);
bindSearchInputs();
bindCategoryChips();
bindMobileMenu();
bindRevealAnimation();
applyCategoryFromURL();