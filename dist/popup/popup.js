"use strict";

async function totalProblems() {
    const res = fetch("https://leetcode.com/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query: "query problemsetQuestionList { allQuestionsCount { difficulty count } }"
        })
    });
    const data = (await res).json();
    const total = data.data.allQuestionsCount.find(d => d.difficulty === "All")?.count || 3525;
    return total;
}

async function progressBar() {
    const total = await totalProblems();
    chrome.storage.sync.get(["syncedCount"], (res) => {
    const synced = res.syncedCount || 0;
    const percent = (synced / total) * 100;

    
    document.getElementById("synced-count").textContent = `${synced} / ${total}`;

   
    document.getElementById("progress-bar").style.width = `${Math.min(percent, 100)}%`;
  });
}
document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("settings-form");
  const status = document.getElementById("status");
  chrome.storage.sync.get(["syncedCount"], (res) => {
  const count = res.syncedCount || 0;
  document.getElementById("synced-count").textContent = count;
});


  // Load saved values and populate inputs
  chrome.storage.sync.get(["githubUsername", "repoName", "githubToken"], (data) => {
    document.getElementById("github-username").value = data.githubUsername || "";
    document.getElementById("repo-name").value = data.repoName || "";
    document.getElementById("github-token").value = data.githubToken || "";
  });

  progressBar();
  
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
