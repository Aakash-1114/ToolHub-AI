/* ===========================================
   TOOLHUB AI — THEME TOGGLE (shared)
   Include this once per page, before the page's
   own script. Every page just needs a button with
   id="themeBtn" containing an <i> icon.
=========================================== */

(function () {

    const STORAGE_KEY = "toolhub-theme";

    function applyTheme(theme, btn) {
        document.documentElement.setAttribute("data-theme", theme);
        if (btn) {
            const icon = btn.querySelector("i");
            if (icon) icon.className = theme === "light" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    }

    function getSavedTheme() {
        try { return localStorage.getItem(STORAGE_KEY); } catch (err) { return null; }
    }

    function saveTheme(theme) {
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (err) { /* ignore */ }
    }

    // Apply saved (or default) theme immediately, before the button even exists,
    // so there's no flash of the wrong theme on page load.
    applyTheme(getSavedTheme() === "light" ? "light" : "dark", null);

    document.addEventListener("DOMContentLoaded", () => {
        const btn = document.getElementById("themeBtn");
        if (!btn) return;

        // sync the icon now that the button exists
        const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
        applyTheme(current, btn);

        btn.addEventListener("click", () => {
            const now = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
            const next = now === "light" ? "dark" : "light";
            applyTheme(next, btn);
            saveTheme(next);
        });
    });

})();