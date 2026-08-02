/* ===========================================
   TOOLHUB AI — PAGE LOADER (shared)
   Expects a <div class="page-loader" id="pageLoader"> in the body.
   Hides it once the page has painted, with a safety timeout so a
   slow asset never traps the user behind the loader.
=========================================== */

(function () {

    function hideLoader() {
        const loader = document.getElementById("pageLoader");
        if (!loader) return;
        loader.classList.add("loader-hidden");
        setTimeout(() => loader.remove(), 500);
    }

    if (document.readyState === "complete") {
        hideLoader();
    } else {
        window.addEventListener("load", hideLoader);
    }

    // Safety net — never let the loader block the page for more than 2.5s
    setTimeout(hideLoader, 2500);

})();