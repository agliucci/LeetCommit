console.log("LeetCommit loaded on LeetCode");

const interval = setInterval(() => {
    const target: Element | null = document.querySelector('[data-e2e-locator="submission-result"]');
    const text = target && target.textContent ? target.textContent.trim() : null;

    if (text === "Accepted") { 
        console.log("Submission accepted");
        clearInterval(interval);

        const title = document.title.replace(' - LeetCode', '').trim();

        const lineElements = document.querySelectorAll('.view-line');
        const lines: string[] = [];
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

        const languageExtensions: Record<string, string> = {
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
            const githubUsername = settings.githubUsername
            const repoName = settings.repoName;
            const token = settings.githubToken;
            if (!githubUsername || !repoName || !token) {
                console.warn("GitHub settings missing — please set them in the extension popup.");
                return;
            };

            const base64 = btoa(
                new TextEncoder().encode(submission.code).reduce((acc, byte) => acc + String.fromCharCode(byte), "")
            );

            const extension = language && typeof language === "string" && languageExtensions[language.toLowerCase()] 
                ? languageExtensions[language.toLowerCase()] 
                : "txt"; 
            const filePath = `solutions/${language}/${title}.${extension}`;


            const payload = {
                message: `Add ${submission.language} solution for ${submission.title}`,
                content: base64,
                branch: "main"
            };

            fetch(`https://api.github.com/repos/${githubUsername}/${repoName}/contents/${filePath}`, {
                method: "PUT",
                headers: {
                    "Authorization": `token ${token}`,
                    "Content-Type": "application/json"
                    },
                body: JSON.stringify(payload)
            })
            .then(res => res.json())
            .then(data => {
                if (data.content) {
                    console.log("Pushed to GitHub:", data.content.html_url);
                } else {
                    console.error("GitHub push failed:", data);
                }
            })
            .catch(err => console.error("Network error:", err));


        })

    }
}, 1000);




