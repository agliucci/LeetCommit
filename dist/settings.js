document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("themeToggle");

    chrome.storage.sync.get("theme", res => {
        const theme = res.theme || "light";
        document.body.classList.add(theme);
        checkbox.checked = theme === "dark";
    });

    checkbox.addEventListener("change", () => {
    const theme = checkbox.checked ? "dark" : "light";
    chrome.storage.sync.set({ theme });
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  });
});
