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

// Variabel utama yang harus konsisten di semua file
let totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
let totalSafetyNet = parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
let totalSavings = parseFloat(localStorage.getItem("totalSavings")) || 0;
let safetyNetPercentage =
  parseFloat(localStorage.getItem("safetyNetPercentage")) || 20;

// Add these modal instances at the top of the file
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

                            <!-- Image Input Section -->
                            <div class="mb-3">
                                <label class="form-label">Gambar Wishlist</label>
                                <div class="d-flex gap-2 mb-2">
                                    <button type="button" class="btn btn-outline-secondary flex-grow-1" id="urlInputBtn">
                                        <i class="bi bi-link-45deg"></i> URL
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary flex-grow-1" id="fileInputBtn">
                                        <i class="bi bi-image"></i> Gallery
                                    </button>
                                </div>
                                <div id="urlInputSection">
                                    <input type="url" class="form-control" id="thumbnailUrl" placeholder="Enter image URL">
                                </div>
                                <div id="fileInputSection" style="display: none;">
                                    <div class="custom-file-input">
                                        <input type="file" class="form-control" id="thumbnailFile" accept="image/*" style="display: none;">
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="fileLabel" readonly placeholder="Gak ada file dipilih">
                                            <button class="btn btn-outline-secondary" type="button" onclick="document.getElementById('thumbnailFile').click()">
                                                Pilih File
                                            </button>
                                        </div>
                                    </div>
                                </div>
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
                                                   id="${type.id}" value="${
                                          type.id
                                        }" required>
                                            <label class="btn w-100 text-center p-2 category-label position-relative" 
                                                   for="${type.id}"
                                                   style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                                ${type.label}
                                                ${
                                                  type.id === "other"
                                                    ? `<input type="text" class="form-control form-control-sm mt-1 custom-category" 
                                                          id="customCategory" maxlength="20" placeholder="Custom category"
                                                          style="display: none;">`
                                                    : ""
                                                }
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
  const urlInputSection = document.getElementById("urlInputSection");
  const fileInputSection = document.getElementById("fileInputSection");
  const urlInputBtn = document.getElementById("urlInputBtn");
  const fileInputBtn = document.getElementById("fileInputBtn");
  const thumbnailInput = document.getElementById("thumbnailUrl");
  const thumbnailFile = document.getElementById("thumbnailFile");
  const fileLabel = document.getElementById("fileLabel");
  const thumbnailPreview = document.getElementById("thumbnailPreview");
  const previewImage = thumbnailPreview.querySelector("img");
  const customCategory = document.getElementById("customCategory");

  // Show modal when clicking add button
  addWishlistBtn.addEventListener("click", () => {
    wishlistModal.show();
  });

  // Toggle between URL and file input
  urlInputBtn.addEventListener("click", () => {
    urlInputSection.style.display = "block";
    fileInputSection.style.display = "none";
    urlInputBtn.classList.add("active");
    fileInputBtn.classList.remove("active");
  });

  fileInputBtn.addEventListener("click", () => {
    urlInputSection.style.display = "none";
    fileInputSection.style.display = "block";
    fileInputBtn.classList.add("active");
    urlInputBtn.classList.remove("active");
  });

  // Handle thumbnail preview for URL
  thumbnailInput.addEventListener("input", () => {
    const url = thumbnailInput.value;
    if (url) {
      previewImage.src = url;
      thumbnailPreview.style.display = "block";
    } else {
      thumbnailPreview.style.display = "none";
    }
  });

  // Handle thumbnail preview for file
  thumbnailFile.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      fileLabel.value = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        thumbnailPreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      fileLabel.value = "Gak ada file dipilih";
      thumbnailPreview.style.display = "none";
    }
  });

  // Handle custom category visibility
  document.querySelectorAll('input[name="wishlistType"]').forEach((input) => {
    input.addEventListener("change", (e) => {
      if (e.target.id === "other") {
        customCategory.style.display = "block";
        customCategory.required = true;
      } else {
        customCategory.style.display = "none";
        customCategory.required = false;
      }
    });
  });

  // Load existing wishlist items
  loadWishlistItems();

  // Handle form submission
  wishlistForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get the thumbnail source
    let thumbnailSource = "";
    if (urlInputSection.style.display !== "none" && thumbnailInput.value) {
      thumbnailSource = thumbnailInput.value;
    } else if (
      fileInputSection.style.display !== "none" &&
      thumbnailFile.files[0]
    ) {
      thumbnailSource = previewImage.src; // This will be the base64 data URL
    }

    const selectedType = document.querySelector(
      'input[name="wishlistType"]:checked'
    );
    const wishlistType = selectedType.value;
    const wishlistLabel =
      wishlistType === "other" && customCategory.value
        ? customCategory.value
        : wishlistTypes.find((type) => type.id === wishlistType).label;

    const wishlistData = {
      id: Date.now(),
      name: document.getElementById("wishlistName").value,
      thumbnail: thumbnailSource,
      price: parseFloat(document.getElementById("wishlistPrice").value),
      type: wishlistType,
      customLabel: wishlistType === "other" ? customCategory.value : null,
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
    customCategory.style.display = "none";
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

  // Update category labels style
  const categoryLabels = document.querySelectorAll(".category-label");
  categoryLabels.forEach((label) => {
    label.style.background = "var(--theme-card-bg)";
    label.style.color = "var(--theme-text)";
    label.style.borderColor = "var(--theme-shadow)";
  });

  // Listen for safety net updates
  window.addEventListener("safetyNetUpdated", (e) => {
    // Update purchase status for all items
    loadWishlistItems();
  });

  // Update safety net display
  const safetyNet = parseFloat(localStorage.getItem("totalSafetyNet")) || 0;
  const safetyNetDisplay = document.getElementById("safetyNetAmount");
  if (safetyNetDisplay) {
    safetyNetDisplay.textContent = formatCurrency(safetyNet);
  }

  // Listen for safety net updates
  window.addEventListener("safetyNetUpdated", (e) => {
    const newSafetyNet = e.detail.safetyNet;
    if (safetyNetDisplay) {
      animateValue(
        safetyNetDisplay,
        parseFloat(safetyNetDisplay.textContent.replace(/[^0-9]/g, "")),
        newSafetyNet
      );
    }
  });

  // Listen for safety net updates
  window.addEventListener("safetyNetUpdated", (e) => {
    updateStatusIndicators();
    updateSafetyNetDisplay();
  });

  // Initial update
  updateStatusIndicators();
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
  const totalSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  if (totalIncome < price) {
    return {
      icon: "bi-x-circle-fill",
      color: "text-danger",
      tooltip: "Total Income tidak mencukupi",
      canBuy: false,
    };
  } else if (totalSafetyNet < price) {
    return {
      icon: "bi-exclamation-triangle-fill",
      color: "text-warning",
      tooltip: "Akan menggunakan Savings",
      canBuy: true,
    };
  } else {
    return {
      icon: "bi-check-circle-fill",
      color: "text-success",
      tooltip: "Bisa dibeli dari Safety Net",
      canBuy: true,
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
                        <p class="card-text fw-semibold mb-0" style="color: var (--theme-text)">
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

  // If we have income but no safety net
  if (totalSafetyNet <= 0) {
    useSavingsModal.show();

    // Handle "Makan Income" button click
    document.getElementById("useSavingsBtn").onclick = () => {
      processPurchase(item);
      useSavingsModal.hide();
    };
    return;
  }

  // If we have safety net but it's not enough
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

// Add function to process the purchase
function processPurchase(item) {
  // Get current values
  const totalIncome = parseFloat(localStorage.getItem("totalIncome")) || 0;
  let currentSafetyNet =
    parseFloat(localStorage.getItem("totalSafetyNet")) || 0;

  // Calculate new values
  const newTotalIncome = totalIncome - item.price;
  currentSafetyNet -= item.price;

  // Ensure safety net doesn't go below 0
  if (currentSafetyNet <= 0) {
    currentSafetyNet = 0;
    localStorage.setItem("safetyNetIsZero", "true");
  }

  // Save final values
  localStorage.setItem("totalIncome", newTotalIncome.toString());
  localStorage.setItem("totalSafetyNet", currentSafetyNet.toString());

  if (currentSafetyNet === 0) {
    localStorage.setItem("totalSavings", newTotalIncome.toString());
  }

  // Add to transactions
  const transaction = {
    type: "expense",
    amount: item.price,
    reason: `Bought: ${item.name}`,
    category: item.type,
    safetyNetDeduction: item.price,
    date: new Date().toISOString(),
  };

  let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  transactions.unshift(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  // Remove from wishlist
  wishlistItems = wishlistItems.filter((i) => i.id !== item.id);
  localStorage.setItem("wishlistItems", JSON.stringify(wishlistItems));

  // Update displays
  loadWishlistItems();
  updateDisplays();
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
