// =====================
// Active Navlink Highlight
// =====================
// This makes the navigation bar automatically highlight the link for the current page.
// `document.querySelectorAll(".nav-link")` selects ALL elements with the class "nav-link".
// `.forEach(link => {...})` loops over each link.
document.querySelectorAll(".nav-link").forEach(link => {
  // If the link's `href` (URL it points to) matches the browser's current URL...
  if (link.href === window.location.href) {
    // ...then we add the class "active" to it.
    // This is usually styled in CSS to highlight the link.
    link.classList.add("active");
  }
});


// =====================
// Storage Helpers (Local Storage API)
// =====================
// These functions abstract how we read/write tickets from/to the browser's storage.

// Retrieve tickets from localStorage.
// localStorage stores key-value pairs as strings, so we must `JSON.parse` them back into objects.
// If no tickets exist, return an empty array.
function getTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

// Save tickets back into localStorage.
// Objects/arrays cannot be saved directly → we convert them into a string with `JSON.stringify`.
function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}


// =====================
// Validation Helpers
// =====================
// These functions validate form inputs before saving data.

// Check that a field has a value (non-empty, not just spaces).
function validateRequired(value) {
  return value && value.trim() !== "";
}

// Basic email format validation using a regular expression.
// This checks that the email has "something@something.something".
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate the entire form data object.
// If something is invalid, return an error message (string).
// If all good, return `null`.
function validateForm(data) {
  if (!validateRequired(data.fullName)) return "Full name is required.";
  if (!validateEmail(data.email)) return "Invalid email format.";
  if (!validateRequired(data.subject)) return "Subject is required.";
  if (!validateRequired(data.message)) return "Message is required.";
  return null;
}


// =====================
// Render Tickets Table
// =====================
// This function updates the tickets table with the latest data.
function renderTickets() {
  const ticketsBody = document.getElementById("tickets-body");
  if (!ticketsBody) return; // Stop if the table body doesn't exist.

  ticketsBody.innerHTML = ""; // Clear existing table rows first.

  const tickets = getTickets(); // Fetch stored tickets.

  // Loop through each ticket and build a <tr> (table row).
  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");
    tr.id = `ticket-${index}`; // Assign unique ID to row.

    // Fill the row with ticket data.
    // Note: Template literals (backticks ``) allow us to embed variables directly inside HTML.
    tr.innerHTML = `
      <td class="ticket-id"><div class="cell-content">${index + 1}</div></td>
      <td>
        <strong>${ticket.fullName}</strong>
        <span class="email">${ticket.email || ticket.phone}</span>
      </td>
      <td class="ticket-message">
        <strong>${ticket.subject}</strong>
        <span class="truncate">${ticket.message}</span>
      </td>
      <td class="ticket-date">
        <div class="cell-content">${ticket.date}</div>
      </td>
      <td>
        <div class="actions">
          <button class="icon-btn" title="Show details">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          ${ticket.attachment && ticket.attachment.length ? `
          <button class="icon-btn" title="Download attachments">
            <i class="fa-solid fa-download"></i>
          </button>` : ""}
          <button class="icon-btn" title="Call user">
            <i class="fa-solid fa-phone"></i>
          </button>
          <button class="icon-btn" title="Send email">
            <i class="fa-solid fa-envelope"></i>
          </button>
          <button class="icon-btn" title="Edit ticket">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="icon-btn delete" title="Delete ticket" data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    ticketsBody.appendChild(tr); // Add row to table.
  });

  // Add click handlers to all "Delete" buttons.
  // Each delete button has a `data-index` attribute that tells us which ticket to remove.
  document.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.currentTarget.dataset.index;
      deleteTicket(idx);
    });
  });
}


// =====================
// Delete Ticket
// =====================
// Remove a ticket by index (array position).
function deleteTicket(index) {
  let tickets = getTickets();    // Get all tickets.
  tickets.splice(index, 1);      // Remove the ticket at position `index`.
  saveTickets(tickets);          // Save updated tickets back to localStorage.
  renderTickets();               // Refresh the table display.
}


// =====================
// Form Handling
// =====================
// Handle new ticket submissions.
const form = document.getElementById("ticket-form");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault(); // Prevent default form submission (which reloads the page).

    // Gather form inputs into an object.
    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      preferredContact: formData.get("preferredContact"),
      terms: formData.get("terms") ? true : false, // Checkbox becomes true/false.
      attachment: [...form.attachment.files].map(f => f.name), // Save file names only.
      date: new Date().toISOString().replace("T", " ").slice(0, 19) // Format date.
    };

    // Run validation and show error if invalid.
    const error = validateForm(data);
    if (error) {
      alert(error);
      return;
    }

    // Extra: Check total file size (max 3 MB).
    let totalSize = 0;
    for (let file of form.attachment.files) totalSize += file.size;
    if (totalSize > 3 * 1024 * 1024) {
      alert("Total file size cannot exceed 3 MB.");
      return;
    }

    // Save ticket to storage.
    const tickets = getTickets();
    tickets.push(data);
    saveTickets(tickets);

    // Reset form and refresh table.
    form.reset();
    renderTickets();
  });
}


// =====================
// Page Load + Refresh Button
// =====================
// When the page loads, render the tickets.
// Also, allow a "Refresh" button to reload the page.
window.addEventListener("DOMContentLoaded", () => {
  renderTickets();

  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload(); // Reload page from browser.
    });
  }
});



