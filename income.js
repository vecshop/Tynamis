// Initialize totalIncome from localStorage or set to 0
let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;

// Initialize transactions array from localStorage or empty array
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Add at the top with other initializations
let safetyNetPercentage =
  parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;

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

// Modify the Welcome Modal Logic section
document.addEventListener("DOMContentLoaded", () => {
  // Check if it's first visit
  const hasVisited = localStorage.getItem("hasVisited");

  if (!hasVisited) {
    // Add shadow-elements class to all major components
    const elementsToShadow = document.querySelectorAll(
      ".finance-card, .transaction-list, #indexWishlistGrid"
    );
    elementsToShadow.forEach((el) => el.classList.add("shadow-elements"));

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

    // Initialize start guide
    initializeStartGuide();

    // Store that user has visited
    localStorage.setItem("hasVisited", "true");
  }
});

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

document.addEventListener("DOMContentLoaded", () => {
  // Get DOM elements
  const addExpenseBtn = document.querySelector("button:has(.bi-dash-circle)");

  // Add expense button click handler
  addExpenseBtn.addEventListener("click", () => {
    expenseModal.show();
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

// Modify the updateSafetyNetDisplay function to also update savings
function updateSafetyNetDisplay() {
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;
  const safetyNetDisplay = document.querySelector(
    ".finance-item:first-child .finance-amount"
  );
  if (safetyNetDisplay) {
    safetyNetDisplay.textContent = formatCurrency(safetyNetAmount);
  }
  // Update savings whenever safety net is updated
  updateSavingsDisplay();
}

// Add this function after updateSafetyNetDisplay function
function updateSavingsDisplay() {
  const savingsPercentage = 100 - safetyNetPercentage;
  const savingsAmount = (totalIncome * savingsPercentage) / 100;
  const savingsDisplay = document.querySelector(
    ".finance-item:nth-child(2) .finance-amount"
  );
  if (savingsDisplay) {
    savingsDisplay.textContent = formatCurrency(savingsAmount);
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
  // Update savings whenever safety net is updated
  updateSavingsDisplay();
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

// Add these helper functions
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
    // Remove existing animation classes
    totalIncomeDisplay.classList.remove("animate-count-up");
    safetyNetDisplay.classList.remove("animate-flash-fade");
    savingsDisplay.classList.remove("animate-flash-fade");

    // Force reflow
    void totalIncomeDisplay.offsetWidth;
    void safetyNetDisplay.offsetWidth;
    void savingsDisplay.offsetWidth;

    // Get previous values
    const prevIncome =
      parseFloat(totalIncomeDisplay.textContent.replace(/[^0-9.-]+/g, "")) || 0;

    // Calculate new values
    const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;
    const savingsAmount = totalIncome - safetyNetAmount;

    // Start animations
    // Total Income animation
    animateValue(totalIncomeDisplay, prevIncome, totalIncome, 500);

    // Savings animation (after income)
    setTimeout(() => {
      savingsDisplay.textContent = formatCurrency(savingsAmount);
      savingsDisplay.classList.add("animate-flash-fade");
    }, 500);

    // Safety Net animation (after savings)
    setTimeout(() => {
      safetyNetDisplay.textContent = formatCurrency(safetyNetAmount);
      safetyNetDisplay.classList.add("animate-flash-fade");
    }, 800);
  }
}

// In income.js, update the handleIncomeSubmit function:
function handleIncomeSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("incomeAmount").value);
  if (!amount || isNaN(amount)) return;

  const prevTotal = totalIncome;
  totalIncome += amount;

  // Create transaction
  const transaction = {
    type: "income",
    amount: amount,
    date: new Date().toISOString(),
  };

  // Add to transactions array and save
  transactions.unshift(transaction);
  localStorage.setItem("totalIncome", totalIncome.toString());
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Close modal first
  incomeModal.hide();

  // Wait for modal transition to complete
  setTimeout(() => {
    // Get all display elements
    const totalIncomeDisplay = document.querySelector(
      ".finance-item:nth-child(3) .finance-amount"
    );
    const safetyNetDisplay = document.querySelector(
      ".finance-item:first-child .finance-amount"
    );
    const savingsDisplay = document.querySelector(
      ".finance-item:nth-child(2) .finance-amount"
    );

    // Calculate new values
    const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;
    const savingsAmount = totalIncome - safetyNetAmount;

    // Start animations in sequence
    // 1. Animate Total Income
    animateValue(totalIncomeDisplay, prevTotal, totalIncome);

    // 2. Animate Savings after income (with delay)
    setTimeout(() => {
      animateFlashFade(savingsDisplay, savingsAmount, 0);
    }, 200);

    // 3. Animate Safety Net last
    setTimeout(() => {
      animateFlashFade(safetyNetDisplay, safetyNetAmount, 0);
    }, 400);

    // Add transaction to history
    addTransactionToHistory(transaction);
  }, 300);

  // Reset form
  incomeForm.reset();
}

function handleExpenseSubmit(e) {
  e.preventDefault();

  const amount = parseFloat(document.getElementById("expenseAmount").value);
  const reason = document.getElementById("expenseReason").value;
  const category = document.querySelector(
    'input[name="category"]:checked'
  ).value;

  if (!amount || isNaN(amount)) return;

  const prevTotal = totalIncome;
  totalIncome -= amount;

  // Create transaction
  const transaction = {
    type: "expense",
    amount: amount,
    reason: reason,
    category: category,
    date: new Date().toISOString(),
  };

  // Save to localStorage
  localStorage.setItem("totalIncome", totalIncome.toString());
  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Close modal first
  expenseModal.hide();

  // Wait for modal transition
  setTimeout(() => {
    // Trigger animations
    const totalIncomeDisplay = document.querySelector(
      ".finance-item:nth-child(3) .finance-amount"
    );
    const safetyNetDisplay = document.querySelector(
      ".finance-item:first-child .finance-amount"
    );
    const savingsDisplay = document.querySelector(
      ".finance-item:nth-child(2) .finance-amount"
    );

    // Calculate new values
    const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;
    const savingsAmount = totalIncome - safetyNetAmount;

    // Animate Total Income
    animateValue(totalIncomeDisplay, prevTotal, totalIncome);

    // Animate Savings after income
    setTimeout(() => {
      savingsDisplay.classList.add("animate-flash-fade");
      savingsDisplay.textContent = formatCurrency(savingsAmount);
    }, 200);

    // Animate Safety Net last
    setTimeout(() => {
      safetyNetDisplay.classList.add("animate-flash-fade");
      safetyNetDisplay.textContent = formatCurrency(safetyNetAmount);
    }, 400);

    // Add to expense history
    addExpenseToHistory(amount, reason, category);
  }, 300);

  // Reset form
  expenseForm.reset();
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
