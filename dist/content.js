"use strict";
console.log("LeetCommit loaded on LeetCode");
const interval = setInterval(() => {
    const target = document.querySelector('[data-e2e-locator="submission-result"]');
    const text = target && target.textContent ? target.textContent.trim() : null;
    if (text === "Accepted") {
        console.log("Submission accepted");
        clearInterval(interval);
        const title = document.title.replace(' - LeetCode', '').trim();
        const lineElements = document.querySelectorAll('.view-line');
        const lines = [];
        lineElements.forEach(line => {
            const spans = line.querySelectorAll('span span');
            const lineText = Array.from(spans).map(span => span.textContent).join('');
            lines.push(lineText);
        });
        const fullCode = lines.join('\n');
        const language = document.querySelector('button.rounded.inline-flex.text-text-secondary.text-sm')?.textContent;
        const submission = {
            title,
            code: fullCode,
            language
        };
        console.log(submission);
    }
}, 1000);
