// Variabel utama yang harus konsisten di semua file
let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
let totalSafetyNet = parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
let totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
let safetyNetPercentage =
  parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;

// Initialize transactions array from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Add after other initializations
let startGuide = {
  currentStep: 0,
  hasCompleted: localStorage.getItem("hasCompletedGuide") === "true",
};

// Move these variables to the top level scope
let totalIncomeDisplay;
let incomeModal;
let incomeForm;
let expenseModal;
let expenseForm;

// Move categories definition to top level, before any function uses it
const categories = [
  { id: "food", icon: "bi-egg-fried", title: "Makanan" },
  { id: "sport", icon: "bi-bicycle", title: "Olahraga" },
  { id: "experiment", icon: "bi-flask", title: "Eksperimen" },
  { id: "transport", icon: "bi-car-front", title: "Transportasi" },
  { id: "fashion", icon: "bi-bag", title: "Fashion" },
  { id: "education", icon: "bi-book", title: "Pendidikan" },
  { id: "health", icon: "bi-heart-pulse", title: "Kesehatan" },
  { id: "shopping", icon: "bi-cart", title: "Shopping" },
  { id: "entertainment", icon: "bi-controller", title: "Entertainment" },
  { id: "other", icon: "bi-three-dots", title: "Lainnya" },
];

// Tambahkan fungsi ini di bagian atas file
function calculateSafetyNet() {
    const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    const safetyNetPercentage = parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
    return (totalIncome * safetyNetPercentage) / 100;
}

function updateAllSafetyNetDisplays() {
    const safetyNet = parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
    const displays = document.querySelectorAll('.finance-item:first-child .finance-amount');
    displays.forEach(display => {
        if (display) {
            animateValue(display, parseFloat(display.textContent.replace(/[^0-9]/g, '')), safetyNet);
        }
    });
}

// Add this function at the beginning after initializations
function loadTransactionHistory() {
  const transactionList = document.querySelector(".transaction-list");
  if (!transactionList) return;

  // Clear existing transactions
  transactionList.innerHTML = "";

  // Get transactions from localStorage and sort by date (newest first)
  const savedTransactions = transactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5); // Get only the 5 most recent transactions

  if (savedTransactions.length === 0) {
    // Show empty state
    const emptyHTML = `
        <div class="text-center py-4">
            <img src="https://png.pngtree.com/png-vector/20250116/ourmid/pngtree-file-prescription-empty-vector-png-image_15213602.png" 
                 alt="No transactions" 
                 style="width: 150px; height: auto; opacity: 0.5; margin-bottom: 1rem;">
            <p class="text-muted mb-0">Anda belum melakukan transaksi</p>
        </div>
    `;
    transactionList.innerHTML = emptyHTML;
    return;
  }

  // Display transactions if there are any
  savedTransactions.forEach((transaction) => {
    if (transaction.type === "income") {
      addTransactionToHistory(transaction);
    } else {
      addExpenseToHistory(
        transaction.amount,
        transaction.reason,
        transaction.category
      );
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Add modal HTML to the document body
  document.body.insertAdjacentHTML(
    "beforeend",
    `
        <div class="modal fade" id="incomeModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="border: none; border-radius: 15px;">
                    <div class="modal-header" style="background: var(--theme-background); border-bottom: none;">
                        <h5 class="modal-title">Tambah Income</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="incomeForm">
                            <div class="mb-3">
                                <label for="incomeAmount" class="form-label">Jumlah Income</label>
                                <div class="input-group">
                                    <span class="input-group-text">Rp</span>
                                    <input type="number" class="form-control" id="incomeAmount" required min="0">
                                </div>
                            </div>
                            <div class="d-grid">
                                <button type="submit" class="btn" style="background: var(--theme-background); color: var(--theme-text);">
                                    Tambah
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `
  );

  // Get DOM elements
  const addIncomeBtn = document.querySelector("button:has(.bi-plus-circle)");
  totalIncomeDisplay = document.querySelector(
    ".finance-item:nth-child(3) .finance-amount"
  );

  // Initialize modals
  incomeModal = new bootstrap.Modal(document.getElementById("incomeModal"));
  expenseModal = new bootstrap.Modal(document.getElementById("expenseModal"));

  // Get form elements
  incomeForm = document.getElementById("incomeForm");
  expenseForm = document.getElementById("expenseForm");

  // Add income button click handler
  addIncomeBtn.addEventListener("click", () => {
    incomeModal.show();
  });

  // Initial display updates
  updateDisplays();

  // Load saved transactions
  loadTransactionHistory();

  // Form submit handlers
  incomeForm.addEventListener("submit", handleIncomeSubmit);
  expenseForm.addEventListener("submit", handleExpenseSubmit);
});

// Add expense modal HTML
document.body.insertAdjacentHTML(
  "beforeend",
  `
    <div class="modal fade" id="expenseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border: none; border-radius: 15px;">
                <div class="modal-header" style="background: var(--theme-background); border-bottom: none;">
                    <h5 class="modal-title">Tambah Pengeluaran</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <form id="expenseForm">
                        <div class="mb-3">
                            <label for="expenseAmount" class="form-label">Jumlah Pengeluaran</label>
                            <div class="input-group">
                                <span class="input-group-text">Rp</span>
                                <input type="number" class="form-control" id="expenseAmount" required min="0">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="expenseReason" class="form-label">Alasan</label>
                            <input type="text" class="form-control" id="expenseReason" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Kategori</label>
                            <div class="row g-2">
                                ${categories
                                  .map(
                                    (cat) => `
                                    <div class="col-4">
                                        <input type="radio" class="btn-check" name="category" id="${cat.id}" value="${cat.id}" required>
                                        <label class="btn w-100 h-100 d-flex flex-column align-items-center justify-content-center p-2 category-label" 
                                               for="${cat.id}">
                                            <i class="bi ${cat.icon} fs-4"></i>
                                            <span class="small mt-1">${cat.title}</span>
                                        </label>
                                    </div>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                        <div class="d-grid">
                            <button type="submit" class="btn" style="background:var(--theme-background); color: var(--theme-text);">
                                Kurangi Income Sekarang
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
`
);

// Ganti dengan implementasi yang benar
document.addEventListener("DOMContentLoaded", () => {
  // Initialize modals
  noSafetyNetModal = new bootstrap.Modal(
    document.getElementById("noSafetyNetModal")
  );
  expenseModal = new bootstrap.Modal(document.getElementById("expenseModal"));

  // Get the add expense button
  const addExpenseBtn = document.querySelector("button:has(.bi-dash-circle)");

  // Add click handler
  addExpenseBtn.addEventListener("click", () => {
    const currentSafetyNet =
      parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

    if (currentSafetyNet <= 0) {
      // Only show no safety net modal
      noSafetyNetModal.show();
    } else {
      // Show expense modal directly
      expenseModal.show();
    }
  });

  // Handle eat savings button click
  document.getElementById("eatSavingsBtn").addEventListener("click", () => {
    noSafetyNetModal.hide();
    setTimeout(() => {
      expenseModal.show();
    }, 400); // Wait for modal transition
  });
});

// Helper function to format currency
function formatCurrency(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// Update the animateValue function for smoother animation
function animateValue(element, start, end) {
  if (!element) return;

  // Remove existing animations
  element.classList.remove("animate-count-up", "animate-flash-fade");
  void element.offsetWidth; // Force reflow

  const duration = 1000;
  const steps = 60;
  const stepDuration = duration / steps;
  const increment = (end - start) / steps;
  let currentStep = 0;
  let currentValue = start;

  element.classList.add("animate-count-up");

  function updateValue() {
    currentStep++;
    currentValue += increment;
    element.textContent = formatCurrency(Math.round(currentValue));

    if (currentStep < steps) {
      requestAnimationFrame(() => {
        setTimeout(updateValue, stepDuration);
      });
    } else {
      element.textContent = formatCurrency(end);
      element.classList.remove("animate-count-up");
    }
  }

  requestAnimationFrame(updateValue);
}

// Update the animateFlashFade function for cleaner animation
function animateFlashFade(element, value) {
  if (!element) return;

  // Remove existing animations
  element.classList.remove("animate-count-up", "animate-flash-fade");
  void element.offsetWidth; // Force reflow

  // Add animation class and update value
  element.classList.add("animate-flash-fade");
  element.textContent = formatCurrency(value);

  // Remove animation class after completion
  setTimeout(() => {
    element.classList.remove("animate-flash-fade");
  }, 500);
}

// Helper function to add transaction to history
function addTransactionToHistory(transaction) {
  const transactionList = document.querySelector(".transaction-list");
  const currentDate = new Date(transaction.date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const transactionHTML = `
        <div class="d-flex align-items-center p-2 border-bottom">
            <div class="transaction-icon bg-success bg-opacity-10 rounded-circle p-2 me-3">
                <i class="bi bi-arrow-up-circle text-success"></i>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="mb-0 fw-medium">Income</p>
                        <small class="text-date">${currentDate}</small>
                    </div>
                    <span class="text-success fw-semibold">+${formatCurrency(
                      transaction.amount
                    )}</span>
                </div>
            </div>
        </div>
    `;

  // Add to the beginning of the list
  transactionList.insertAdjacentHTML("afterbegin", transactionHTML);

  // Remove excess transactions if more than 5
  const allTransactions = transactionList.children;
  if (allTransactions.length > 5) {
    transactionList.removeChild(allTransactions[allTransactions.length - 1]);
  }
}

// Add function to handle expense history
function addExpenseToHistory(amount, reason, category) {
  const transactionList = document.querySelector(".transaction-list");
  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  // Find category data with fallback to 'other'
  const categoryData =
    categories.find((cat) => cat.id === category) ||
    categories.find((cat) => cat.id === "other");

  const transactionHTML = `
        <div class="d-flex align-items-center p-2 border-bottom">
            <div class="transaction-icon bg-danger bg-opacity-10 rounded-circle p-2 me-3">
                <i class="bi bi-arrow-down-circle text-danger"></i>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <p class="mb-0 fw-medium">${reason}</p>
                        <small class="text-category">
                            <i class="bi ${categoryData.icon} me-1"></i>
                            ${categoryData.title} • ${currentDate}
                        </small>
                    </div>
                    <span class="text-danger fw-semibold">-${formatCurrency(
                      amount
                    )}</span>
                </div>
            </div>
        </div>
    `;

  // Add to the beginning of the list
  transactionList.insertAdjacentHTML("afterbegin", transactionHTML);

  // Remove excess transactions if more than 5
  const allTransactions = transactionList.children;
  if (allTransactions.length > 5) {
    transactionList.removeChild(allTransactions[allTransactions.length - 1]);
  }
}

// Add this function to calculate and update safety net
function updateSafetyNetDisplay() {
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;
  const safetyNetDisplay = document.querySelector(
    ".finance-item:first-child .finance-amount"
  );
  if (safetyNetDisplay) {
    safetyNetDisplay.textContent = formatCurrency(safetyNetAmount);
  }
}

// Modify the DOMContentLoaded event listener to include initial savings update
document.addEventListener("DOMContentLoaded", () => {
  // Add initial safety net and savings update
  updateSafetyNetDisplay(); // This will also update savings

  // Initialize help guide modal
  const helpIcon = document.querySelector(".help-icon");
  const helpGuideModal = new bootstrap.Modal(
    document.getElementById("helpGuideModal")
  );

  // Add click handler for help icon
  helpIcon.addEventListener("click", () => {
    helpGuideModal.show();
  });

  // Initialize financial settings modal
  const safetyNetSettings = document.getElementById("safetyNetSettings");
  if (safetyNetSettings) {
    const financialModal = new bootstrap.Modal(
      document.getElementById("financialSettingsModal")
    );

    safetyNetSettings.addEventListener("click", () => {
      // Set current value in input
      const currentPercent =
        parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
      document.getElementById("safetyNetPercent").value = currentPercent;
      financialModal.show();
    });
  }

  // Add save settings handler
  const saveSettingsBtn = document.getElementById("saveSafetyNetSettings");
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener("click", () => {
      const newPercent = parseFloat(
        document.getElementById("safetyNetPercent").value
      );
      if (!isNaN(newPercent) && newPercent >= 0 && newPercent <= 100) {
        localStorage.setItem("safetyNetPercentage", newPercent.toString());
        safetyNetPercentage = newPercent;
        updateDisplays();
        bootstrap.Modal.getInstance(
          document.getElementById("financialSettingsModal")
        ).hide();
      }
    });
  }

  // Modify the income form submit handler
  incomeForm.addEventListener("submit", (e) => {
    // Update displays
    totalIncomeDisplay.textContent = formatCurrency(totalIncome);
    updateSafetyNetDisplay(); // This will also update savings
  });

  // Modify the expense form submit handler
  expenseForm.addEventListener("submit", (e) => {
    // Update displays
    document.querySelector(
      ".finance-item:nth-child(3) .finance-amount"
    ).textContent = formatCurrency(totalIncome);
    updateSafetyNetDisplay(); // This will also update savings
  });
});

// In income.js, update the handleIncomeSubmit function:
function handleIncomeSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("incomeAmount").value);
  if (!amount || isNaN(amount)) return;

  // Hitung safety net baru
  const safetyNetAmount = calculateSafetyNet();
  
  // Update totals
  totalIncome += amount;
  totalSafetyNet = safetyNetAmount;
  totalSavings = totalIncome - safetyNetAmount;
  
  // Simpan ke localStorage
  localStorage.setItem("totalIncome", totalIncome.toString());
  localStorage.setItem("totalSafetyNet", totalSafetyNet.toString());
  localStorage.setItem("totalSavings", totalSavings.toString());

  // Dispatch event untuk update
  window.dispatchEvent(new CustomEvent("safetyNetUpdated", {
      detail: {
          safetyNet: totalSafetyNet
      }
  }));

  // Update displays
  updateAllSafetyNetDisplays();
  
  // ...sisa kode
}

// Welcome Modal Logic
document.addEventListener("DOMContentLoaded", () => {
  // Check if it's first visit
  const hasVisited = localStorage.getItem("hasVisited");

  if (!hasVisited) {
    // Show welcome modal
    const welcomeModal = new bootstrap.Modal(
      document.getElementById("welcomeModal")
    );
    welcomeModal.show();

    // Initialize carousel
    const welcomeCarousel = new bootstrap.Carousel(
      document.getElementById("welcomeCarousel"),
      {
        interval: false,
        keyboard: false,
      }
    );

    // Store that user has visited
    localStorage.setItem("hasVisited", "true");
  }

  // const safetyNetSettings = document.getElementById("safetyNetSettings");
  // const financialModal = new bootstrap.Modal(
  //   document.getElementById("financialSettingsModal")
  // );

  // safetyNetSettings.addEventListener("click", () => {
  //   financialModal.show();
  // });
});

// Function to move to next slide
function nextSlide() {
  const carousel = bootstrap.Carousel.getInstance(
    document.getElementById("welcomeCarousel")
  );
  carousel.next();
}

// Function to start the app
function startApp() {
  const welcomeModal = bootstrap.Modal.getInstance(
    document.getElementById("welcomeModal")
  );
  welcomeModal.hide();
}

// Add this function after document.addEventListener('DOMContentLoaded', ...)
function initializeStartGuide() {
  if (!startGuide.hasCompleted && !localStorage.getItem("hasVisited")) {
    // Start the guide after welcome modal is closed
    document
      .getElementById("welcomeModal")
      .addEventListener("hidden.bs.modal", () => {
        setTimeout(showNextGuideStep, 500);
      });
  }
}

// Update the showNextGuideStep function
function showNextGuideStep() {
  // Remove existing overlay if any
  const existingOverlay = document.querySelector(".guide-overlay");
  if (existingOverlay) existingOverlay.remove();

  // Remove active class from all elements first
  document.querySelectorAll(".shadow-elements").forEach((el) => {
    el.classList.remove("active");
  });

  // Create and add new overlay
  const overlay = document.createElement("div");
  overlay.className = "guide-overlay";
  document.body.appendChild(overlay);

  // Get elements
  const elements = document.querySelectorAll(".shadow-elements");
  const addIncomeBtn = document.querySelector("button:has(.bi-plus-circle)");
  const addExpenseBtn = document.querySelector("button:has(.bi-dash-circle)");

  // Remove existing highlights and tooltips
  elements.forEach((el) => {
    el.classList.remove("highlight");
    const existingTooltip = document.querySelector(".guide-tooltip");
    if (existingTooltip) existingTooltip.remove();
  });

  switch (startGuide.currentStep) {
    case 0:
      // Show overlay and add shadow to all elements
      setTimeout(() => {
        overlay.classList.add("show");
        elements.forEach((el) => el.classList.add("active"));
      }, 100);

      // Highlight Add Income button
      addIncomeBtn.classList.add("highlight");

      const incomeTooltip = createTooltip(
        "Tambahkan Income",
        "Gunakan tombol ini untuk menambahkan pemasukan baru. Income akan otomatis terbagi menjadi Safety Net dan Savings sesuai persentase yang ditentukan.",
        addIncomeBtn
      );

      startGuide.currentStep++;
      break;

    case 1:
      // Show overlay and add shadow to all elements
      setTimeout(() => {
        overlay.classList.add("show");
        elements.forEach((el) => el.classList.add("active"));
      }, 100);

      // Highlight Add Expense button
      addExpenseBtn.classList.add("highlight");

      const expenseTooltip = createTooltip(
        "Catat Pengeluaran",
        "Gunakan tombol ini untuk mencatat setiap pengeluaran. Pilih kategori yang sesuai untuk memudahkan pelacakan pengeluaran Anda.",
        addExpenseBtn
      );

      startGuide.currentStep++;
      break;

    default:
      // Remove overlay
      overlay.classList.remove("show");
      setTimeout(() => {
        overlay.remove();
        // Clear all active states and highlights
        elements.forEach((el) => {
          el.classList.remove("active");
          el.classList.remove("highlight");
        });
      }, 300);

      localStorage.setItem("hasCompletedGuide", "true");
      startGuide.hasCompleted = true;
      break;
  }
}

// Update createTooltip function to ensure tooltip is above overlay
function createTooltip(title, description, targetElement) {
  const tooltip = document.createElement("div");
  tooltip.className = "guide-tooltip";
  tooltip.style.zIndex = "1051"; // Make sure tooltip is above overlay
  tooltip.innerHTML = `
      <div class="guide-tooltip-arrow"></div>
      <h6 class="mb-2">${title}</h6>
      <p class="small mb-3">${description}</p>
      <button class="guide-btn" onclick="showNextGuideStep()">
          ${startGuide.currentStep === 1 ? "Lanjut" : "Selesai"}
      </button>
  `;

  // Add tooltip to body first to get dimensions
  document.body.appendChild(tooltip);

  // Calculate positions
  const targetRect = targetElement.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const arrowSize = 10; // Size of the arrow

  // Calculate initial position (below the target)
  let top = targetRect.bottom + arrowSize;
  let left = targetRect.left;

  // Check right edge overflow
  if (left + tooltipRect.width > window.innerWidth - 16) {
    left = window.innerWidth - tooltipRect.width - 16;
  }

  // Check left edge overflow
  if (left < 16) {
    left = 16;
  }

  // Check bottom edge overflow
  if (top + tooltipRect.height > window.innerHeight - 16) {
    // Place tooltip above the target
    top = targetRect.top - tooltipRect.height - arrowSize;
    tooltip.classList.add("arrow-bottom");
  } else {
    tooltip.classList.add("arrow-top");
  }

  // Calculate arrow position
  const arrowLeft = Math.max(
    20, // Minimum distance from left
    Math.min(
      targetRect.left - left + targetRect.width / 2,
      tooltipRect.width - 20 // Maximum distance from right
    )
  );

  // Update CSS for tooltip and arrow
  tooltip.style.cssText = `
      position: fixed;
      top: ${top}px;
      left: ${left}px;
      z-index: 1051;
  `;

  // Update arrow position
  const arrow = tooltip.querySelector(".guide-tooltip-arrow");
  arrow.style.left = `${arrowLeft}px`;

  // Add show class after position is set
  setTimeout(() => tooltip.classList.add("show"), 100);

  return tooltip;
}

// Add at the top with other initializations
let isManuallyAdjusted = localStorage.getItem("isManuallyAdjusted") === "true";

// Update handleIncomeSubmit function
function handleIncomeSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("incomeAmount").value);
  if (!amount || isNaN(amount)) return;

  // Calculate new income distribution
  const safetyNetAmount = (amount * safetyNetPercentage) / 100;
  const savingsAmount = amount - safetyNetAmount;

  // Update totals
  totalIncome += amount;
  totalSafetyNet += safetyNetAmount;
  totalSavings += savingsAmount;

  // Save to localStorage
  localStorage.setItem("totalIncome", totalIncome.toString());
  localStorage.setItem("totalSafetyNet", totalSafetyNet.toString());
  localStorage.setItem("totalSavings", totalSavings.toString());

  // Dispatch custom event for safety net change
  window.dispatchEvent(
    new CustomEvent("safetyNetUpdated", {
      detail: {
        safetyNet: totalSafetyNet,
      },
    })
  );

  // Create transaction
  const transaction = {
    type: "income",
    amount: amount,
    safetyNet: safetyNetAmount,
    savings: savingsAmount,
    date: new Date().toISOString(),
  };

  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Close modal and update displays
  incomeModal.hide();
  setTimeout(() => updateDisplays(), 300);

  // Reset form
  incomeForm.reset();
}

// Update updateDisplays function
// Keep this single implementation of updateDisplays
function updateDisplays() {
  const totalIncomeDisplay = document.querySelector(
    ".finance-item:nth-child(3) .finance-amount"
  );
  const safetyNetDisplay = document.querySelector(
    ".finance-item:first-child .finance-amount"
  );
  const savingsDisplay = document.querySelector(
    ".finance-item:nth-child(2) .finance-amount"
  );

  if (totalIncomeDisplay) {
    const currentIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
    const currentSafetyNet =
      parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
    const currentSavings =
      parseFloat(localStorage.getItem("totalSavings")) || 0;

    animateValue(
      totalIncomeDisplay,
      parseFloat(totalIncomeDisplay.textContent.replace(/[^0-9]/g, "")),
      currentIncome
    );
    animateValue(
      safetyNetDisplay,
      parseFloat(safetyNetDisplay.textContent.replace(/[^0-9]/g, "")),
      currentSafetyNet
    );
    animateValue(
      savingsDisplay,
      parseFloat(savingsDisplay.textContent.replace(/[^0-9]/g, "")),
      currentSavings
    );
  }
}

// Add with other modal initializations
let noSafetyNetModal;

// Replace the existing handleExpenseSubmit function with this one
function handleExpenseSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const reason = document.getElementById("expenseReason").value;
  const category = document.querySelector(
    'input[name="category"]:checked'
  ).value;

  if (!amount || isNaN(amount)) return;

  // Get current values
  let currentSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
  let currentSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
  let currentIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;

  // Store original values for animation
  const originalIncome = currentIncome;
  const originalSavings = currentSavings;
  const originalSafetyNet = currentSafetyNet;

  // Handle expense reduction logic
  if (currentSafetyNet <= 0) {
    // When safety net is already 0, deduct from savings directly
    currentSavings = Math.max(0, currentSavings - amount);
    currentIncome = Math.max(0, currentIncome - amount);
    // Keep safety net at 0
    currentSafetyNet = 0;
  } else if (amount <= currentSafetyNet) {
    // If expense is less than or equal to safety net, only reduce safety net
    currentSafetyNet = Math.max(0, currentSafetyNet - amount);
    currentIncome = Math.max(0, currentIncome - amount);
  } else {
    // If expense is more than safety net, use up safety net and take remainder from savings
    const remainingExpense = amount - currentSafetyNet;
    currentSavings = Math.max(0, currentSavings - remainingExpense);
    currentSafetyNet = 0;
    currentIncome = Math.max(0, currentIncome - amount);
  }

  // Update global variables
  totalIncome = currentIncome;
  totalSavings = currentSavings;
  totalSafetyNet = currentSafetyNet;

  // Save to localStorage
  localStorage.setItem("totalIncome", totalIncome.toString());
  localStorage.setItem("totalSavings", totalSavings.toString());
  localStorage.setItem("totalSafetyNet", totalSafetyNet.toString());

  // Dispatch custom event for safety net change
  window.dispatchEvent(
    new CustomEvent("safetyNetUpdated", {
      detail: {
        safetyNet: currentSafetyNet,
        savings: currentSavings,
        income: currentIncome,
      },
    })
  );

  // Create transaction record
  const transaction = {
    type: "expense",
    amount: amount,
    reason: reason,
    category: category,
    date: new Date().toISOString(),
    affectedSavings: currentSafetyNet === 0,
  };

  // Add to transactions history
  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Close modal and update displays
  expenseModal.hide();
  setTimeout(() => {
    const totalIncomeDisplay = document.querySelector(
      ".finance-item:nth-child(3) .finance-amount"
    );
    const safetyNetDisplay = document.querySelector(
      ".finance-item:first-child .finance-amount"
    );
    const savingsDisplay = document.querySelector(
      ".finance-item:nth-child(2) .finance-amount"
    );

    // Animate value changes
    animateValue(totalIncomeDisplay, originalIncome, currentIncome);
    animateValue(savingsDisplay, originalSavings, currentSavings);
    animateValue(safetyNetDisplay, originalSafetyNet, currentSafetyNet);

    addExpenseToHistory(amount, reason, category);
  }, 300);

  expenseForm.reset();
}
