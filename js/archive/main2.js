// Active Navlink
document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});


// Modal Helper
function showModal({ message, html, showCancel = false, onOk, onCancel }) {
  const modal = document.getElementById("custom-modal");
  const modalBody = document.getElementById("modal-body");
  const okBtn = document.getElementById("modal-ok");
  const cancelBtn = document.getElementById("modal-cancel");
  const closeBtn = document.querySelector(".close-btn");
  if (!modal || !modalBody || !okBtn || !cancelBtn || !closeBtn) return;

  modalBody.innerHTML = html || `<p>${message}</p>`;
  modal.classList.remove("hidden-modal");
  cancelBtn.classList.toggle("hidden", !showCancel);

  okBtn.onclick = cancelBtn.onclick = closeBtn.onclick = null;

  okBtn.onclick = e => { e.stopPropagation(); modal.classList.add("hidden-modal"); if (onOk) onOk(); };
  cancelBtn.onclick = closeBtn.onclick = e => { e.stopPropagation(); modal.classList.add("hidden-modal"); if (onCancel) onCancel(); };
}



// Attachments Handler
let selectedFiles = [];
const attachmentInput = document.getElementById("attachment");

if (attachmentInput) {
  attachmentInput.addEventListener("change", () => {
    const container = attachmentInput.closest(".form-group").querySelector(".selected-files");
    const newFiles = Array.from(attachmentInput.files);
    selectedFiles = selectedFiles.concat(newFiles);
    renderSelectedFiles(container);
  });
}

function renderSelectedFiles(container) {
  container.innerHTML = "";
  selectedFiles.forEach((file, index) => {
    const div = document.createElement("div");
    div.className = "selected-file";
    div.innerHTML = `
      <span class="file-name">${file.name}</span>
      <button type="button" data-index="${index}" class="remove-file-btn">Remove</button>
    `;
    container.appendChild(div);
  });

  container.querySelectorAll(".remove-file-btn").forEach(btn => {
    btn.onclick = e => {
      const idx = parseInt(e.target.dataset.index);
      selectedFiles.splice(idx, 1);
      renderSelectedFiles(container);
    };
  });
}

// Tickets Table
function renderTickets() {
  const ticketsBody = document.getElementById("tickets-body");
  if (!ticketsBody) return;

  ticketsBody.innerHTML = "";
  const tickets = getTickets();

  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td><strong>${ticket.fullName}</strong><br><span>${ticket.email || ticket.phone}</span></td>
      <td><strong>${ticket.subject}</strong><br><span class="truncate">${ticket.message}</span></td>
      <td>${ticket.date}</td>
      <td>
        <div class="actions">
          <button class="icon-btn details" data-index="${index}" title="Details"><i class="fa-solid fa-circle-info"></i></button>
          ${ticket.attachments && ticket.attachments.length ? `<button class="icon-btn download" data-index="${index}" title="Download"><i class="fa-solid fa-download"></i></button>` : ""}
          <button class="icon-btn phone" data-index="${index}" title="Call"><i class="fa-solid fa-phone"></i></button>
          <button class="icon-btn email" data-index="${index}" title="Email"><i class="fa-solid fa-envelope"></i></button>
          <button class="icon-btn edit" data-index="${index}" title="Edit"><i class="fa-solid fa-pen"></i></button>
          <button class="icon-btn delete" data-index="${index}" title="Delete"><i class="fa-solid fa-trash"></i></button>
        </div>
      </td>
    `;
    ticketsBody.appendChild(tr);
  });
}

// Row Actions (Delegation)
document.getElementById("tickets-body").addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const index = btn.dataset.index;
  const ticket = getTickets()[index];
  if (!ticket) return;

  if (btn.classList.contains("details")) {
    showModal({
      html: `
        <h3>Ticket Details</h3>
        <p><strong>Name:</strong> ${ticket.fullName}</p>
        <p><strong>Email:</strong> ${ticket.email}</p>
        <p><strong>Phone:</strong> ${ticket.phone}</p>
        <p><strong>Subject:</strong> ${ticket.subject}</p>
        <p><strong>Message:</strong> ${ticket.message}</p>
        <p><strong>Date:</strong> ${ticket.date}</p>
        <p><strong>Attachments:</strong> ${ticket.attachments.join(", ")}</p>
      `
    });
  } else if (btn.classList.contains("download")) {
    if (!ticket.files || !ticket.files.length) return alert("No attachments.");
    ticket.files.forEach(file => {
      const link = document.createElement("a");
      link.href = file.blob;
      link.download = file.name;
      link.click();
    });
  } else if (btn.classList.contains("phone")) {
    if (ticket.phone) window.location.href = `tel:${ticket.phone}`;
    else alert("No phone available.");
  } else if (btn.classList.contains("email")) {
    if (ticket.email) window.location.href = `mailto:${ticket.email}?subject=${encodeURIComponent(ticket.subject)}`;
    else alert("No email available.");
  } else if (btn.classList.contains("edit")) {
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
          const tickets = getTickets();
          tickets[index].subject = newSubject;
          tickets[index].message = newMessage;
          saveTickets(tickets);
          renderTickets();
        }
      }
    });
  } else if (btn.classList.contains("delete")) {
    showModal({
      message: "Delete this ticket?",
      showCancel: true,
      onOk: () => {
        const tickets = getTickets();
        tickets.splice(index, 1);
        saveTickets(tickets);
        renderTickets();
      }
    });
  }
});

// Form Submission
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
      attachments: selectedFiles.map(f => f.name),
      files: selectedFiles.map(f => ({ name: f.name, type: f.type, blob: URL.createObjectURL(f) })),
      date: new Date().toISOString().replace("T", " ").slice(0, 19)
    };

    // File type/size check
    let totalSize = selectedFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 3 * 1024 * 1024) return alert("Total attachments cannot exceed 3 MB.");
    for (let file of selectedFiles) {
      if (!["application/pdf", "image/jpg", "image/jpeg"].includes(file.type)) {
        return alert("Only PDF or image files allowed.");
      }
    }

    const tickets = getTickets();
    tickets.push(data);
    saveTickets(tickets);

    // --- CLEAR FORM & ATTACHMENTS ---
    form.reset();                // Reset all input fields
    selectedFiles = [];           // Clear selected files array

    // Clear attachments container
    const attachmentsContainer = form.querySelector(".selected-files");
    if (attachmentsContainer) attachmentsContainer.innerHTML = "";

    // Clear Preferred Contact
    const preferredSelect = form.querySelector("select[name='preferredContact']");
    if (preferredSelect) preferredSelect.value = "";

    // Hide any error messages
    form.querySelectorAll(".error-message").forEach(err => {
      err.innerText = "";
      err.style.display = "none";
    });

    renderTickets();

    showModal({ message: "Ticket submitted successfully!" });
  });
}

// Page Load / Refresh
window.addEventListener("DOMContentLoaded", () => {
  renderTickets();
  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) refreshBtn.addEventListener("click", () => window.location.reload());
});
