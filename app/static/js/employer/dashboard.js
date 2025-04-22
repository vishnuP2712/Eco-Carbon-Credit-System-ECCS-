// Function to open and populate the Manage Modal dynamically
function openManageModal(empId, name, dept) {
  document.getElementById("modalEmpId").textContent = empId;
  document.getElementById("modalEmpName").textContent = name;
  document.getElementById("modalEmpDept").textContent = dept;

  // Set dynamic href for Add Credits button
  document.getElementById("addCreditsLink").href = `/add-credits/${empId}`;
  const form = document.getElementById("deleteForm");
  form.action = `/delete-account/${empId}`; // Flask route should match this

  // Set dynamic function for Delete Account button
  document.getElementById("deleteAccountBtn").onclick = function () {
    if (confirm("Are you sure you want to delete this employee?")) {
      window.location.href = `/delete-employee/${empId}`;
    }
  };

  // Show the modal
  var manageModal = new bootstrap.Modal(document.getElementById("manageModal"));
  manageModal.show();
}

// Set theme preference in localStorage
document.addEventListener("DOMContentLoaded", function () {
  localStorage.setItem("theme", "dark");

  // Replace close button with a dark-themed close button if necessary
  const closeButtons = document.querySelectorAll(".btn-close");
  closeButtons.forEach((button) => {
    button.classList.add("btn-close-white");
  });
});

// Debounced search function for employee table
let debounceTimeout;
function searchTable() {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let rows = document.querySelectorAll("table tbody tr");

    rows.forEach((row) => {
      let text = row.textContent.toLowerCase();
      row.style.display = text.includes(input) ? "" : "none";
    });
  }, 200);
}

// Handle modal population on show event (for dynamic content inside the modal)
const manageModal = document.getElementById("manageModal");
manageModal.addEventListener("show.bs.modal", function (event) {
  const button = event.relatedTarget;
  const empId = button.getAttribute("data-empid");
  const name = button.getAttribute("data-name");
  const dept = button.getAttribute("data-dept");

  // Set dynamic content for modal based on button attributes
  document.getElementById("modalEmpId").textContent = empId;
  document.getElementById("modalEmpName").textContent = name;
  document.getElementById("modalEmpDept").textContent = dept;

  // Set the form action for deleting an employee
  const form = document.getElementById("deleteForm");
  form.action = `/delete-account/${empId}`; // Flask route should match this
});

function initializeCharts() {
  const creditsChartElement = document.getElementById("creditsChart");
  if (!creditsChartElement) return;

  const ctx = creditsChartElement.getContext("2d");

  // Sample data - in production, this would come from your backend
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const credits = [120, 150, 130, 170, 160, 180];

  new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Carbon Credits",
          data: credits,
          backgroundColor: "rgba(75, 192, 128, 0.2)",
          borderColor: "rgba(75, 192, 128, 1)",
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: "rgba(75, 192, 128, 1)",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: "Credits",
          },
        },
        x: {
          title: {
            display: true,
            text: "Month",
          },
        },
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              return context.parsed.y + " credits";
            },
          },
        },
        legend: {
          display: false,
        },
      },
    },
  });
}
// Add this to your dashboard.js file or include in the extra_js block

document.addEventListener("DOMContentLoaded", function () {
  // Get the chart canvas and loading indicator
  const creditsChartCanvas = document.getElementById("creditsChart");
  const loadingIndicator = document.getElementById("loadingIndicator");

  // Show loading indicator initially
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  // Function to fetch data from API
  async function fetchCreditsPieData() {
    try {
      // Replace with your actual API endpoint
      const response = await fetch("/api/carbon-credits-distribution");

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching carbon credits data:", error);
      return null;
    }
  }

  // Function to render the pie chart
  function renderPieChart(data) {
    // Hide loading indicator
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    if (!data || !creditsChartCanvas) {
      console.error("Cannot render chart: missing data or canvas element");
      return;
    }

    // Create pie chart
    const ctx = creditsChartCanvas.getContext("2d");

    new Chart(ctx, {
      type: "pie",
      data: {
        labels: data.categories,
        datasets: [
          {
            data: data.values,
            backgroundColor: [
              "rgba(75, 192, 192, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 99, 132, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
            borderColor: [
              "rgba(75, 192, 192, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
              "rgba(153, 102, 255, 1)",
              "rgba(255, 99, 132, 1)",
              "rgba(255, 159, 64, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.chart.data.datasets[0].data.reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} credits (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  // Fetch data and render chart
  fetchCreditsPieData().then((data) => {
    if (data) {
      renderPieChart(data);
    } else {
      // Handle error state by displaying a message
      if (loadingIndicator) {
        loadingIndicator.innerHTML =
          '<p class="text-danger">Failed to load chart data. Please try again later.</p>';
      }
    }
  });
});
