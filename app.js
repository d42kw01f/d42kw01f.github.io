// Run after the page is ready
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;

    // Load saved theme; default to dark if none saved
    const saved = localStorage.getItem("theme");
    if (saved === "light") root.classList.remove("dark");
    else root.classList.add("dark");

    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    menuBtn?.addEventListener("click", () => mobileMenu?.classList.toggle("hidden"));

    // Theme toggle
    function toggleTheme() {
        const isDark = root.classList.toggle("dark");
        localStorage.setItem("theme", isDark ? "dark" : "light");
    }

    document.getElementById("themeBtn")?.addEventListener("click", toggleTheme);
    document.getElementById("themeBtnMobile")?.addEventListener("click", toggleTheme);
});
