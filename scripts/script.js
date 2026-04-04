// Cache pages so we don't fetch multiple times
let cachedPages = null;
let lastIndex = -1;

// Load pages from JSON
async function loadPages() {
    if (!cachedPages) {
        const response = await fetch('/scripts/pages.json');
        cachedPages = await response.json();
    }
    return cachedPages;
}

// Get a non-repeating random index
function getRandomIndex(length) {
    let index;
    do {
        index = Math.floor(Math.random() * length);
    } while (index === lastIndex && length > 1);

    lastIndex = index;
    return index;
}

// Navigate to a random page
async function goToRandomPage(event) {
    event.preventDefault();

    try {
        const pages = await loadPages();

        if (!pages.length) {
            alert("No pages available.");
            return;
        }

        const index = getRandomIndex(pages.length);
        const page = pages[index];

        window.location.href = page.url;

    } catch (error) {
        console.error("Error loading pages:", error);
        alert("Failed to load random page.");
    }
}

// Toggle sidebar (for mobile)
function toggleMenu() {
    document.getElementById("sidebar").classList.toggle("active");
}

// Generate Table of Contents
function generateTOC() {
    const tocList = document.getElementById("toc-list");
    const content = document.querySelector(".container");

    if (!tocList || !content) return;

    const headings = content.querySelectorAll("h2, h3");
    tocList.innerHTML = "";

    headings.forEach((heading, index) => {
        // Create ID if missing
        if (!heading.id) {
            heading.id = "section-" + index;
        }

        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = "#" + heading.id;
        a.textContent = heading.textContent;

        li.appendChild(a);

        // Indent h3 under h2
        if (heading.tagName === "H3") {
            li.style.marginLeft = "15px";
            li.style.fontSize = "0.95em";
        }

        tocList.appendChild(li);
    });
}

// Search scripts
document.addEventListener("DOMContentLoaded", () => {
    generateTOC();
});

let searchResultsDiv = null;

document.addEventListener("DOMContentLoaded", () => {
    const searchBox = document.getElementById("search-box");
    searchResultsDiv = document.getElementById("search-results");

    if (searchBox) {
        searchBox.addEventListener("input", handleSearch);
        searchBox.addEventListener("keydown", handleKeyNavigation);
    }

    document.addEventListener("click", (e) => {
        if (!e.target.closest(".search-container")) {
            searchResultsDiv.style.display = "none";
        }
    });
});

async function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        searchResultsDiv.style.display = "none";
        return;
    }

    const pages = await loadPages();

    const results = pages.filter(page =>
		page.title.toLowerCase().includes(query) ||
		page.title.toLowerCase().split(" ").some(word => word.startsWith(query))
	);

    displayResults(results);
}

function displayResults(results) {
    searchResultsDiv.innerHTML = "";

    if (!results.length) {
        searchResultsDiv.style.display = "none";
        return;
    }

    results.forEach((page, index) => {
        const div = document.createElement("div");
        div.className = "search-result";
        div.textContent = page.title;
		
		div.innerHTML = `
			<strong>${page.title}</strong><br>
			<small>${page.description || ""}</small>
		`;

        div.addEventListener("click", () => {
            window.location.href = page.url;
        });

        searchResultsDiv.appendChild(div);
    });

    searchResultsDiv.style.display = "block";
}

// Keyboard navigation
let selectedIndex = -1;

function handleKeyNavigation(e) {
    const items = document.querySelectorAll(".search-result");

    if (!items.length) return;

    if (e.key === "ArrowDown") {
        selectedIndex = (selectedIndex + 1) % items.length;
    } 
    else if (e.key === "ArrowUp") {
        selectedIndex = (selectedIndex - 1 + items.length) % items.length;
    } 
    else if (e.key === "Enter") {
        if (selectedIndex >= 0) {
            items[selectedIndex].click();
        }
        return;
    } else {
        selectedIndex = -1;
        return;
    }

    items.forEach((item, i) => {
        item.style.background = i === selectedIndex ? "#eaecf0" : "";
    });

    e.preventDefault();
}
