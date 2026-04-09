/**
 * Tab switching logic.
 */

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
            const target = btn.dataset.tab;

            // Update button states
            tabButtons.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            // Update content visibility
            tabContents.forEach((content) => {
                if (content.id === `tab-${target}`) {
                    content.classList.remove("hidden");
                    content.classList.add("active");
                } else {
                    content.classList.add("hidden");
                    content.classList.remove("active");
                }
            });
        });
    });
});
