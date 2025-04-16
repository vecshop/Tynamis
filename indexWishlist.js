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
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const safetyNetPercentage =
    parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;

  if (totalIncome < item.price) {
    insufficientModal.show();
    setTimeout(() => {
      insufficientModal.hide();
    }, 3000);
  } else if (safetyNetAmount < item.price) {
    useSavingsModal.show();
    document.getElementById("useSavingsBtn").onclick = () => {
      processPurchase(item);
      useSavingsModal.hide();
    };
  } else {
    confirmBuyModal.show();
    document.getElementById("confirmBuyBtn").onclick = () => {
      processPurchase(item);
      confirmBuyModal.hide();
    };
  }
}

function processPurchase(item) {
  // Deduct from total income
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const newTotalIncome = totalIncome - item.price;
  localStorage.setItem("totalIncome", newTotalIncome.toString());

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
  wishlistItems = wishlistItems.filter((i) => i.id !== item.id);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

  // Reload displays
  loadLatestWishlistItems();

  // Update income display if possible
  const incomeDisplay = document.querySelector(
    ".finance-item:nth-child(3) .finance-amount"
  );
  if (incomeDisplay) {
    incomeDisplay.textContent = `Rp ${newTotalIncome.toLocaleString("id-ID")}`;
  }

  // Update safety net and savings if the functions exist
  if (typeof updateSafetyNetDisplay === "function") {
    updateSafetyNetDisplay();
  }
}

function deleteWishlistItem(id) {
  wishlistItems = wishlistItems.filter((item) => item.id !== id);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
  loadLatestWishlistItems();
}

// Add this function in both indexWishlist.js and wishlist.js
function getPurchaseStatus(price) {
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const safetyNetPercentage =
    parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;

  if (totalIncome < price) {
    return {
      icon: "bi-x-circle-fill",
      color: "text-danger",
      tooltip: "Belum bisa dibeli",
    };
  } else if (safetyNetAmount < price) {
    return {
      icon: "bi-exclamation-triangle-fill",
      color: "text-warning",
      tooltip: "Perlu memakan savings",
    };
  } else {
    return {
      icon: "bi-check-circle-fill",
      color: "text-success",
      tooltip: "Bisa dibeli sekarang",
    };
  }
}

// Add this to both files
function updateStatusIndicators() {
  const wishlistItems = document.querySelectorAll("[data-id]");
  wishlistItems.forEach((item) => {
    const priceElement = item.querySelector(".card-text");
    const price = parseFloat(priceElement.textContent.replace(/[^0-9]/g, ""));
    const status = getPurchaseStatus(price);

    const statusIcon = item.querySelector('[data-bs-toggle="tooltip"]');
    statusIcon.className = `bi ${status.icon} ${status.color}`;
    statusIcon.setAttribute("title", status.tooltip);

    // Reinitialize tooltip
    const tooltip = bootstrap.Tooltip.getInstance(statusIcon);
    if (tooltip) {
      tooltip.dispose();
    }
    new bootstrap.Tooltip(statusIcon);
  });
}

// Add storage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "totalIncome" || e.key === "safetyNetPercentage") {
    updateStatusIndicators();
  }
});
