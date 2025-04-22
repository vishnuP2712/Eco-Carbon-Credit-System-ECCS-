// admin/dashboard.js - Carbon Credit Card Admin Dashboard functionality

document.addEventListener("DOMContentLoaded", function () {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Auto-dismiss alerts after 5 seconds
  setTimeout(function () {
    const alerts = document.querySelectorAll(".alert-dismissible");
    alerts.forEach(function (alert) {
      const alertInstance = new bootstrap.Alert(alert);
      alertInstance.close();
    });
  }, 5000);

  // User filtering
  const userFilterForm = document.querySelector("#users form");
  if (userFilterForm) {
    userFilterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      filterUsers();
    });
  }

  // Transaction filtering
  const transactionFilterForm = document.querySelector("#transactions form");
  if (transactionFilterForm) {
    transactionFilterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      filterTransactions();
    });
  }

  // Save active tab to session storage
  const tabLinks = document.querySelectorAll(
    '#admin-tabs button[data-bs-toggle="pill"]'
  );
  tabLinks.forEach(function (tabLink) {
    tabLink.addEventListener("shown.bs.tab", function (e) {
      sessionStorage.setItem("activeAdminTab", e.target.id);
    });
  });

  // Restore active tab from session storage
  const activeTab = sessionStorage.getItem("activeAdminTab");
  if (activeTab) {
    const tab = document.querySelector("#" + activeTab);
    if (tab) {
      const tabInstance = new bootstrap.Tab(tab);
      tabInstance.show();
    }
  }

  // Validate credit allocation form
  const allocateCreditsForm = document.querySelector(
    "#allocateCreditsModal form"
  );
  if (allocateCreditsForm) {
    allocateCreditsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (validateAllocationForm()) {
        allocateCredits();
      }
    });
  }

  // Validate report generation forms
  const reportForms = document.querySelectorAll(
    "#userReportModal form, #transactionReportModal form, #impactReportModal form"
  );
  reportForms.forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      generateReport(e.target);
    });
  });

  // User approval button functionality
  const approveButtons = document.querySelectorAll('a.btn-success[href="#"]');
  approveButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      approveUser(this);
    });
  });

  // Transaction approval button functionality
  const transactionApproveButtons = document.querySelectorAll(
    ".modal-footer .btn-success"
  );
  transactionApproveButtons.forEach(function (button) {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      approveTransaction(this);
    });
  });

  // Initialize charts if they exist on the page
  initializeCharts();
});

/**
 * Filters the user table based on search criteria
 */
function filterUsers() {
  const searchTerm = document
    .querySelector('input[name="search"]')
    .value.toLowerCase();
  const roleFilter = document.querySelector('select[name="role"]').value;
  const statusFilter = document.querySelector('select[name="status"]').value;

  const userRows = document.querySelectorAll("#users table tbody tr");

  userRows.forEach(function (row) {
    const username = row
      .querySelector("td:nth-child(2)")
      .textContent.toLowerCase();
    const email = row
      .querySelector("td:nth-child(3)")
      .textContent.toLowerCase();
    const role = row
      .querySelector("td:nth-child(4) .badge")
      .textContent.toLowerCase();
    const status = row
      .querySelector("td:nth-child(6) .badge")
      .textContent.toLowerCase();

    const matchesSearch =
      searchTerm === "" ||
      username.includes(searchTerm) ||
      email.includes(searchTerm);
    const matchesRole = roleFilter === "" || role === roleFilter;
    const matchesStatus =
      statusFilter === "" || status.toLowerCase().includes(statusFilter);

    if (matchesSearch && matchesRole && matchesStatus) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  updateUserFilterSummary();
}

/**
 * Updates the filter summary for users
 */
function updateUserFilterSummary() {
  const visibleRows = document.querySelectorAll(
    '#users table tbody tr:not([style*="display: none"])'
  ).length;
  const totalRows = document.querySelectorAll("#users table tbody tr").length;

  // Add or update filter summary if it doesn't exist
  let filterSummary = document.querySelector("#filter-summary");
  if (!filterSummary) {
    filterSummary = document.createElement("div");
    filterSummary.id = "filter-summary";
    filterSummary.className = "alert alert-info mt-2";
    const userTable = document.querySelector("#users .table-responsive");
    userTable.parentNode.insertBefore(filterSummary, userTable);
  }

  filterSummary.textContent = `Showing ${visibleRows} of ${totalRows} users`;
}

/**
 * Filters the transaction table based on search criteria
 */
function filterTransactions() {
  const userFilter = document
    .querySelector('#transactions input[name="user"]')
    .value.toLowerCase();
  const typeFilter = document.querySelector(
    '#transactions select[name="type"]'
  ).value;
  const startDate = document.querySelector(
    '#transactions input[name="start_date"]'
  ).value;
  const endDate = document.querySelector(
    '#transactions input[name="end_date"]'
  ).value;

  const transactionRows = document.querySelectorAll(
    "#transactions table tbody tr"
  );

  transactionRows.forEach(function (row) {
    const from = row.querySelector("td:nth-child(3)").textContent.toLowerCase();
    const to = row.querySelector("td:nth-child(4)").textContent.toLowerCase();
    const type = row
      .querySelector("td:nth-child(2) .badge")
      .textContent.toLowerCase();
    const date = row.querySelector("td:nth-child(6)").textContent;

    const matchesUser =
      userFilter === "" || from.includes(userFilter) || to.includes(userFilter);
    const matchesType = typeFilter === "" || type === typeFilter;

    let matchesDate = true;
    if (startDate && endDate) {
      const transactionDate = new Date(date.split(" ")[0]);
      const filterStartDate = new Date(startDate);
      const filterEndDate = new Date(endDate);
      matchesDate =
        transactionDate >= filterStartDate && transactionDate <= filterEndDate;
    }

    if (matchesUser && matchesType && matchesDate) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });

  updateTransactionFilterSummary();
}

/**
 * Updates the filter summary for transactions
 */
function updateTransactionFilterSummary() {
  const visibleRows = document.querySelectorAll(
    '#transactions table tbody tr:not([style*="display: none"])'
  ).length;
  const totalRows = document.querySelectorAll(
    "#transactions table tbody tr"
  ).length;

  let filterSummary = document.querySelector("#transaction-filter-summary");
  if (!filterSummary) {
    filterSummary = document.createElement("div");
    filterSummary.id = "transaction-filter-summary";
    filterSummary.className = "alert alert-info mt-2";
    const transactionTable = document.querySelector(
      "#transactions .table-responsive"
    );
    transactionTable.parentNode.insertBefore(filterSummary, transactionTable);
  }

  filterSummary.textContent = `Showing ${visibleRows} of ${totalRows} transactions`;
}

/**
 * Validates the credit allocation form
 * @returns {boolean} Whether the form is valid
 */
function validateAllocationForm() {
  const userId = document.querySelector("#user_id").value;
  const amount = document.querySelector("#amount").value;
  const reason = document.querySelector("#reason").value;

  let isValid = true;
  let errorMessage = "";

  if (!userId) {
    errorMessage += "Please select a user. ";
    isValid = false;
  }

  if (!amount || amount <= 0) {
    errorMessage += "Please enter a valid amount greater than 0. ";
    isValid = false;
  }

  if (!reason.trim()) {
    errorMessage += "Please provide a reason for allocation. ";
    isValid = false;
  }

  if (!isValid) {
    showFormError("allocateCreditsModal", errorMessage);
  }

  return isValid;
}

/**
 * Shows form error in a modal
 * @param {string} modalId - The ID of the modal
 * @param {string} message - The error message
 */
function showFormError(modalId, message) {
  const modal = document.querySelector(`#${modalId}`);

  // Remove any existing error messages
  const existingError = modal.querySelector(".alert-danger");
  if (existingError) {
    existingError.remove();
  }

  // Create and display new error message
  const errorDiv = document.createElement("div");
  errorDiv.className = "alert alert-danger";
  errorDiv.role = "alert";
  errorDiv.textContent = message;

  const modalBody = modal.querySelector(".modal-body");
  modalBody.insertBefore(errorDiv, modalBody.firstChild);
}

/**
 * Simulates credit allocation (AJAX call would go here in production)
 */
function allocateCredits() {
  const userId = document.querySelector("#user_id").value;
  const amount = document.querySelector("#amount").value;
  const reason = document.querySelector("#reason").value;
  const userName = document.querySelector(
    `#user_id option[value="${userId}"]`
  ).textContent;

  // In a real application, this would be an AJAX call to the server
  console.log(
    `Allocating ${amount} credits to ${userName} with reason: ${reason}`
  );

  // Simulate successful allocation
  const modal = bootstrap.Modal.getInstance(
    document.querySelector("#allocateCreditsModal")
  );
  modal.hide();

  // Show success message
  const successAlert = document.createElement("div");
  successAlert.className = "alert alert-success alert-dismissible fade show";
  successAlert.role = "alert";
  successAlert.innerHTML = `
    Successfully allocated ${amount} credits to ${userName}.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  const container = document.querySelector(".container");
  container.insertBefore(successAlert, container.querySelector(".row"));

  // Clear form fields
  document.querySelector("#user_id").value = "";
  document.querySelector("#amount").value = "";
  document.querySelector("#reason").value = "";

  // Auto-dismiss the alert after 5 seconds
  setTimeout(function () {
    const alertInstance = new bootstrap.Alert(successAlert);
    alertInstance.close();
  }, 5000);

  // Update stats (would normally come from server)
  updateCreditStats(amount);
}

/**
 * Updates credit stats after allocation
 * @param {number} amount - The amount allocated
 */
function updateCreditStats(amount) {
  // In a real app, we would refresh data from the server
  // This is just a simulation for the demo
  const totalCreditsElement = document.querySelector(
    ".bg-success .card-body h2"
  );
  if (totalCreditsElement) {
    const currentCredits = parseInt(
      totalCreditsElement.textContent.replace(/,/g, "")
    );
    totalCreditsElement.textContent = new Intl.NumberFormat().format(
      currentCredits + parseInt(amount)
    );
  }

  const circulationElement = document.querySelector("#carbon .text-primary");
  if (circulationElement) {
    const currentCirculation = parseInt(
      circulationElement.textContent.replace(/,/g, "")
    );
    circulationElement.textContent = new Intl.NumberFormat().format(
      currentCirculation + parseInt(amount)
    );
  }
}

/**
 * Simulates report generation
 * @param {HTMLFormElement} form - The form element
 */
function generateReport(form) {
  const formData = new FormData(form);
  const reportName = formData.get("report_name");

  // In a real application, this would be an AJAX call to the server
  console.log("Generating report:", reportName);

  // Get the modal ID
  const modalId = form.closest(".modal").id;
  const modal = bootstrap.Modal.getInstance(
    document.querySelector(`#${modalId}`)
  );
  modal.hide();

  // Show loading indicator
  const loadingAlert = document.createElement("div");
  loadingAlert.className = "alert alert-info";
  loadingAlert.role = "alert";
  loadingAlert.innerHTML = `
    <div class="d-flex align-items-center">
      <strong>Generating report: ${reportName}...</strong>
      <div class="spinner-border ms-auto" role="status" aria-hidden="true"></div>
    </div>
  `;

  const container = document.querySelector(".container");
  container.insertBefore(loadingAlert, container.querySelector(".row"));

  // Simulate report generation delay
  setTimeout(function () {
    // Remove loading indicator
    loadingAlert.remove();

    // Show success message
    const successAlert = document.createElement("div");
    successAlert.className = "alert alert-success alert-dismissible fade show";
    successAlert.role = "alert";
    successAlert.innerHTML = `
      Report "${reportName}" has been generated successfully. <a href="#">Click here to download</a>.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    container.insertBefore(successAlert, container.querySelector(".row"));

    // Reset form
    form.reset();

    // Auto-dismiss the alert after 8 seconds
    setTimeout(function () {
      const alertInstance = new bootstrap.Alert(successAlert);
      alertInstance.close();
    }, 8000);

    // Update reports table (would normally come from server)
    updateReportsTable(reportName);
  }, 2000);
}

/**
 * Updates the reports table with a new entry
 * @param {string} reportName - The name of the report
 */
function updateReportsTable(reportName) {
  const reportsTable = document.querySelector("#reports table tbody");
  if (!reportsTable) return;

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Create a new row for the report
  const newRow = document.createElement("tr");

  // Generate a new report ID
  const lastReportId = reportsTable.querySelector(
    "tr:first-child td:first-child"
  ).textContent;
  const numericPart = parseInt(lastReportId.split("-")[2]) + 1;
  const newReportId = `R-2025-${numericPart.toString().padStart(3, "0")}`;

  newRow.innerHTML = `
    <td>${newReportId}</td>
    <td>${reportName}</td>
    <td>adminuser</td>
    <td>${dateStr} ${timeStr}</td>
    <td>
      <div class="btn-group">
        <a href="#" class="btn btn-sm btn-success">Download</a>
        <a href="#" class="btn btn-sm btn-info">View</a>
      </div>
    </td>
  `;

  // Add the new row at the top of the table
  reportsTable.insertBefore(newRow, reportsTable.firstChild);
}

/**
 * Simulates approving a user
 * @param {HTMLElement} button - The approval button
 */
function approveUser(button) {
  const row = button.closest("tr");
  const username = row.querySelector("td:nth-child(2)").textContent;

  // In a real application, this would be an AJAX call to the server
  console.log(`Approving user: ${username}`);

  // Update the status badge
  const statusBadge = row.querySelector("td:nth-child(6) .badge");
  statusBadge.className = "badge bg-success";
  statusBadge.textContent = "Approved";

  // Remove the approve button
  button.remove();

  // Show success message
  const successAlert = document.createElement("div");
  successAlert.className = "alert alert-success alert-dismissible fade show";
  successAlert.role = "alert";
  successAlert.innerHTML = `
    User "${username}" has been approved successfully.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  const container = document.querySelector(".container");
  container.insertBefore(successAlert, container.querySelector(".row"));

  // Update pending approvals counter
  updatePendingApprovalsCounter(-1);

  // Auto-dismiss the alert after 5 seconds
  setTimeout(function () {
    const alertInstance = new bootstrap.Alert(successAlert);
    alertInstance.close();
  }, 5000);
}

/**
 * Updates the pending approvals counter
 * @param {number} change - The change in count (+1 or -1)
 */
function updatePendingApprovalsCounter(change) {
  const pendingCounter = document.querySelector(".bg-info .card-body h2");
  if (pendingCounter) {
    const currentCount = parseInt(pendingCounter.textContent);
    pendingCounter.textContent = Math.max(0, currentCount + change);
  }
}

/**
 * Simulates approving a transaction
 * @param {HTMLElement} button - The approval button
 */
function approveTransaction(button) {
  const modal = button.closest(".modal");
  const transactionId = modal.id.replace("transactionModal", "");

  // In a real application, this would be an AJAX call to the server
  console.log(`Approving transaction: ${transactionId}`);

  // Close the modal
  const modalInstance = bootstrap.Modal.getInstance(modal);
  modalInstance.hide();

  // Find and update the transaction row
  const transactionRow = document
    .querySelector(
      `#transactions table tbody tr td:first-child:contains('${transactionId}')`
    )
    .closest("tr");
  if (transactionRow) {
    const statusBadge = transactionRow.querySelector("td:nth-child(7) .badge");
    statusBadge.className = "badge bg-success";
    statusBadge.textContent = "completed";
  }

  // Update the modal status too
  const modalStatusBadge = modal.querySelector(
    ".modal-body p:nth-child(6) strong"
  ).nextSibling;
  modalStatusBadge.textContent = " completed";

  // Show success message
  const successAlert = document.createElement("div");
  successAlert.className = "alert alert-success alert-dismissible fade show";
  successAlert.role = "alert";
  successAlert.innerHTML = `
    Transaction #${transactionId} has been approved successfully.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  const container = document.querySelector(".container");
  container.insertBefore(successAlert, container.querySelector(".row"));

  // Remove the approve button from the modal
  button.remove();

  // Auto-dismiss the alert after 5 seconds
  setTimeout(function () {
    const alertInstance = new bootstrap.Alert(successAlert);
    alertInstance.close();
  }, 5000);
}

/**
 * Initializes charts if they exist
 * This is a placeholder - in a real app, you'd use Chart.js or similar
 */
function initializeCharts() {
  // This function would contain chart initialization code
  // It's left as a placeholder since the HTML doesn't have chart elements
  console.log("Charts would be initialized here if they existed in the HTML");
}

// Utility function to find elements containing text (for jQuery-like behavior)
Element.prototype.contains = function (text) {
  return this.textContent.includes(text);
};
