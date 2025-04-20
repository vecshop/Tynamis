function calculateSafetyNet(totalIncome, percentage) {
  return (totalIncome * percentage) / 100;
}

function formatCurrency(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function updateSafetyNetDisplay(safetyNetAmount) {
  const displays = document.querySelectorAll(
    ".finance-item:first-child .finance-amount"
  );
  displays.forEach((display) => {
    if (display) {
      display.textContent = formatCurrency(safetyNetAmount);
    }
  });
}

// Export functions
window.IncomeTracker = {
  calculateSafetyNet,
  formatCurrency,
  updateSafetyNetDisplay,
};
