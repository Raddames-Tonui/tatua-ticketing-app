// =====================
// Active Navlink
// =====================
// Loop through all nav links on the page and check if their `href` matches the current page URL.
// If a link matches, add the "active" class so the user knows which page they are on.
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add("active");
  }
});


// =====================
// Storage Helpers
// =====================
// Get tickets stored in localStorage. If none exist, return an empty array.
// LocalStorage persists data in the browser across page reloads.
function getTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

// Save tickets back to localStorage (convert array → JSON string).
function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}


// =====================
// Validation Helpers
// =====================
// Check if a value is non-empty and not just whitespace.
function validateRequired(value) {
  return value && value.trim() !== "";
}

// Check if email matches a basic valid email format using regex.
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Validate the full form data object.
// Returns an error message string if validation fails, otherwise null (valid).
function validateForm(data) {
  if (!validateRequired(data.fullName)) return "Full name is required.";
  if (!validateEmail(data.email)) return "Invalid email format.";
  if (!validateRequired(data.subject)) return "Subject is required.";
  if (!validateRequired(data.message)) return "Message is required.";
  return null;
}


function showModal({ message, html, showCancel = false, onOk, onCancel }) {
  const modal = document.getElementById("custom-modal");
  const modalBody = document.getElementById("modal-body");
  const okBtn = document.getElementById("modal-ok");
  const cancelBtn = document.getElementById("modal-cancel");
  const closeBtn = document.querySelector(".close-btn");

  // Fill content
  modalBody.innerHTML = html || `<p>${message}</p>`;
  modal.classList.remove("hidden");

  // Toggle cancel visibility
  cancelBtn.classList.toggle("hidden", !showCancel);

  // Cleanup old events
  okBtn.onclick = cancelBtn.onclick = closeBtn.onclick = null;

  okBtn.onclick = () => {
    modal.classList.add("hidden");
    if (onOk) onOk();
  };
  cancelBtn.onclick = closeBtn.onclick = () => {
    modal.classList.add("hidden");
    if (onCancel) onCancel();
  };
}


// =====================
// Render Tickets Table
// =====================
// This function rebuilds the entire <tbody> of the tickets table from scratch.
// It clears old rows, then inserts each ticket as a new <tr>.
function renderTickets() {
  const ticketsBody = document.getElementById("tickets-body");
  if (!ticketsBody) return; // Exit if the table body doesn't exist.

  ticketsBody.innerHTML = ""; // Clear old rows.
  const tickets = getTickets(); // Load latest tickets from storage.

  // Loop through each ticket and render its row
  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");
    tr.id = `ticket-${index}`; // Give each row a unique ID.

    // Insert all ticket details inside row HTML.
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
            <!-- Action buttons -->
            <button class="icon-btn details" title="Show details">
              <i class="fa-solid fa-circle-info"></i>
            </button>
            ${ticket.attachment && ticket.attachment.length ? `
            <button class="icon-btn download" title="Download attachments">
              <i class="fa-solid fa-download"></i>
            </button>` : ""}
            <button class="icon-btn phone" title="Call user">
              <i class="fa-solid fa-phone"></i>
            </button>
            <button class="icon-btn email" title="Send email">
              <i class="fa-solid fa-envelope"></i>
            </button>
            <button class="icon-btn edit" title="Edit ticket">
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

  // Attach event listeners for delete buttons (since they are recreated each render).
  document.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", e => {
      const idx = e.currentTarget.dataset.index; // index is stored in data-index
      deleteTicket(idx);
    });
  });

  // After rendering, attach handlers for all row actions (info, download, phone, email, edit).
  addRowActions();
}


// =====================
// Delete Ticket
// =====================
// Removes one ticket by index, saves the updated list, and re-renders table.
function deleteTicket(index) {
  let tickets = getTickets();
  showModal({
  message: "Are you sure you want to delete this ticket?",
  showCancel: true,
  onOk: () => {
    deleteTicket(index);
  }
});

  tickets.splice(index, 1); // Remove ticket at given index.
  saveTickets(tickets);
  renderTickets(); // Refresh table after deletion.
}


// =====================
// Form Handling
// =====================
// Handle ticket form submission: validate, store, and re-render table.
const form = document.getElementById("ticket-form");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault(); // Prevent normal page reload.

    const formData = new FormData(form); // Collect form data.
    const data = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      preferredContact: formData.get("preferredContact"),
      terms: formData.get("terms") ? true : false, // Checkbox => boolean
      attachment: [...form.attachment.files].map(f => f.name), // Save filenames only
      date: new Date().toISOString().replace("T", " ").slice(0, 19) // Format date
    };

    // Validate form data
    const error = validateForm(data);
    if (error) {
      alert(error);
      return;
    }

    // Validate total file size (max 3 MB)
    let totalSize = 0;
    for (let file of form.attachment.files) totalSize += file.size;
    if (totalSize > 3 * 1024 * 1024) {
      alert("Total file size cannot exceed 3 MB.");
      return;
    }

    // Save ticket
    const tickets = getTickets();
    tickets.push(data);
    saveTickets(tickets);

    form.reset();   // Reset form
    renderTickets(); // Rebuild table with new ticket
  });
}


// =====================
// Page Load + Refresh
// =====================
// On DOM ready, load tickets into table and attach refresh button logic.
window.addEventListener("DOMContentLoaded", () => {
  renderTickets();

  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }
});


// =====================
// Row Action Handlers
// =====================
// Add event listeners for each row button (info, download, phone, email, edit).
function addRowActions() {
  // 1. Show Details (popup with full info)
  document.querySelectorAll(".icon-btn.details").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const ticket = getTickets()[index];
      alert(`
        Full Name: ${ticket.fullName}
        Email: ${ticket.email}
        Phone: ${ticket.phone}
        Subject: ${ticket.subject}
        Message: ${ticket.message}
        Date: ${ticket.date}
        Attachments: ${ticket.attachment.join(", ")}
      `);
    });
  });

  // 2. Download Attachments
  document.querySelectorAll(".icon-btn.download").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const ticket = getTickets()[index];
      if (!ticket.attachment || !ticket.attachment.length) {
        alert("No attachments available.");
        return;
      }
      ticket.attachment.forEach(fileName => {
        // For now just simulate download
        alert(`Pretend downloading: ${fileName}`);
      });
    });
  });

  // 3. Phone Call (simulate tel link)
  document.querySelectorAll(".icon-btn.phone").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const ticket = getTickets()[index];
      if (ticket.preferredContact === "phone" && ticket.phone) {
        window.location.href = `tel:${ticket.phone}`; // Opens phone dialer
      } else {
        alert("Preferred contact is not phone, or no number provided.");
      }
    });
  });

  // 4. Email (simulate mailto link)
  document.querySelectorAll(".icon-btn.email").forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const ticket = getTickets()[index];
      if (ticket.preferredContact === "email" && ticket.email) {
        window.location.href = `mailto:${ticket.email}?subject=${encodeURIComponent(ticket.subject)}`;
      } else {
        alert("Preferred contact is not email, or no email provided.");
      }
    });
  });

  // 5. Edit Ticket (quick edit via prompt)
document.querySelectorAll(".icon-btn.edit").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const ticket = getTickets()[index];

    showModal({
      html: `
        <h3>Edit Ticket</h3>
        <input type="text" id="edit-subject" value="${ticket.subject}" class="input"/>
        <textarea id="edit-message" class="input">${ticket.message}</textarea>
      `,
      showCancel: true,
      onOk: () => {
        const newSubject = document.getElementById("edit-subject").value;
        const newMessage = document.getElementById("edit-message").value;

        if (newSubject && newMessage) {
          let tickets = getTickets();
          tickets[index].subject = newSubject;
          tickets[index].message = newMessage;
          saveTickets(tickets);
          renderTickets();
        }
      }
    });
  });
});

}
