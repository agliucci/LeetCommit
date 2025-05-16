"use strict";
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form");
  const status = document.getElementById("status");

  // Load saved values and populate inputs
  chrome.storage.sync.get(["githubUsername", "repoName", "githubToken"], (data) => {
    document.getElementById("github-username").value = data.githubUsername || "";
    document.getElementById("repo-name").value = data.repoName || "";
    document.getElementById("github-token").value = data.githubToken || "";
  });

  
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = document.getElementById("github-username").value.trim();
    const repo = document.getElementById("repo-name").value.trim();
    const token = document.getElementById("github-token").value.trim();

    
    chrome.storage.sync.set(
      {
        githubUsername: username,
        repoName: repo,
        githubToken: token
      },
      () => {
        status.textContent = "Settings saved!";
        setTimeout(() => {
          status.textContent = "";
        }, 2000);
      }
    );
  });
});
