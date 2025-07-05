function submitMarks() {
  const username = document.getElementById("username").value.trim();
  const physics = parseFloat(document.getElementById("physics").value);
  const chemistry = parseFloat(document.getElementById("chemistry").value);
  const maths = parseFloat(document.getElementById("maths").value);

  if (!username) {
    alert("Please enter your name.");
    return;
  }

  if ([physics, chemistry, maths].some(m => isNaN(m) || m < 0 || m > 100)) {
    alert("Enter valid marks (0–100) for all subjects.");
    return;
  }

  const total = physics + chemistry + maths;
  const percentage = ((total / 300) * 100).toFixed(2);
  let rank = "";

  if (percentage >= 95) rank = "🔥 Top 100";
  else if (percentage >= 90) rank = "🥇 Top 500";
  else if (percentage >= 80) rank = "🥈 Top 2000";
  else if (percentage >= 70) rank = "🥉 Top 5000";
  else if (percentage >= 60) rank = "🎖️ Top 10000";
  else rank = "⚠️ Above 10000";

  const entry = {
    username,
    physics,
    chemistry,
    maths,
    total,
    percentage,
    rank,
    time: new Date().toLocaleString()
  };

  let users = JSON.parse(localStorage.getItem("rankUsers")) || {};
  if (!users[username]) users[username] = [];
  users[username].push(entry);
  localStorage.setItem("rankUsers", JSON.stringify(users));
  localStorage.setItem("latestUser", username);

  window.location.href = "result.html";
}

function showResult() {
  const username = localStorage.getItem("latestUser");
  const users = JSON.parse(localStorage.getItem("rankUsers")) || {};
  const entries = users[username] || [];
  const data = entries[entries.length - 1];

  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = `
    <h3>🧑 ${data.username}</h3>
    <p>🕒 ${data.time}</p>
    <p>📘 Physics: ${data.physics}</p>
    <p>🧪 Chemistry: ${data.chemistry}</p>
    <p>📐 Maths: ${data.maths}</p>
    <p>📊 Total: ${data.total}/300</p>
    <p>✅ Percentage: ${data.percentage}%</p>
    <p>🏆 Rank: ${data.rank}</p>
  `;

  animateProgressBar(data.percentage);
  drawPieChart(data);
}

function animateProgressBar(percent) {
  const bar = document.getElementById("progressBar");
  bar.style.width = percent + "%";
}

function drawPieChart(data) {
  const ctx = document.getElementById("pieChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Physics", "Chemistry", "Maths"],
      datasets: [{
        data: [data.physics, data.chemistry, data.maths],
        backgroundColor: ["#ff6384", "#36a2eb", "#ffcd56"],
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

function showHistory() {
  const username = localStorage.getItem("latestUser");
  const users = JSON.parse(localStorage.getItem("rankUsers")) || {};
  const history = users[username] || [];

  const div = document.getElementById("history");
  if (history.length === 0) {
    div.innerHTML = "<p>No history yet.</p>";
    return;
  }

  let html = "<h3>📜 History:</h3><ul>";
  history.slice().reverse().forEach(e => {
    html += `<li>${e.time} – ${e.total}/300 → ${e.percentage}% → ${e.rank}</li>`;
  });
  html += "</ul>";
  div.innerHTML = html;
}

function clearHistory() {
  const user = localStorage.getItem("latestUser");
  if (confirm("Clear all history for this user?")) {
    let users = JSON.parse(localStorage.getItem("rankUsers")) || {};
    delete users[user];
    localStorage.setItem("rankUsers", JSON.stringify(users));
    location.reload();
  }
}

function exportToCSV() {
  const user = localStorage.getItem("latestUser");
  const users = JSON.parse(localStorage.getItem("rankUsers")) || {};
  const history = users[user] || [];

  if (history.length === 0) return alert("Nothing to export.");

  const headers = ["Time", "Physics", "Chemistry", "Maths", "Total", "Percentage", "Rank"];
  const rows = history.map(e => [
    e.time, e.physics, e.chemistry, e.maths, e.total, e.percentage, e.rank
  ]);

  const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${user}_rank_history.csv`;
  link.click();
}

function toggleDarkMode() {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}

window.onload = () => {
  if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
  }

  if (window.location.pathname.includes("result.html")) {
    showResult();
    showHistory();
  }
};
