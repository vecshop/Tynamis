const themes = {
  // Default Theme
  "default-pastel": {
    background: "linear-gradient(135deg, #e0f4ff 0%, #ffe5f1 100%)",
    text: "#2d3748",
    cardBg: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    icons: "#4a90e2",
    body: "#f8f9fa",
    incomeBtn: "rgb(198, 223, 255)",
    expenseBtn: "rgb(255, 187, 240)",
    success: "#198754",
    warning: "#ffc107",
    danger: "#dc3545",
  },
  // Dark Themes
  luxurious: {
    background: "linear-gradient(135deg, #1a1a1a, #4a4a4a)",
    text: "#ffffff",
    cardBg: "#2d2d2d",
    shadow: "rgba(0, 0, 0, 0.2)",
    icons: "#7eb6f6",
    body: "#121212",
    incomeBtn: "#2d2d2d",
    expenseBtn: "#1f1f1f",
    success: "#00a36c",
    warning: "#ffd700",
    danger: "#ff4d4d",
  },
  emperal: {
    background: "linear-gradient(135deg, #2c1810, #5c3524)",
    text: "#ffffff",
    cardBg: "#3d251c",
    shadow: "rgba(0, 0, 0, 0.2)",
    icons: "#e6a67c",
    body: "#1a0f0a",
    incomeBtn: "#4c3024",
    expenseBtn: "#3d251c",
    success: "#2e8b57",
    warning: "#daa520",
    danger: "#cd5c5c",
  },
  minimus: {
    background: "linear-gradient(135deg, #232323, #454545)",
    text: "#ffffff",
    cardBg: "#333333",
    shadow: "rgba(0, 0, 0, 0.2)",
    icons: "#808080",
    body: "#1a1a1a",
    incomeBtn: "#333333",
    expenseBtn: "#282828",
  },
  octopus: {
    background: "linear-gradient(135deg, #1a1a2e, #16213e)",
    text: "#ffffff",
    cardBg: "#1f2b47",
    shadow: "rgba(0, 0, 0, 0.2)",
    icons: "#4169e1",
    body: "#0f1525",
    incomeBtn: "#1f2b47",
    expenseBtn: "#16213e",
  },
  // Light Themes
  matcha: {
    background: "linear-gradient(135deg, #e8f3d6, #fcffa6)",
    text: "#2d3748",
    cardBg: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    icons: "#82b74b",
    body: "#f4f9e8",
    incomeBtn: "#e8f3d6",
    expenseBtn: "#fcffa6",
  },
  choco: {
    background: "linear-gradient(135deg, #f5e6d3, #d4a276)",
    text: "#2d3748",
    cardBg: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    icons: "#8b4513",
    body: "#faf2ea",
    incomeBtn: "#f5e6d3",
    expenseBtn: "#d4a276",
  },
  "formal-blue": {
    background: "linear-gradient(135deg, #e0f4ff, #b3e5fc)",
    text: "#2d3748",
    cardBg: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    icons: "#4a90e2",
    body: "#f0f8ff",
    incomeBtn: "#e0f4ff",
    expenseBtn: "#b3e5fc",
  },
  "golden-hour": {
    background: "linear-gradient(135deg, #ffd700, #ffa500)",
    text: "#2d3748",
    cardBg: "#ffffff",
    shadow: "rgba(0, 0, 0, 0.1)",
    icons: "#ff8c00",
    body: "#fff9e6",
    incomeBtn: "#ffd700",
    expenseBtn: "#ffa500",
  },
  "wave-gradient": {
    background: `linear-gradient(
        45deg,
        #ff6b6b,
        #ff7eb3,
        #845ec2,
        #4b7bec
    )`,
    text: "#ffffff",
    cardBg: "rgb(221, 185, 255)",
    shadow: "rgba(0, 0, 0, 0.15)",
    icons: "rgb(252, 176, 255)",
    body: "#f8f9fa",
    incomeBtn: "#ff7eb3",
    expenseBtn: "#4b7bec",
    success: "#00d68f",
    warning: "#ffd93d",
    danger: "#ff6b6b",
    buyBtnBg: "#ff7eb3",
    buyBtnText: "#ffffff",
    deleteBtnBg: "#4b7bec",
    deleteBtnText: "#ffffff",
  },
};

function applyTheme(themeName) {
  const theme = themes[themeName];
  if (!theme) return;

  const root = document.documentElement;
  root.style.setProperty("--theme-background", theme.background);
  root.style.setProperty("--theme-text", theme.text);
  root.style.setProperty("--theme-card-bg", theme.cardBg);
  root.style.setProperty("--theme-shadow", theme.shadow);
  root.style.setProperty("--theme-icons", theme.icons);
  root.style.setProperty("--theme-body", theme.body);
  root.style.setProperty("--theme-income-btn", theme.incomeBtn);
  root.style.setProperty("--theme-expense-btn", theme.expenseBtn);
  root.style.setProperty("--theme-success", theme.success);
  root.style.setProperty("--theme-warning", theme.warning);
  root.style.setProperty("--theme-danger", theme.danger);

  // Handle background animation and size
  if (themeName === "wave-gradient") {
    root.style.setProperty("--theme-background-size", "300% 300%");
    root.style.setProperty(
      "--theme-animation",
      "waveGradient 15s ease infinite"
    );
  } else {
    root.style.setProperty("--theme-background-size", "100% 100%");
    root.style.setProperty("--theme-animation", "none");
  }

  // Save to localStorage
  localStorage.setItem("selectedTheme", themeName);
}

// Update default theme in load event
document.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("selectedTheme") || "default-pastel";
  applyTheme(savedTheme);
});

// Listen for storage changes (for cross-page updates)
window.addEventListener("storage", (e) => {
  if (e.key === "selectedTheme") {
    applyTheme(e.newValue);
  }
});
