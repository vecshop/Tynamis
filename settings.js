document.addEventListener("DOMContentLoaded", () => {
  // Add financial settings modal HTML
  document.body.insertAdjacentHTML(
    "beforeend",
    `
        <div class="modal fade" id="financialSettingsModal" data-bs-backdrop="static" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-fullscreen">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Perhitungan Finansial</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="financialSettingsForm">
                            <div class="mb-4">
                                <label class="form-label d-flex justify-content-between">
                                    <span>Safety Net Percentage</span>
                                    <span id="percentageValue">20%</span>
                                </label>
                                <input type="range" 
                                       class="form-range" 
                                       id="safetyNetPercentage" 
                                       min="0" 
                                       max="100" 
                                       value="20"
                                       style="accent-color: #4a90e2;">
                                <div class="d-flex justify-content-between text-muted small">
                                    <span>0%</span>
                                    <span>50%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            <div class="card p-3 mb-4">
                                <div class="d-flex justify-content-between align-items-center">
                                    <div>
                                        <h6 class="mb-1">Total Income</h6>
                                        <p class="mb-0" id="totalIncomeDisplay">Rp 0</p>
                                    </div>
                                    <div class="text-end">
                                        <h6 class="mb-1">Safety Net</h6>
                                        <p class="mb-0" id="safetyNetDisplay">Rp 0</p>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
  );

  // Get DOM elements
  const financialSettingsItem = document.querySelector(
    ".settings-item:first-child"
  );
  const financialModal = new bootstrap.Modal(
    document.getElementById("financialSettingsModal")
  );
  const percentageSlider = document.getElementById("safetyNetPercentage");
  const percentageValue = document.getElementById("percentageValue");
  const totalIncomeDisplay = document.getElementById("totalIncomeDisplay");
  const safetyNetDisplay = document.getElementById("safetyNetDisplay");

  // Initialize values from localStorage
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  let safetyNetPercentage =
    parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;

  // Set initial values
  percentageSlider.value = safetyNetPercentage;
  percentageValue.textContent = `${safetyNetPercentage}%`;
  totalIncomeDisplay.textContent = formatCurrency(totalIncome);
  updateSafetyNet(totalIncome, safetyNetPercentage);

  // Open modal when clicking on financial settings
  financialSettingsItem.addEventListener("click", () => {
    financialModal.show();
  });

  // Modify the percentage change handler
  percentageSlider.addEventListener("input", (e) => {
    const percentage = e.target.value;
    percentageValue.textContent = `${percentage}%`;
    updateSafetyNet(totalIncome, percentage);

    // Save to localStorage
    localStorage.setItem("safetyNetPercentage", percentage);

    // Update safety net and savings on main page if they exist
    const mainPageSafetyNet = document.querySelector(
      ".finance-item:first-child .finance-amount"
    );
    const mainPageSavings = document.querySelector(
      ".finance-item:nth-child(2) .finance-amount"
    );

    if (mainPageSafetyNet && mainPageSavings) {
      const safetyNetAmount = (totalIncome * percentage) / 100;
      const savingsAmount = (totalIncome * (100 - percentage)) / 100;

      mainPageSafetyNet.textContent = formatCurrency(safetyNetAmount);
      mainPageSavings.textContent = formatCurrency(savingsAmount);
    }
  });

  // Helper function to update safety net display
  function updateSafetyNet(income, percentage) {
    const safetyNet = (income * percentage) / 100;
    const savings = (income * (100 - percentage)) / 100;

    safetyNetDisplay.textContent = formatCurrency(safetyNet);
    // Add a savings preview in the modal
    document.getElementById("totalIncomeDisplay").innerHTML = `
        ${formatCurrency(totalIncome)}<br>
        <small class="text-muted">Savings: ${formatCurrency(savings)} (${
      100 - percentage
    }%)</small>
    `;
  }

  // Helper function to format currency
  function formatCurrency(amount) {
    return `Rp ${amount.toLocaleString("id-ID")}`;
  }

  // Initialize reset modals
  const resetModal = new bootstrap.Modal(document.getElementById("resetModal"));
  const confirmResetModal = new bootstrap.Modal(
    document.getElementById("confirmResetModal")
  );

  // Add click handler for reset settings item
  document
    .querySelector(".settings-item:last-child")
    .addEventListener("click", () => {
      resetModal.show();
    });

  // Reset All Data
  document.getElementById("resetAllData").addEventListener("click", () => {
    showConfirmation(
      "This will delete all your data including income, transactions, and wishlist items.",
      () => {
        localStorage.clear();
        window.location.href = "index.html";
      }
    );
  });

  // Reset Income Data
  document.getElementById("resetIncomeData").addEventListener("click", () => {
    showConfirmation(
      "This will reset your income and safety net settings.",
      () => {
        localStorage.removeItem("totalIncome");
        localStorage.removeItem("safetyNetPercentage");
        window.location.reload();
      }
    );
  });

  // Delete Histories
  document.getElementById("deleteHistories").addEventListener("click", () => {
    showConfirmation(
      "This will clear all transaction history and chart data.",
      () => {
        localStorage.removeItem("transactions");
        window.location.reload();
      }
    );
  });

  // Delete Wishlists
  document.getElementById("deleteWishlists").addEventListener("click", () => {
    showConfirmation("This will remove all items from your wishlist.", () => {
      localStorage.removeItem("wishlistItems");
      window.location.reload();
    });
  });

  function showConfirmation(message, callback) {
    document.getElementById("confirmMessage").textContent = message;
    document.getElementById("confirmResetBtn").onclick = () => {
      callback();
      confirmResetModal.hide();
      resetModal.hide();
    };
    resetModal.hide();
    confirmResetModal.show();
  }

  // Theme selection handler
  const themeInputs = document.querySelectorAll('input[name="theme"]');
  const currentTheme =
    localStorage.getItem("selectedTheme") || "default-pastel";

  // Set initial theme
  document.querySelector(`#${currentTheme}`).checked = true;

  // Handle theme changes
  themeInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      localStorage.setItem("selectedTheme", selectedTheme);
      applyTheme(selectedTheme);
    });
  });

  // Theme application function
  function applyTheme(theme) {
    const root = document.documentElement;
    const themes = {
      luxurious: {
        background: "linear-gradient(135deg, #1a1a1a, #4a4a4a)",
        text: "#ffffff",
        cardBg: "#2d2d2d",
      },
      emperal: {
        background: "linear-gradient(135deg, #2c1810, #5c3524)",
        text: "#ffffff",
        cardBg: "#3d251c",
      },
      minimus: {
        background: "linear-gradient(135deg, #232323, #454545)",
        text: "#ffffff",
        cardBg: "#333333",
      },
      octopus: {
        background: "linear-gradient(135deg, #1a1a2e, #16213e)",
        text: "#ffffff",
        cardBg: "#1f2b47",
      },
      matcha: {
        background: "linear-gradient(135deg, #e8f3d6, #fcffa6)",
        text: "#2d3748",
        cardBg: "#ffffff",
      },
      choco: {
        background: "linear-gradient(135deg, #f5e6d3, #d4a276)",
        text: "#2d3748",
        cardBg: "#ffffff",
      },
      "formal-blue": {
        background: "linear-gradient(135deg, #e0f4ff, #b3e5fc)",
        text: "#2d3748",
        cardBg: "#ffffff",
      },
      "golden-hour": {
        background: "linear-gradient(135deg, #ffd700, #ffa500)",
        text: "#2d3748",
        cardBg: "#ffffff",
      },
      "default-pastel": {
        background: "linear-gradient(135deg, #e0f4ff 0%, #ffe5f1 100%)",
        text: "#2d3748",
        cardBg: "#ffffff",
      },
    };

    const selectedTheme = themes[theme];
    if (selectedTheme) {
      root.style.setProperty("--theme-background", selectedTheme.background);
      root.style.setProperty("--theme-text", selectedTheme.text);
      root.style.setProperty("--theme-card-bg", selectedTheme.cardBg);
    }
  }

  // Animation for settings item expansion
  const settingsItems = document.querySelectorAll(
    '.settings-item[data-bs-toggle="collapse"]'
  );
  settingsItems.forEach((item) => {
    item.addEventListener("click", () => {
      const icon = item.querySelector(".toggle-icon");
      const isExpanded = item.getAttribute("aria-expanded") === "true";
      icon.style.transform = isExpanded ? "rotate(0deg)" : "rotate(180deg)";
    });
  });

  // Apply saved theme on load
  applyTheme(currentTheme);

  // About App Modal Handler
  const aboutAppItem = document.querySelector(
    ".settings-item:nth-last-child(2)"
  );
  const aboutAppModal = new bootstrap.Modal(
    document.getElementById("aboutAppModal")
  );

  aboutAppItem.addEventListener("click", () => {
    aboutAppModal.show();
  });

  // Language Modal Handler
  const languageItem = document.querySelector(
    ".settings-item:nth-last-child(3)"
  );
  const languageModal = new bootstrap.Modal(
    document.getElementById("languageModal")
  );
  const requestLanguageBtn = document.getElementById("requestLanguageBtn");

  // Show language modal when clicking language item
  languageItem.addEventListener("click", () => {
    languageModal.show();
  });

  // Handle request language update button
  requestLanguageBtn.addEventListener("click", () => {
    // Open email client with pre-filled subject
    window.location.href =
      "mailto:vectorcompany1210@gmail.com?subject=Language%20Support%20Request&body=I%20would%20like%20to%20request%20additional%20language%20support%20for%20the%20Income%20Tracker%20app.";
  });
});

// In settings.js, modify the theme selection handler
document.addEventListener("DOMContentLoaded", () => {
  // Theme selection handler
  const themeInputs = document.querySelectorAll('input[name="theme"]');
  const currentTheme = localStorage.getItem("selectedTheme") || "formal-blue";

  // Set initial theme
  document.querySelector(`#${currentTheme}`).checked = true;

  // Handle theme changes
  themeInputs.forEach((input) => {
    input.addEventListener("change", (e) => {
      const selectedTheme = e.target.value;
      applyTheme(selectedTheme);
    });
  });
});
