// Shared behaviour: footer year, mobile menu, current-page nav highlight.
document.addEventListener("DOMContentLoaded", () => {

    // Footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Mobile menu
    const menuBtn = document.getElementById("menuBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    menuBtn?.addEventListener("click", () => {
        const open = mobileMenu?.classList.toggle("hidden") === false;
        menuBtn.setAttribute("aria-expanded", String(open));
        menuBtn.textContent = open ? "Close" : "Menu";
    });

    // Mark the nav link for the page being viewed
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("header a.navlink").forEach(a => {
        const target = (a.getAttribute("href") || "").split("/").pop();
        if (target === here) a.setAttribute("aria-current", "page");
    });
});
