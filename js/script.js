/* ===========================================
   TOOLHUB AI — HOMEPAGE
=========================================== */

/* ---------- Tool catalog ---------- */
/* TOOLS comes from js/tools-data.js — loaded before this file. */

/* ---------- Render tool cards ---------- */

function toolCardHTML(tool) {
    return `
    <a class="tool-card" href="${tool.href}">
        <div class="tool-card-icon ${tool.iconClass}"><i class="fa-solid ${tool.icon}"></i></div>
        <span class="tool-category-tag">${tool.category}</span>
        <h3>${tool.name}</h3>
        <p>${tool.desc}</p>
        <div class="tool-card-footer">
            <span class="tool-try">Try it <i class="fa-solid fa-arrow-right"></i></span>
            ${tool.isNew ? `<span class="tool-badge">New</span>` : ""}
        </div>
    </a>`;
}

function renderTools(list) {
    const grid = document.getElementById("toolsGrid");
    const noResults = document.getElementById("noResults");

    if (list.length === 0) {
        grid.innerHTML = "";
        noResults.style.display = "block";
        return;
    }

    noResults.style.display = "none";
    grid.innerHTML = list.map(toolCardHTML).join("");
}

/* ---------- Search + category filter ---------- */

let activeCategory = null;

function applyFilter(query) {
    const q = query.trim().toLowerCase();

    let list = TOOLS;

    if (activeCategory) {
        list = list.filter(t => t.category === activeCategory);
    }

    if (q) {
        list = list.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.desc.toLowerCase().includes(q) ||
            t.category.includes(q)
        );
    }

    renderTools(list);
}

function bindSearchInputs() {
    const inputs = [
        document.getElementById("navSearchInput"),
        document.getElementById("navSearchInputMobile"),
        document.getElementById("heroSearchInput")
    ].filter(Boolean);

    inputs.forEach(input => {
        input.addEventListener("input", () => {
            // keep every search box in sync
            inputs.forEach(other => { if (other !== input) other.value = input.value; });
            activeCategory = null;
            document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
            applyFilter(input.value);
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                document.getElementById("featured").scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    const heroBtn = document.getElementById("heroSearchBtn");
    if (heroBtn) {
        heroBtn.addEventListener("click", () => {
            document.getElementById("featured").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }
}

function bindCategoryCards() {
    document.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            const cat = card.dataset.category;

            if (activeCategory === cat) {
                activeCategory = null;
                card.classList.remove("active");
            } else {
                activeCategory = cat;
                document.querySelectorAll(".category-card").forEach(c => c.classList.remove("active"));
                card.classList.add("active");
            }

            [document.getElementById("navSearchInput"), document.getElementById("navSearchInputMobile"), document.getElementById("heroSearchInput")]
                .filter(Boolean)
                .forEach(i => i.value = "");

            applyFilter("");
            document.getElementById("featured").scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

/* ---------- Mobile menu ---------- */

function bindMobileMenu() {
    const menuBtn = document.getElementById("menuBtn");
    const menu = document.getElementById("mobileMenu");
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

/* ---------- Animated stats (count up on scroll into view) ---------- */

function animateCount(el) {
    const target = parseInt(el.dataset.count, 10) || 0;
    const suffix = el.dataset.suffix || "";
    const duration = 1200;
    const start = performance.now();

    function tick(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        const value = Math.round(target * eased);
        el.textContent = value.toLocaleString() + suffix;
        if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
}

function bindStatsAnimation() {
    const stats = document.querySelectorAll(".stat-number");
    if (!stats.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCount(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });

    stats.forEach(el => observer.observe(el));
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
    }, { threshold: 0.15 });

    items.forEach(el => observer.observe(el));
}

/* ---------- Theme toggle now lives in js/theme.js (shared across every page) ---------- */

/* ---------- Pre-select category from ?category= in URL ---------- */

function applyCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("category");
    if (!cat) return;
    const card = document.querySelector(`.category-card[data-category="${cat}"]`);
    if (card) card.click();
}

/* ===========================================
   STARTUP
=========================================== */

renderTools(TOOLS);
bindSearchInputs();
bindCategoryCards();
bindMobileMenu();
bindStatsAnimation();
bindRevealAnimation();
applyCategoryFromURL();