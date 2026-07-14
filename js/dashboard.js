// ======================
// THEME TOGGLE
// ======================

const body = document.getElementById("body");
const themeToggle = document.getElementById("themeToggle");

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {

    body.classList.remove("bg-slate-900", "text-white");
    body.classList.add("bg-white", "text-black");

    themeToggle.innerHTML = "☀️";

} else {

    body.classList.add("bg-slate-900", "text-white");

    themeToggle.innerHTML = "🌙";

}

themeToggle.addEventListener("click", () => {

    if (body.classList.contains("bg-slate-900")) {

        body.classList.remove("bg-slate-900", "text-white");
        body.classList.add("bg-white", "text-black");

        localStorage.setItem("theme", "light");

        themeToggle.innerHTML = "☀️";

    } else {

        body.classList.remove("bg-white", "text-black");
        body.classList.add("bg-slate-900", "text-white");

        localStorage.setItem("theme", "dark");

        themeToggle.innerHTML = "🌙";

    }

});

// ======================
// SEARCH
// ======================

const search = document.getElementById("search");

search.addEventListener("input", () => {

    const value = search.value.toLowerCase();

    document.querySelectorAll("#toolsGrid > a").forEach(tool => {

        const name = tool.dataset.name.toLowerCase();

        if (name.includes(value)) {

            tool.style.display = "";

        } else {

            tool.style.display = "none";

        }

    });

});

// ======================
// CATEGORY FILTER
// ======================

const buttons =
document.querySelectorAll(".categoryBtn");

buttons.forEach(btn => {

    btn.addEventListener("click", () => {

        buttons.forEach(b => {

            b.classList.remove("bg-blue-600");

            b.classList.add("bg-slate-800");

        });

        btn.classList.remove("bg-slate-800");

        btn.classList.add("bg-blue-600");

        const category =
        btn.dataset.category;

        document.querySelectorAll("#toolsGrid > a")
        .forEach(tool => {

            if (
                category === "all" ||
                tool.dataset.category.includes(category)
            ) {

                tool.style.display = "";

            } else {

                tool.style.display = "none";

            }

        });

    });

});

// ======================
// FAVORITE TOOLS
// ======================

const favoriteButtons = document.querySelectorAll(".favoriteBtn");

let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

favoriteButtons.forEach(button => {

    const tool = button.dataset.tool;

    if (favorites.includes(tool)) {

        button.innerHTML = "❤️";

    }

    button.addEventListener("click", (e) => {

        e.preventDefault();
        e.stopPropagation();

        if (favorites.includes(tool)) {

            favorites = favorites.filter(item => item !== tool);

            button.innerHTML = "🤍";

        } else {

            favorites.push(tool);

            button.innerHTML = "❤️";

        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        updateFavorites();

    });

});

// ======================
// SHOW FAVORITE SECTION
// ======================

const favoriteSection = document.getElementById("favoriteSection");
const favoriteTools = document.getElementById("favoriteTools");

function updateFavorites() {

    favoriteTools.innerHTML = "";

    if (favorites.length === 0) {

        favoriteSection.classList.add("hidden");
        return;

    }

    favoriteSection.classList.remove("hidden");

    document.querySelectorAll("#toolsGrid > a").forEach(card => {

        const heart = card.querySelector(".favoriteBtn");

        if (favorites.includes(heart.dataset.tool)) {

            favoriteTools.appendChild(card.cloneNode(true));

        }

    });

}

updateFavorites();