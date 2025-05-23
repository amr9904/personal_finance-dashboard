// ==========================================
// GLOBAL VARIABLES & DATA STRUCTURES
// ==========================================

// Track total amounts for each transaction type
let totalIncome = 0; 
let totalExpenses = 0;
let totalBills = 0;

// Default categories if none are found in localStorage
const defaultCategories = {
  income: ["Salary", "Bonus", "Investments"],
  expense: ["Food", "Transport", "Entertainment"],
  bill: ["Rent", "Utilities", "Insurance"],
};

// Category data for each type (populated from localStorage or defaults)
let categoriesData = {
  income: {},
  expense: {},
  bill: {},
};

// Array to store the transaction history (populated from localStorage)
let transactionHistory = [];

// ==========================================
// LOCALSTORAGE FUNCTIONS
// ==========================================

/**
 * Loads data from localStorage and populates:
 * - categoriesData
 * - transactionHistory
 * - totals (totalIncome, totalExpenses, totalBills)
 * If there's no existing data, sets default categories for each type.
 */
function loadData() {
  const storedCategories = JSON.parse(localStorage.getItem("categoriesData"));
  const storedTransactions = JSON.parse(localStorage.getItem("transactionHistory"));
  const storedTotals = JSON.parse(localStorage.getItem("totals"));

  // If categories exist in localStorage, load them
  if (storedCategories) {
    categoriesData = storedCategories;
  } else {
    // Otherwise, initialize default categories
    Object.keys(defaultCategories).forEach((type) => {
      defaultCategories[type].forEach((category) => {
        categoriesData[type][category] = 0;
      });
    });
  }

  // Load transaction history, if present
  if (storedTransactions) {
    transactionHistory = storedTransactions;
  }

  // Load totals, if present
  if (storedTotals) {
    totalIncome = storedTotals.totalIncome || 0;
    totalExpenses = storedTotals.totalExpenses || 0;
    totalBills = storedTotals.totalBills || 0;
  }
}

/**
 * Saves the current state to localStorage:
 * - categoriesData
 * - transactionHistory
 * - totals (totalIncome, totalExpenses, totalBills)
 */
function saveData() {
  localStorage.setItem("categoriesData", JSON.stringify(categoriesData));
  localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));
  localStorage.setItem(
    "totals",
    JSON.stringify({ totalIncome, totalExpenses, totalBills })
  );
}

// ==========================================
// DOM ELEMENT REFERENCES
// ==========================================

const transactionForm = document.getElementById("transactionForm");
const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");
const dateInput = document.getElementById("date");
const totalIncomeDisplay = document.getElementById("totalIncome");
const totalExpensesDisplay = document.getElementById("totalExpenses");
const totalBillsDisplay = document.getElementById("totalBills");
const netSavingsDisplay = document.getElementById("netSavings");
const transactionList = document.getElementById("transactionList");
const addCategoryButton = document.getElementById("addCategoryButton");

// Chart.js canvas contexts
const incomeExpenseCtx = document
  .getElementById("incomeExpenseChart")
  .getContext("2d");
const incomeCtx = document.getElementById("incomeChart").getContext("2d");
const expenseCtx = document.getElementById("expenseChart").getContext("2d");
const billCtx = document.getElementById("billChart").getContext("2d");

// ==========================================
// CHART VARIABLES
// ==========================================

let incomeExpenseChart = null;
let incomeChart = null;
let expenseChart = null;
let billChart = null;

// ==========================================
// DOM / UI UTILITIES
// ==========================================

/**
 * Populate the category <select> based on the currently selected type (income, expense, bill).
 */
function populateCategories() {
  const type = typeSelect.value;

  // Clear existing category options
  categorySelect.innerHTML = "";

  // Populate new options from categoriesData for the selected type
  const selectedCategories = Object.keys(categoriesData[type]);
  selectedCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });
}

/**
 * Render the transaction history list in the UI.
 * If there are no transactions, show a placeholder message.
 */
function renderTransactionHistory() {
  transactionList.innerHTML = "";

  if (transactionHistory.length === 0) {
    transactionList.innerHTML = `<li class="placeholder">No transactions yet</li>`;
    return;
  }

  // Create list items for each transaction
  transactionHistory.forEach((transaction) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${transaction.type.toUpperCase()} - ${
      transaction.category
    }: $${transaction.amount.toFixed(2)} on ${transaction.date}`;
    transactionList.appendChild(listItem);
  });
}

/**
 * Update the numeric summaries (income, expenses, bills, net savings) displayed in the UI.
 */
function updateTotals() {
  totalIncomeDisplay.textContent = `$${totalIncome.toFixed(2)}`;
  totalExpensesDisplay.textContent = `$${totalExpenses.toFixed(2)}`;
  totalBillsDisplay.textContent = `$${totalBills.toFixed(2)}`;
  netSavingsDisplay.textContent = `$${(totalIncome - totalExpenses - totalBills).toFixed(
    2
  )}`;
}

// ==========================================
// CHART FUNCTIONS
// ==========================================

/**
 * Re-initializes the 'Income vs Expenses' bar chart.
 */
function updateSummaryChart() {
  // If a chart instance already exists, destroy it
  if (incomeExpenseChart) {
    incomeExpenseChart.destroy();
  }

  // Create new chart with updated data
  incomeExpenseChart = new Chart(incomeExpenseCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Expenses", "Bills"],
      datasets: [
        {
          label: "Amount",
          data: [totalIncome, totalExpenses, totalBills],
          backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
        },
      ],
    },
    options: {
      responsive: true,
    },
  });
}

/**
 * Re-initializes the 'Income', 'Expense', and 'Bill' pie charts.
 */
function initializeCharts() {
  // Destroy existing chart instances if they exist
  if (incomeChart) incomeChart.destroy();
  if (expenseChart) expenseChart.destroy();
  if (billChart) billChart.destroy();

  // Income pie chart
  incomeChart = new Chart(incomeCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoriesData.income),
      datasets: [
        {
          data: Object.values(categoriesData.income),
          backgroundColor: ["#00bcd4", "#ff9800", "#e91e63", "#9c27b0", "#2196f3"],
        },
      ],
    },
    options: { responsive: true },
  });

  // Expense pie chart
  expenseChart = new Chart(expenseCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoriesData.expense),
      datasets: [
        {
          data: Object.values(categoriesData.expense),
          backgroundColor: ["#9c27b0", "#2196f3", "#ff9800", "#e91e63", "#00bcd4"],
        },
      ],
    },
    options: { responsive: true },
  });

  // Bill pie chart
  billChart = new Chart(billCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoriesData.bill),
      datasets: [
        {
          data: Object.values(categoriesData.bill),
          backgroundColor: ["#ff9800", "#2196f3", "#e91e63", "#9c27b0", "#00bcd4"],
        },
      ],
    },
    options: { responsive: true },
  });
}

/**
 * Calls the chart update functions so the UI reflects the current data.
 */
function updateCharts() {
  updateSummaryChart();
  initializeCharts();
}

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Handle form submission for adding a new transaction.
 * Validates inputs and updates data structures, UI, and localStorage.
 */
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Extract form values
  const type = typeSelect.value;
  const category = categorySelect.value;
  const amount = parseFloat(document.getElementById("amount").value);
  const date = dateInput.value;

  // Validate amount
  if (isNaN(amount) || amount <= 0) {
    alert("Please enter a valid amount");
    return;
  }

  // Update totals based on transaction type
  if (type === "income") totalIncome += amount;
  if (type === "expense") totalExpenses += amount;
  if (type === "bill") totalBills += amount;

  // Update category data
  categoriesData[type][category] = (categoriesData[type][category] || 0) + amount;

  // Add the new transaction to our history array
  transactionHistory.push({ type, category, amount, date });

  // Update UI elements
  updateTotals();
  renderTransactionHistory();
  updateCharts();

  // Save changes to localStorage
  saveData();

  // Reset the form and refresh categories
  transactionForm.reset();
  typeSelect.dispatchEvent(new Event("change"));
});

/**
 * Allows users to add a new custom category for the currently selected transaction type.
 */
addCategoryButton.addEventListener("click", () => {
  const newCategory = prompt("Enter a new category:");
  if (newCategory) {
    const type = typeSelect.value;
    // If the category doesn't exist, add it
    if (!categoriesData[type][newCategory]) {
      categoriesData[type][newCategory] = 0;
      saveData();
      populateCategories();
      alert(`Category "${newCategory}" added!`);
    } else {
      alert(`Category "${newCategory}" already exists!`);
    }
  }
});

/**
 * When the transaction type changes, re-populate the categories dropdown.
 */
typeSelect.addEventListener("change", populateCategories);

// ==========================================
// INITIALIZATION
// ==========================================

// 1. Load any existing data from localStorage
loadData();

// 2. Populate the categories dropdown based on the default or loaded type
populateCategories();

// 3. Update the totals display
updateTotals();

// 4. Render the transaction history in the UI
renderTransactionHistory();

// 5. Initialize charts (or re-initialize if data changed)
updateCharts();

// ==========================================
// ADDING CLEAR TRANSACTIONS BUTTON
// ==========================================

// Create the button element
const clearButton = document.createElement("button");
clearButton.textContent = "Clear All Transactions";
clearButton.classList.add("clear-button");


// Add event listener to clear transactions
 clearButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all transactions?")) {
        // Reset all data
        totalIncome = 0;
        totalExpenses = 0;
        totalBills = 0;
        transactionHistory = [];

        // Reset category data
        categoriesData = {
            income: {},
            expense: {},
            bill: {},
        };

        // Reinitialize categories with defaults
        Object.keys(defaultCategories).forEach((type) => {
            defaultCategories[type].forEach((category) => {
                categoriesData[type][category] = 0;
            });
        });

        // Save changes to localStorage
        saveData();

        // Update UI
        updateTotals();
        renderTransactionHistory();
        updateCharts();

        alert("All transactions have been cleared!");
    }
});

// Append the button to the history section
document.querySelector(".history").appendChild(clearButton);
