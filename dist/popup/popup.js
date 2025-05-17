"use strict";

// Fetch total problem count from LeetCode
async function totalProblems() {
  const res = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query:
        "query problemsetQuestionList { allQuestionsCount { difficulty count } }",
    }),
  });

  const data = await res.json();
  const total =
    data.data?.allQuestionsCount?.find((d) => d.difficulty === "All")?.count ||
    3525;
  return total;
}

// Update progress bar and synced count
async function updateProgressBar() {
  const total = await totalProblems();
  chrome.storage.sync.get(["syncedCount"], (res) => {
    const synced = res.syncedCount || 0;
    const percent = (synced / total) * 100;

    document.getElementById(
      "synced-count"
    ).textContent = `${synced} / ${total}`;
    document.getElementById("progress-bar").style.width = `${Math.min(
      percent,
      100
    )}%`;
    document.getElementById("total-solved").textContent = synced;
  });
}

// Fetch difficulty-specific solved data from LeetCode
async function getDiff() {
  chrome.storage.sync.get("leetcodeUsername", async (res) => {
    const username = res.leetcodeUsername;
    if (!username) {
      console.warn("No LeetCode username saved");
      return;
    }

    // Fetch user submission data
    const userRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query getUserProfile($username: String!) {
            matchedUser(username: $username) {
              submitStatsGlobal {
                acSubmissionNum {
                  difficulty
                  count
                }
              }
            }
          }
        `,
        variables: { username }
      })
    });

    const userData = await userRes.json();
    const userStats = userData?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    if (!Array.isArray(userStats)) {
      console.warn("Unexpected stats format:", userStats);
      return;
    }

    // Get total problems by difficulty
    const totalRes = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          query problemsetQuestionList {
            allQuestionsCount {
              difficulty
              count
            }
          }
        `
      })
    });

    const totalData = await totalRes.json();
    const totalStats = totalData?.data?.allQuestionsCount;
    const totalMap = Object.fromEntries(
      totalStats.map(entry => [entry.difficulty.toLowerCase(), entry.count])
    );

    // Set total solved
    const allStat = userStats.find(stat => stat.difficulty === "All");
    document.getElementById("total-solved").textContent = allStat?.count || 0;

    // Set difficulty stats
    for (let stat of userStats) {
      const diff = stat.difficulty.toLowerCase();
      if (diff === "all") continue;

      const solved = stat.count;
      const total = totalMap[diff] || 0;
      const percent = total === 0 ? 0 : (solved / total) * 100;

      const solvedEl = document.getElementById(`${diff}-solved`);
      const totalEl = document.getElementById(`${diff}-total`);
      const bar = document.getElementById(`${diff}-bar`);

      if (solvedEl && totalEl && bar) {
        solvedEl.textContent = solved;
        totalEl.textContent = total;
        bar.style.width = `${Math.min(percent, 100)}%`;
      }
    }
  });
}

// On popup load
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("settings-form");
  const status = document.getElementById("status");

  // Apply theme
  chrome.storage.sync.get("theme", (res) => {
    const theme = res.theme || "light";
    document.getElementById("popupBody").classList.add(theme);
  });


  // Load user data
  chrome.storage.sync.get(
    ["githubUsername", "repoName", "githubToken", "leetcodeUsername"],
    (data) => {
      document.getElementById("github-username").value =
        data.githubUsername || "";
      document.getElementById("repo-name").value = data.repoName || "";
      document.getElementById("github-token").value = data.githubToken || "";
      document.getElementById("leetcode-username").value =
        data.leetcodeUsername || "";
      document.getElementById("user-greeting").textContent =
        data.githubUsername || "User";
    }
  );

  // Save user settings
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const username = document.getElementById("github-username").value.trim();
    const repo = document.getElementById("repo-name").value.trim();
    const token = document.getElementById("github-token").value.trim();
    const leetcode = document.getElementById("leetcode-username").value.trim();

    chrome.storage.sync.set(
      {
        githubUsername: username,
        repoName: repo,
        githubToken: token,
        leetcodeUsername: leetcode,
      },
      () => {
        status.textContent = "✅ Settings saved!";
        document.getElementById("user-greeting").textContent = username;
        setTimeout(() => (status.textContent = ""), 2000);
      }
    );
  });
  updateProgressBar();
  getDiff();

  // Toggle settings
  const toggleBtn = document.getElementById("toggle-settings");
  const settingsCard = document.getElementById("github-card");

  toggleBtn.addEventListener("click", () => {
    const isVisible = settingsCard.style.display === "block";
    settingsCard.style.display = isVisible ? "none" : "block";
    toggleBtn.textContent = isVisible ? "⚙️ Settings" : "⬆️ Hide Settings";
  });

  
});
