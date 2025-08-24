// =====================
// Active Navlink
// =====================
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});

// =====================
// Storage Helpers
// =====================
function getTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

// =====================
// Validation Helpers
// =====================
function validateRequired(value) {
  return value && value.trim() !== "";
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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
function renderTickets() {
  const ticketsBody = document.getElementById("tickets-body");
  if (!ticketsBody) return;

  ticketsBody.innerHTML = "";
  const tickets = getTickets();

  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");
    tr.id = `ticket-${index}`;

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

    ticketsBody.appendChild(tr);
  });

  // Delete handlers
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
function deleteTicket(index) {
  let tickets = getTickets();
  tickets.splice(index, 1);
  saveTickets(tickets);
  renderTickets();
}

// =====================
// Form Handling
// =====================
const form = document.getElementById("ticket-form");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      preferredContact: formData.get("preferredContact"),
      terms: formData.get("terms") ? true : false,
      attachment: [...form.attachment.files].map(f => f.name),
      date: new Date().toISOString().replace("T", " ").slice(0, 19)
    };

    // Run validation
    const error = validateForm(data);
    if (error) {
      alert(error);
      return;
    }

    // File size check (max 3MB)
    let totalSize = 0;
    for (let file of form.attachment.files) totalSize += file.size;
    if (totalSize > 3 * 1024 * 1024) {
      alert("Total file size cannot exceed 3 MB.");
      return;
    }

    const tickets = getTickets();
    tickets.push(data);
    saveTickets(tickets);

    form.reset();
    renderTickets();
  });
}

// =====================
// Page Load + Refresh
// =====================
window.addEventListener("DOMContentLoaded", () => {
  renderTickets();

  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
});
