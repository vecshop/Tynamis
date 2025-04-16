// Define wishlist types
const wishlistTypes = [
  { id: "gadget", label: "Gadget", color: "#e0f4ff" },
  { id: "fashion", label: "Fashion", color: "#ffe5f1" },
  { id: "education", label: "Pendidikan", color: "#e0f4ff" },
  { id: "hobby", label: "Hobi", color: "#ffe5f1" },
  { id: "health", label: "Kesehatan", color: "#e0f4ff" },
  { id: "other", label: "Lainnya", color: "#ffe5f1" },
];

let wishlistItems = JSON.parse(localStorage.getItem("wishlistItems")) || [];

// Add these modal instances at the top of the file
let insufficientModal;
let useSavingsModal;
let confirmBuyModal;

document.addEventListener("DOMContentLoaded", () => {
  // Update safety net amount
  updateSafetyNetDisplay();

  // Add modal HTML to document body
  document.body.insertAdjacentHTML(
    "beforeend",
    `
        <div class="modal fade" id="addWishlistModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content" style="border: none; border-radius: 15px;">
                    <div class="modal-header" style="background: var(--theme-background); border-bottom: none;">
                        <h5 class="modal-title">Tambah Wishlist</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form id="wishlistForm">
                            <!-- Nama Wishlist -->
                            <div class="mb-3">
                                <label for="wishlistName" class="form-label">Nama Wishlist</label>
                                <input type="text" class="form-control" id="wishlistName" required>
                            </div>

                            <!-- Thumbnail URL -->
                            <div class="mb-3">
                                <label for="thumbnailUrl" class="form-label">URL Thumbnail</label>
                                <input type="url" class="form-control" id="thumbnailUrl" required>
                                <div class="mt-2" id="thumbnailPreview" style="display: none;">
                                    <img src="" alt="Preview" class="img-fluid rounded" style="max-height: 150px;">
                                </div>
                            </div>

                            <!-- Harga -->
                            <div class="mb-3">
                                <label for="wishlistPrice" class="form-label">Harga</label>
                                <div class="input-group">
                                    <span class="input-group-text">Rp</span>
                                    <input type="number" class="form-control" id="wishlistPrice" required min="0">
                                </div>
                            </div>

                            <!-- Tipe Wishlist -->
                            <div class="mb-3">
                                <label class="form-label">Tipe Wishlist</label>
                                <div class="row g-2">
                                    ${wishlistTypes
                                      .map(
                                        (type) => `
                                        <div class="col-4">
                                            <input type="radio" class="btn-check" name="wishlistType" 
                                                   id="${type.id}" value="${type.id}" required>
                                            <label class="btn w-100 text-center p-2 category-label" 
                                                   for="${type.id}"
                                                   style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                ${type.label}
                                            </label>
                                        </div>
                                    `
                                      )
                                      .join("")}
                                </div>
                            </div>

                            <div class="d-grid">
                                <button type="submit" class="btn" 
                                        style="background: var(--theme-background); 
                                               color: var(--theme-text);">
                                    Tambah Wishlist
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
  const addWishlistBtn = document.querySelector(".add-wishlist-btn");
  const wishlistModal = new bootstrap.Modal(
    document.getElementById("addWishlistModal")
  );
  const wishlistForm = document.getElementById("wishlistForm");
  const thumbnailInput = document.getElementById("thumbnailUrl");
  const thumbnailPreview = document.getElementById("thumbnailPreview");
  const previewImage = thumbnailPreview.querySelector("img");

  // Show modal when clicking add button
  addWishlistBtn.addEventListener("click", () => {
    wishlistModal.show();
  });

  // Handle thumbnail preview
  thumbnailInput.addEventListener("input", () => {
    const url = thumbnailInput.value;
    if (url) {
      previewImage.src = url;
      thumbnailPreview.style.display = "block";
    } else {
      thumbnailPreview.style.display = "none";
    }
  });

  // Load existing wishlist items
  loadWishlistItems();

  // Handle form submission
  wishlistForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const wishlistData = {
      id: Date.now(), // Add unique ID for each item
      name: document.getElementById("wishlistName").value,
      thumbnail: document.getElementById("thumbnailUrl").value,
      price: parseFloat(document.getElementById("wishlistPrice").value),
      type: document.querySelector('input[name="wishlistType"]:checked').value,
      createdAt: new Date().toISOString(),
    };

    // Add to wishlist array
    wishlistItems.unshift(wishlistData);

    // Save to localStorage
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

    // Add to display
    addWishlistItem(wishlistData);

    // Reset form and close modal
    wishlistForm.reset();
    thumbnailPreview.style.display = "none";
    wishlistModal.hide();

    // Update index page if it's open
    if (window.opener && !window.opener.closed) {
      window.opener.location.reload();
    }
  });

  // Add sort functionality
  const sortByPriceBtn = document.querySelector(".dropdown-item:first-child");
  sortByPriceBtn.addEventListener("click", () => {
    wishlistItems.sort((a, b) => b.price - a.price);
    localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
    loadWishlistItems();
  });

  // Add clear all functionality
  const clearAllBtn = document.querySelector(".dropdown-item:last-child");
  clearAllBtn.addEventListener("click", () => {
    if (confirm("Are you sure you want to delete all wishlist items?")) {
      wishlistItems = [];
      localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));
      loadWishlistItems();
    }
  });

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

  // Update category labels style
  const categoryLabels = document.querySelectorAll(".category-label");
  categoryLabels.forEach((label) => {
    label.style.background = "var(--theme-card-bg)";
    label.style.color = "var(--theme-text)";
    label.style.borderColor = "var(--theme-shadow)";
  });
});

// Function to load wishlist items
function loadWishlistItems() {
  const wishlistGrid = document.querySelector(".row.g-3");
  wishlistGrid.innerHTML = ""; // Clear existing items

  if (wishlistItems.length === 0) {
    // Show empty state
    const emptyHTML = `
            <div class="col-12">
                <div class="text-center py-4">
                    <img src="https://png.pngtree.com/png-vector/20250116/ourmid/pngtree-empty-box-vector-png-image_15212860.png" 
                         alt="Empty wishlist" 
                         style="width: 150px; height: auto; opacity: 0.5; margin-bottom: 1rem;">
                    <p class="mb-0" style="color: var(--theme-text)">Impianmu belum kamu catat. tambahkan sekarang!</p>
                </div>
            </div>
        `;
    wishlistGrid.innerHTML = emptyHTML;
    return;
  }

  // Display items if there are any
  wishlistItems.forEach((item) => {
    addWishlistItem(item);
  });
}

// Add this function before addWishlistItem
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

// Update the addWishlistItem function
function addWishlistItem(data) {
  const wishlistGrid = document.querySelector(".row.g-3");
  const typeData = wishlistTypes.find((type) => type.id === data.type);
  const status = getPurchaseStatus(data.price);

  const wishlistHTML = `
        <div class="col-md-6" data-id="${data.id}">
            <div class="card h-100 wishlist-card" style="border: none; box-shadow: 0 2px 8px var(--theme-shadow)">
                <div class="position-relative">
                    <img src="${data.thumbnail}" class="card-img-top" alt="${
    data.name
  }">
                    <span class="position-absolute top-0 end-0 m-2 badge" 
                          style="background: ${
                            typeData.color
                          }; color: var(--theme-text)">
                        ${typeData.label}
                    </span>
                </div>
                <div class="card-body">
                    <h6 class="card-title mb-2">${data.name}</h6>
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <p class="card-text fw-semibold mb-0" style="color: var(--theme-text)">
                            Rp ${data.price.toLocaleString("id-ID")}
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

  wishlistGrid.insertAdjacentHTML("afterbegin", wishlistHTML);

  // Initialize tooltips
  const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  tooltips.forEach((tooltip) => new bootstrap.Tooltip(tooltip));

  // Add delete functionality
  const newItem = wishlistGrid.firstElementChild;
  newItem.querySelector(".delete-btn").addEventListener("click", () => {
    deleteWishlistItem(data.id);
  });

  // Add buy button click handler
  newItem.querySelector(".buy-btn").addEventListener("click", () => {
    handlePurchase(data);
  });
}

// Function to delete wishlist item
function deleteWishlistItem(id) {
  // Remove from array
  wishlistItems = wishlistItems.filter((item) => item.id !== id);

  // Update localStorage
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

  // Remove from display
  const itemElement = document.querySelector(`[data-id="${id}"]`);
  if (itemElement) {
    itemElement.remove();
  }

  // Update index page if it's open
  if (window.opener && !window.opener.closed) {
    window.opener.location.reload();
  }
}

// Add these functions at the end of the file
function updateSafetyNetDisplay() {
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const safetyNetPercentage =
    parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;

  const safetyNetDisplay = document.getElementById("safetyNetAmount");
  if (safetyNetDisplay) {
    safetyNetDisplay.textContent = formatCurrency(safetyNetAmount);
  }
}

function formatCurrency(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

// Add storage event listener to update when changes occur
window.addEventListener("storage", (e) => {
  if (e.key === "totalIncome" || e.key === "safetyNetPercentage") {
    updateSafetyNetDisplay();
    updateStatusIndicators(); // Add this line
  }
});

// Add this function to handle purchase
function handlePurchase(item) {
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  const safetyNetPercentage =
    parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;
  const safetyNetAmount = (totalIncome * safetyNetPercentage) / 100;

  if (totalIncome < item.price) {
    // Show insufficient funds modal
    insufficientModal.show();
    setTimeout(() => {
      insufficientModal.hide();
    }, 3000);
  } else if (safetyNetAmount < item.price) {
    // Show use savings modal
    useSavingsModal.show();

    // Handle "Makan Income" button click
    document.getElementById("useSavingsBtn").onclick = () => {
      processPurchase(item);
      useSavingsModal.hide();
    };
  } else {
    // Show confirm purchase modal
    confirmBuyModal.show();

    // Handle "Beli Sekarang" button click
    document.getElementById("confirmBuyBtn").onclick = () => {
      processPurchase(item);
      confirmBuyModal.hide();
    };
  }
}

// Add function to process the purchase
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

  // Reload wishlist display
  loadWishlistItems();

  // Update displays on other pages if open
  if (window.opener && !window.opener.closed) {
    window.opener.location.reload();
  }
}

// Add this function to update status indicators
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

// Add at the end of the file
window.addEventListener("storage", (e) => {
  if (e.key === "selectedTheme") {
    // Update status indicators with new theme colors
    updateStatusIndicators();

    // Update category labels
    const categoryLabels = document.querySelectorAll(".category-label");
    categoryLabels.forEach((label) => {
      label.style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--theme-card-bg");
      label.style.color = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--theme-text");
    });
  }
});
