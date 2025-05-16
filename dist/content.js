"use strict";
console.log("LeetCommit loaded on LeetCode");
const target = document.querySelector('[data-e2e-locator="submission-result"]');
if (target) {
    const observer = new MutationObserver(entries => {
        for (const entry of entries) {
            if (entry.type === "characterData" || entry.type === "childList") {
                const newText = target.textContent?.trim();
                if (newText === "Accepted") {
                    console.log("Submission accepted");
                    const submission = {
                        title: document.querySelector('a[href^="/problems"]'),
                    };
                }
            }
        }
    });
    observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
    });
}
