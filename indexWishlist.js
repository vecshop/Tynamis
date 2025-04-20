// Define wishlist types (copy from wishlist.js)
const wishlistTypes = [
  { id: "gadget", label: "Gadget", color: "#e0f4ff" },
  { id: "fashion", label: "Fashion", color: "#ffe5f1" },
  { id: "education", label: "Pendidikan", color: "#e0f4ff" },
  { id: "hobby", label: "Hobi", color: "#ffe5f1" },
  { id: "health", label: "Kesehatan", color: "#e0f4ff" },
  { id: "other", label: "Lainnya", color: "#ffe5f1" },
];

// Add wishlistItems initialization
let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
let insufficientModal;
let useSavingsModal;
let confirmBuyModal;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize modals
  insufficientModal = new bootstrap.Modal(
    document.getElementById("insufficientModal")
  );
  useSavingsModal = new bootstrap.Modal(
    document.getElementById("useSavingsModal")
  );
  confirmBuyModal = new bootstrap.Modal(
    document.getElementById("confirmBuyModal")
  );

  // Load wishlist items
  loadLatestWishlistItems();

  // Add event listener for safety net updates
  window.addEventListener("safetyNetUpdated", (e) => {
    const { safetyNet, savings, income } = e.detail;

    // Update all wishlist items' status
    const wishlistItems = document.querySelectorAll("#indexWishlistGrid .card");
    wishlistItems.forEach((item) => {
      const price = parseFloat(item.dataset.price);
      updateItemStatus(item, price, safetyNet, income);
    });
  });

  // Listen for safety net updates
  window.addEventListener("safetyNetUpdated", (e) => {
    updateStatusIndicators();
    updateSafetyNetDisplay();
  });

  // Initial update
  updateStatusIndicators();
});

// Modify the loadLatestWishlistItems function
function loadLatestWishlistItems() {
  const wishlistGrid = document.getElementById("indexWishlistGrid");
  if (!wishlistGrid) return;

  // Get latest items
  const latestItems = wishlistItems.slice(0, 2);

  // Clear existing content
  wishlistGrid.innerHTML = "";

  if (latestItems.length === 0) {
    // Show empty state
    const emptyHTML = `
            <div class="col-12">
                <div class="text-center py-4">
                    <img src="https://png.pngtree.com/png-vector/20250116/ourmid/pngtree-empty-box-vector-png-image_15212860.png" 
                         alt="Empty wishlist" 
                         style="width: 150px; height: auto; opacity: 0.5; margin-bottom: 1rem;">
                    <p class="text-placehold mb-0">Impianmu belum kamu catat. tambahkan sekarang!</p>
                </div>
            </div>
        `;
    wishlistGrid.innerHTML = emptyHTML;
    return;
  }

  // Display items if there are any
  latestItems.forEach((item) => {
    const typeData = wishlistTypes.find((type) => type.id === item.type);
    const status = getPurchaseStatus(item.price);

    const wishlistHTML = `
            <div class="col-md-6" data-id="${item.id}">
                <div class="card h-100" style="border: none; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08)">
                    <div class="position-relative">
                        <img src="${
                          item.thumbnail
                        }" class="card-img-top" alt="${item.name}">
                        <span class="position-absolute top-0 end-0 m-2 badge" 
                              style="background: ${
                                typeData.color
                              }; color: #2d3748">
                            ${typeData.label}
                        </span>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title mb-2">${item.name}</h6>
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <p class="card-text fw-semibold mb-0" style="color: #2d3748">
                                Rp ${item.price.toLocaleString("id-ID")}
                            </p>
                            <i class="bi ${status.icon} ${status.color}" 
                               data-bs-toggle="tooltip" 
                               data-bs-placement="left" 
                               title="${status.tooltip}"></i>
                        </div>
                        <div class="d-flex justify-content-between">
                        <button class="btn btn-sm buy-btn" 
                                style="background: var(--theme-buy-btn-bg); 
                                       color: var(--theme-buy-btn-text)">
                            <i class="bi bi-cart-plus"></i> Buy
                        </button>
                        <button class="btn btn-sm delete-btn" 
                                style="background: var(--theme-delete-btn-bg); 
                                       color: var(--theme-delete-btn-text)">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;

    wishlistGrid.insertAdjacentHTML("beforeend", wishlistHTML);

    // Initialize tooltips
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach((tooltip) => new bootstrap.Tooltip(tooltip));

    // Add event listeners for the newly added item
    const itemElement = wishlistGrid.lastElementChild;
    itemElement.querySelector(".buy-btn").addEventListener("click", () => {
      handlePurchase(item);
    });
    itemElement.querySelector(".delete-btn").addEventListener("click", () => {
      deleteWishlistItem(item.id);
    });
  });
}

function handlePurchase(item) {
  // Get latest values from localStorage
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  // Check first if total income is insufficient
  if (totalIncome < item.price) {
    insufficientModal.show();
    setTimeout(() => {
      insufficientModal.hide();
    }, 3000);
    return;
  }

  // If safety net is not enough but has income
  if (totalSafetyNet < item.price) {
    useSavingsModal.show();

    // Handle "Makan Income" button click
    document.getElementById("useSavingsBtn").onclick = () => {
      processPurchase(item);
      useSavingsModal.hide();
    };
    return;
  }

  // If safety net is sufficient
  confirmBuyModal.show();

  // Handle "Beli Sekarang" button click
  document.getElementById("confirmBuyBtn").onclick = () => {
    processPurchase(item);
    confirmBuyModal.hide();
  };
}

function processPurchase(item) {
  // Get current values
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  let currentSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  // Calculate new values
  const newTotalIncome = totalIncome - item.price;
  let newSafetyNet = currentSafetyNet;

  // If using safety net
  if (currentSafetyNet >= item.price) {
    newSafetyNet = currentSafetyNet - item.price;
  }

  // Save new values
  localStorage.setItem("totalIncome", newTotalIncome.toString());
  localStorage.setItem("totalSafetyNet", newSafetyNet.toString());

  // Add to transactions
  const transaction = {
    type: "expense",
    amount: item.price,
    reason: `Bought: ${item.name}`,
    category: item.type,
    date: new Date().toISOString(),
  };

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Remove from wishlist
  let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];
  wishlistItems = wishlistItems.filter((i) => i.id !== item.id);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

  // Update displays
  loadLatestWishlistItems();
  window.dispatchEvent(
    new CustomEvent("safetyNetUpdated", {
      detail: {
        safetyNet: newSafetyNet,
      },
    })
  );
}

function deleteWishlistItem(id) {
  wishlistItems = wishlistItems.filter((item) => item.id !== id);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  loadLatestWishlistItems();
}

// Add this function in both indexWishlist.js and wishlist.js
function getPurchaseStatus(price) {
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  if (totalIncome < price) {
    return {
      icon: "bi-x-circle-fill",
      color: "text-danger",
      tooltip: "Total Income tidak mencukupi",
    };
  } else if (totalSafetyNet < price) {
    return {
      icon: "bi-exclamation-triangle-fill",
      color: "text-warning",
      tooltip: "Safety Net tidak mencukupi",
    };
  } else {
    return {
      icon: "bi-check-circle-fill",
      color: "text-success",
      tooltip: "Bisa dibeli dari Safety Net",
    };
  }
}

// Add this to both files
function updateStatusIndicators() {
  const wishlistItems = document.querySelectorAll("[data-id]");
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const totalSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  wishlistItems.forEach((item) => {
    const priceElement = item.querySelector(".card-text");
    const price = parseFloat(priceElement.textContent.replace(/[^0-9]/g, ""));
    const statusIcon = item.querySelector('[data-bs-toggle="tooltip"]');

    if (totalIncome < price) {
      updateStatusIcon(statusIcon, "danger", "Total Income tidak mencukupi");
    } else if (totalSafetyNet < price) {
      updateStatusIcon(statusIcon, "warning", "Akan menggunakan Savings");
    } else {
      updateStatusIcon(statusIcon, "success", "Bisa dibeli dari Safety Net");
    }
  });
}

// Add storage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "totalIncome" || e.key === "safetyNetPercentage") {
    updateStatusIndicators();
  }
});

// Add this helper function
function updatePurchaseStatus(itemElement, price) {
  const currentSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
  const currentIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;

  const statusIcon = itemElement.querySelector(".status-icon");
  const buyButton = itemElement.querySelector(".buy-button");

  if (price <= currentSafetyNet) {
    // Can buy with safety net
    statusIcon.innerHTML =
      '<i class="bi bi-check-circle-fill text-success"></i>';
    buyButton.disabled = false;
  } else if (price <= currentIncome) {
    // Can buy but will use savings
    statusIcon.innerHTML =
      '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
    buyButton.disabled = false;
  } else {
    // Cannot afford
    statusIcon.innerHTML = '<i class="bi bi-x-circle-fill text-danger"></i>';
    buyButton.disabled = true;
  }
}

// Add helper function to update item status
function updateItemStatus(itemElement, price, safetyNet, totalIncome) {
  const statusIcon = itemElement.querySelector('[data-bs-toggle="tooltip"]');
  const buyBtn = itemElement.querySelector(".buy-btn");

  if (!statusIcon || !buyBtn) return;

  if (totalIncome < price) {
    // Can't afford
    statusIcon.className = "bi bi-x-circle-fill text-danger";
    statusIcon.setAttribute("title", "Total Income tidak mencukupi");
    buyBtn.disabled = true;
  } else if (safetyNet < price) {
    // Can buy but will use savings
    statusIcon.className = "bi bi-exclamation-triangle-fill text-warning";
    statusIcon.setAttribute("title", "Akan menggunakan Savings");
    buyBtn.disabled = false;
  } else {
    // Can buy with safety net
    statusIcon.className = "bi bi-check-circle-fill text-success";
    statusIcon.setAttribute("title", "Bisa dibeli dari Safety Net");
    buyBtn.disabled = false;
  }

  // Reinitialize tooltip
  const tooltip = bootstrap.Tooltip.getInstance(statusIcon);
  if (tooltip) {
    tooltip.dispose();
  }
  new bootstrap.Tooltip(statusIcon);
}

// Tambahkan fungsi ini sebelum updateStatusIndicators

function updateStatusIcon(icon, status, tooltip) {
  const statusClasses = {
    danger: "bi-x-circle-fill text-danger",
    warning: "bi-exclamation-triangle-fill text-warning",
    success: "bi-check-circle-fill text-success",
  };

  icon.className = `bi ${statusClasses[status]}`;
  icon.setAttribute("title", tooltip);

  // Refresh tooltip
  const tooltipInstance = bootstrap.Tooltip.getInstance(icon);
  if (tooltipInstance) {
    tooltipInstance.dispose();
  }
  new bootstrap.Tooltip(icon);
}

// Add storage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "totalIncome" || e.key === "totalSafetyNet") {
    updateStatusIndicators();
  }
});
