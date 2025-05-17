"use strict";
console.log("LeetCommit loaded on LeetCode");
const interval = setInterval(() => {
    const target = document.querySelector('[data-e2e-locator="submission-result"]');
    const text = target && target.textContent ? target.textContent.trim() : null;
    if (text === "Accepted") {
        console.log("Submission accepted");
        clearInterval(interval);
        const title = document.title.replace(' - LeetCode', '').trim();
        const difficultyEl = document.querySelector('div[class*="text-difficulty-"]');
        const difficulty = difficultyEl?.textContent?.trim().toLowerCase() || "unknown";
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
        const languageExtensions = {
            java: "java",
            python: "py",
            "c++": "cpp",
            "c": "c",
            "c#": "cs",
            javascript: "js",
            typescript: "ts",
            ruby: "rb",
            go: "go",
            rust: "rs",
            kotlin: "kt",
            swift: "swift",
            php: "php",
            scala: "scala"
        };
        chrome.storage.sync.get(["githubUsername", "repoName", "githubToken"], (settings) => {
            const githubUsername = settings.githubUsername;
            const repoName = settings.repoName;
            const token = settings.githubToken;
            if (!githubUsername || !repoName || !token) {
                console.warn("GitHub settings missing — please set them in the extension popup.");
                return;
            }
            ;
            const metadataComment = `
            // Title: ${submission.title}
            // Difficulty: ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            // Language: ${submission.language}
            // Link: https://leetcode.com/problems/${submission.title.replace(/\s+/g, '-').toLowerCase()}/
            `.trim();
            const fullCodeWithComment = `${metadataComment}\n\n${submission.code}`;
            const base64 = btoa(new TextEncoder().encode(fullCodeWithComment).reduce((acc, byte) => acc + String.fromCharCode(byte), ""));
            const extension = language && typeof language === "string" && languageExtensions[language.toLowerCase()]
                ? languageExtensions[language.toLowerCase()]
                : "txt";
            const filePath = `solutions/${difficulty}/${submission.title}.${extension}`;
            const payload = {
                message: `Add solution for ${submission.title}`,
                content: base64,
                branch: "main"
            };
            const apiUrl = `https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`;
            fetch(apiUrl, {
                method: "GET",
                headers: {
                    Authorization: `token ${token}`,
                    Accept: "application/vnd.github.v3+json"
                }
            })
                .then(res => {
                if (res.status === 404)
                    return null;
                if (!res.ok)
                    throw new Error(`GitHub GET failed with status ${res.status}`);
                return res.json();
            })
                .then(existingFile => {
                const payload = {
                    message: `Add solution for ${submission.title}`,
                    content: base64,
                    branch: "main",
                    ...(existingFile && { sha: existingFile.sha })
                };
                return fetch(apiUrl, {
                    method: "PUT",
                    headers: {
                        "Authorization": `token ${token}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
            })
                .then(res => res.json())
                .then(data => {
                if (data.content) {
                    console.log("Pushed to GitHub:", data.content.html_url);
                }
                else {
                    console.error("GitHub push failed:", {
                        message: data.message,
                        errors: data.errors,
                        url: data.documentation_url
                    });
                }
            })
                .catch(err => console.error("Network error or fetch failure:", err));
        });
    }
}, 1000);
