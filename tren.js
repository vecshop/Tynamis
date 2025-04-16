// Add at the top of the file
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

document.addEventListener("DOMContentLoaded", () => {
  // Initialize chart
  initTrendChart();

  // Add event listeners for period buttons
  const buttons = document.querySelectorAll(".btn-group .btn");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update active state
      buttons.forEach((b) => {
        b.style.background = "var(--theme-income-btn)";
        b.classList.remove("active");
      });
      button.style.background = "var(--theme-expense-btn)";
      button.classList.add("active");

      // Get period and update chart
      const period = button.textContent.trim().toLowerCase();
      updateChartData(period);
    });
  });

  const periodButtons = document.querySelectorAll(".period-btn");
  periodButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Update button states
      periodButtons.forEach((btn) => {
        btn.style.background = "var(--theme-income-btn)";
        btn.classList.remove("active");
      });
      button.style.background = "var(--theme-expense-btn)";
      button.classList.add("active");

      // Load transactions for selected period
      const period = button.dataset.period;
      loadTransactionHistory(period);
    });
  });

  // Set initial period to 'month' and trigger click
  const monthButton = document.querySelector('[data-period="month"]');
  if (monthButton) {
    monthButton.click();
  }
});

// Initialize chart with empty data and configuration
function initTrendChart() {
  // Basic chart configuration
  const options = {
    series: [
      {
        name: "Balance",
        data: [],
      },
    ],
    chart: {
      type: "line",
      height: 300,
      fontFamily: "Poppins, sans-serif",
      foreColor: getComputedStyle(document.documentElement).getPropertyValue(
        "--theme-text"
      ),
      toolbar: {
        show: false,
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        speed: 800,
      },
      background: "transparent",
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    colors: [
      getComputedStyle(document.documentElement).getPropertyValue(
        "--theme-icons"
      ),
    ],
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 100],
      },
    },
    xaxis: {
      type: "datetime",
      labels: {
        formatter: function (val) {
          return new Date(val).toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
          });
        },
        style: {
          colors: getComputedStyle(document.documentElement).getPropertyValue(
            "--theme-text"
          ),
          cssClass: "chart-label",
        },
      },
      axisBorder: {
        show: true,
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--theme-shadow"
        ),
        opacity: 0.3,
      },
      axisTicks: {
        show: true,
        color: getComputedStyle(document.documentElement).getPropertyValue(
          "--theme-shadow"
        ),
        opacity: 0.3,
      },
      crosshairs: {
        show: true,
        stroke: {
          color: getComputedStyle(document.documentElement).getPropertyValue(
            "--theme-icons"
          ),
          opacity: 0.4,
        },
      },
    },
    yaxis: {
      labels: {
        formatter: function (val) {
          return "Rp " + (val / 1000000).toFixed(1) + "M";
        },
        style: {
          colors: getComputedStyle(document.documentElement).getPropertyValue(
            "--theme-text"
          ),
          cssClass: "chart-label",
        },
      },
    },
    grid: {
      show: true,
      borderColor: getComputedStyle(document.documentElement).getPropertyValue(
        "--theme-shadow"
      ),
      strokeDashArray: 5,
      opacity: 0.1,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    markers: {
      size: 5,
      colors: [
        getComputedStyle(document.documentElement).getPropertyValue(
          "--theme-icons"
        ),
      ],
      strokeColors: getComputedStyle(document.documentElement).getPropertyValue(
        "--theme-card-bg"
      ),
      strokeWidth: 2,
      hover: {
        size: 7,
        sizeOffset: 3,
      },
    },
    tooltip: {
      theme: isDarkTheme() ? "dark" : "light",
      x: {
        format: "dd MMM yyyy",
      },
      y: {
        formatter: function (val) {
          return "Rp " + val.toLocaleString("id-ID");
        },
      },
      marker: {
        show: true,
      },
      style: {
        fontSize: "12px",
        fontFamily: "Poppins, sans-serif",
      },
    },
  };

  // Add CSS for chart elements
  const style = document.createElement("style");
  style.textContent = `
        .chart-label {
            fill: var(--theme-text) !important;
            opacity: 0.7;
        }
        .apexcharts-text tspan {
            fill: var(--theme-text) !important;
            opacity: 0.7;
        }
        .apexcharts-grid-row, .apexcharts-grid-column {
            stroke: var(--theme-shadow) !important;
            opacity: 0.1 !important;
        }
        .apexcharts-xaxis line, .apexcharts-yaxis line {
            stroke: var(--theme-shadow) !important;
            opacity: 0.1 !important;
        }
        .apexcharts-tooltip {
            background-color: var(--theme-card-bg) !important;
            color: var(--theme-text) !important;
            border-color: var(--theme-shadow) !important;
            box-shadow: 0 5px 15px var(--theme-shadow) !important;
        }
        .apexcharts-tooltip-title {
            background-color: var(--theme-body) !important;
            border-color: var(--theme-shadow) !important;
            color: var(--theme-text) !important;
        }
        .apexcharts-gridline {
            stroke-dasharray: 5;
            stroke: var(--theme-shadow) !important;
            opacity: 0.1 !important;
        }
        .apexcharts-area {
            fill-opacity: 0.2;
        }
    `;
  document.head.appendChild(style);

  // Create chart instance
  window.chart = new ApexCharts(document.querySelector("#trendChart"), options);
  window.chart.render();

  // Load initial data
  updateChartData();
}

// Add helper function to check if current theme is dark
function isDarkTheme() {
  const currentTheme =
    localStorage.getItem("selectedTheme") || "default-pastel";
  return ["luxurious", "emperal", "minimus", "octopus"].includes(currentTheme);
}

// Add theme change listener
window.addEventListener("storage", (e) => {
  if (e.key === "selectedTheme") {
    // Update chart colors and theme
    if (window.chart) {
      window.chart.updateOptions({
        chart: {
          foreColor: getComputedStyle(
            document.documentElement
          ).getPropertyValue("--theme-text"),
        },
        colors: [
          getComputedStyle(document.documentElement).getPropertyValue(
            "--theme-icons"
          ),
        ],
        tooltip: {
          theme: isDarkTheme() ? "dark" : "light",
        },
        grid: {
          borderColor: getComputedStyle(
            document.documentElement
          ).getPropertyValue("--theme-shadow"),
        },
        xaxis: {
          labels: {
            style: {
              colors: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--theme-text"),
            },
          },
          axisBorder: {
            color: getComputedStyle(document.documentElement).getPropertyValue(
              "--theme-text"
            ),
          },
          axisTicks: {
            color: getComputedStyle(document.documentElement).getPropertyValue(
              "--theme-text"
            ),
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: getComputedStyle(
                document.documentElement
              ).getPropertyValue("--theme-text"),
            },
          },
        },
        markers: {
          colors: [
            getComputedStyle(document.documentElement).getPropertyValue(
              "--theme-icons"
            ),
          ],
          strokeColors: getComputedStyle(
            document.documentElement
          ).getPropertyValue("--theme-card-bg"),
        },
      });
    }
  }
});

function updateChartData(period = "month") {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const { startDate, endDate } = getDateRange(period);

  // Sort transactions by date
  transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

  // Process transactions
  const chartData = processTransactions(transactions, startDate);

  // Ensure there's at least one data point
  if (chartData.length === 0) {
    chartData.push({
      x: new Date().getTime(),
      y: 0,
    });
  }

  // Update chart
  if (window.chart) {
    window.chart.updateOptions({
      xaxis: {
        type: "datetime",
        min: startDate.getTime(),
        max: endDate.getTime(),
      },
    });

    window.chart.updateSeries([
      {
        name: "Balance",
        data: chartData,
      },
    ]);

    // Update period text
    const periodText = document.querySelector(".text-period");
    if (periodText) {
      switch (period) {
        case "week":
          periodText.textContent = "Last 7 days";
          break;
        case "month":
          periodText.textContent = "Last 30 days";
          break;
        case "year":
          periodText.textContent = "Last 365 days";
          break;
      }
    }
  }
}

function updateChartPeriod(period) {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  let filterDate = new Date();

  switch (period) {
    case "week":
      filterDate.setDate(filterDate.getDate() - 7);
      break;
    case "month":
      filterDate.setDate(filterDate.getDate() - 30);
      break;
    case "year":
      filterDate.setDate(filterDate.getDate() - 365);
      break;
  }

  // Filter transactions and update chart
  const filteredTransactions = transactions.filter(
    (t) => new Date(t.date) >= filterDate
  );
  let runningBalance = 0;
  const chartData = [];

  filteredTransactions
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((transaction) => {
      if (transaction.type === "income") {
        runningBalance += transaction.amount;
      } else {
        runningBalance -= transaction.amount;
      }

      chartData.push({
        x: new Date(transaction.date).getTime(),
        y: runningBalance,
      });
    });

  // Update chart
  window.chart.updateSeries([
    {
      name: "Balance",
      data: chartData,
    },
  ]);
}

// Add event listener for localStorage changes
window.addEventListener("storage", (e) => {
  if (e.key === "transactions") {
    const activeButton = document.querySelector(".period-btn.active");
    const period = activeButton ? activeButton.dataset.period : "month";
    loadTransactionHistory(period);
  }
});

// Add this function to filter transactions by period
function filterTransactionsByPeriod(transactions, period) {
  const today = new Date();
  const filterDate = new Date();

  switch (period) {
    case "week":
      filterDate.setDate(today.getDate() - 7);
      break;
    case "month":
      filterDate.setDate(today.getDate() - 30);
      break;
    case "year":
      filterDate.setDate(today.getDate() - 365);
      break;
    default:
      filterDate.setDate(today.getDate() - 30); // Default to month
  }

  return transactions.filter((t) => new Date(t.date) >= filterDate);
}

function loadTransactionHistory(period = "month") {
  const transactions = JSON.parse(localStorage.getItem("transactions")) || [];
  const transactionList = document.querySelector(".transaction-list");

  // Clear existing content
  transactionList.innerHTML = "";

  if (transactions.length === 0) {
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

  // Filter and sort transactions
  const filteredTransactions = filterTransactionsByPeriod(
    transactions,
    period
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filteredTransactions.length === 0) {
    transactionList.innerHTML = `
            <div class="text-center py-4">
                <p class="text-muted mb-0">Tidak ada transaksi dalam periode ini</p>
            </div>
        `;
    return;
  }

  // Show filtered transactions
  filteredTransactions.forEach((transaction) => {
    const date = new Date(transaction.date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const isIncome = transaction.type === "income";
    const amount = formatCurrency(transaction.amount);

    let categoryInfo = "";
    if (!isIncome && transaction.category) {
      const categoryData =
        categories.find((cat) => cat.id === transaction.category) ||
        categories.find((cat) => cat.id === "other");
      categoryInfo = `
                <small class="d-block text-muted">
                    <i class="bi ${categoryData.icon} me-1"></i>
                    ${categoryData.title}
                </small>
            `;
    }

    const html = `
            <div class="transaction-item d-flex align-items-center p-3 border-bottom">
                <div class="transaction-icon me-3 ${
                  isIncome ? "bg-success" : "bg-danger"
                } bg-opacity-10 rounded-circle p-2">
                    <i class="bi ${
                      isIncome ? "bi-arrow-up-circle" : "bi-arrow-down-circle"
                    } 
                       ${isIncome ? "text-success" : "text-danger"}"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between">
                        <div>
                            <p class="mb-0 fw-medium">${
                              isIncome ? "Income" : transaction.reason
                            }</p>
                            ${categoryInfo}
                            <small class="text-muted">${date}</small>
                        </div>
                        <span class="${
                          isIncome ? "text-success" : "text-danger"
                        } fw-semibold">
                            ${isIncome ? "+" : "-"}${amount}
                        </span>
                    </div>
                </div>
            </div>
        `;

    transactionList.insertAdjacentHTML("beforeend", html);
  });

  // Add period indicator
  const periodText = document.querySelector(".text-period");
  if (periodText) {
    switch (period) {
      case "week":
        periodText.textContent = "Last 7 Days";
        break;
      case "month":
        periodText.textContent = "Last 30 Days";
        break;
      case "year":
        periodText.textContent = "Last 365 Days";
        break;
    }
  }
}

function formatCurrency(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function getDateRange(period) {
  const today = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate.setDate(today.getDate() - 30);
      break;
    case "year":
      startDate.setDate(today.getDate() - 365);
      break;
    default:
      startDate.setDate(today.getDate() - 30); // Default to month
  }

  return { startDate, endDate: today };
}

function processTransactions(transactions, startDate) {
  // Get initial balance before start date
  let runningBalance = 0;
  transactions
    .filter((t) => new Date(t.date) < startDate)
    .forEach((t) => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
    });

  // Process transactions within range
  const balanceData = [];
  const currentDate = new Date(startDate);
  const endDate = new Date();

  while (currentDate <= endDate) {
    const dayTransactions = transactions.filter(
      (t) => new Date(t.date).toDateString() === currentDate.toDateString()
    );

    // Update running balance with day's transactions
    dayTransactions.forEach((t) => {
      runningBalance += t.type === "income" ? t.amount : -t.amount;
    });

    // Add data point
    if (dayTransactions.length > 0 || balanceData.length === 0) {
      balanceData.push({
        x: new Date(currentDate).getTime(),
        y: runningBalance,
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return balanceData;
}

// Add storage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "transactions") {
    const activeButton = document.querySelector(".btn-group .btn.active");
    const period = activeButton
      ? activeButton.textContent.trim().toLowerCase()
      : "month";
    updateChartData(period);
  }
});
