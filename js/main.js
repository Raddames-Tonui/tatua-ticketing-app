document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.href;
  const isLocal = url.includes("/local/");
  const isSession = url.includes("/session/");

  // Storage Helpers
  const storage = {
    save: (tickets) => {
      if (isLocal) localStorage.setItem("tickets", btoa(JSON.stringify(tickets)));
      else if (isSession) sessionStorage.setItem("tickets", JSON.stringify(tickets));
      else console.error("Unknown storage type, cannot save tickets");
    },
    get: () => {
      if (isLocal) {
        const raw = localStorage.getItem("tickets");
        if (!raw) return [];
        try { return JSON.parse(atob(raw)); }
        catch (e) { console.warn("Corrupted local tickets, clearing data", e); localStorage.removeItem("tickets"); return []; }
      } else if (isSession) {
        return JSON.parse(sessionStorage.getItem("tickets")) || [];
      } else {
        console.error("Unknown storage type, cannot get tickets"); 
        return [];
      }
    }
  };

  // FORM PAGE LOGIC (Raise Ticket)
  const form = document.getElementById("ticket-form");
  const attachmentInput = document.getElementById("attachment");
  const selectedFilesContainer = document.querySelector(".selected-files");
  let selectedFiles = [];

  if (form) {
    // File selection
    attachmentInput?.addEventListener("change", () => {
      selectedFiles = Array.from(attachmentInput.files);
      renderSelectedFiles();
    });

    function renderSelectedFiles() {
      if (!selectedFilesContainer) return;
      selectedFilesContainer.innerHTML = "";
      selectedFiles.forEach(f => {
        const div = document.createElement("div");
        div.className = "selected-file";
        div.textContent = f.name;
        selectedFilesContainer.appendChild(div);
      });
    }

    // Validation helpers
    function setError(input, message) {
      const wrapper = input.closest(".input-wrapper") || input.parentElement;
      const errorEl = wrapper.parentElement.querySelector(".error-message");
      if (errorEl) errorEl.textContent = message;
      input.classList.add("invalid");
    }

    function clearError(input) {
      const wrapper = input.closest(".input-wrapper") || input.parentElement;
      const errorEl = wrapper.parentElement.querySelector(".error-message");
      if (errorEl) errorEl.textContent = "";
      input.classList.remove("invalid");
    }

    function validateInput() {
      let valid = true;

      // Full name
      const fullName = form.fullName;
      if (!fullName.value.trim()) { setError(fullName, "Full Name is required"); valid = false; } 
      else clearError(fullName);

      // Email
      const email = form.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) { setError(email, "Email is required"); valid = false; } 
      else if (!emailRegex.test(email.value.trim())) { setError(email, "Invalid email format"); valid = false; } 
      else clearError(email);

      // Phone
      const phone = form.phone;
      const phoneRegex = /^[0-9+\-()\s]+$/;
      if (!phone.value.trim()) { setError(phone, "Phone number is required"); valid = false; } 
      else if (!phoneRegex.test(phone.value.trim())) { setError(phone, "Invalid phone number"); valid = false; } 
      else clearError(phone);

      // Subject
      const subject = form.subject;
      if (!subject.value) { setError(subject, "Please select a subject"); valid = false; } 
      else clearError(subject);

      // Message
      const message = form.message;
      if (!message.value.trim()) { setError(message, "Message cannot be empty"); valid = false; } 
      else clearError(message);

      // Preferred Contact
      const preferred = form.preferredContact;
      if (![...preferred].some(r => r.checked)) {
        const errorEl = preferred[0].closest(".form-group").querySelector(".error-message");
        if (errorEl) errorEl.textContent = "Please choose preferred contact method";
        valid = false;
      } else {
        const errorEl = preferred[0].closest(".form-group").querySelector(".error-message");
        if (errorEl) errorEl.textContent = "";
      }

      // Terms
      const terms = form.terms;
      if (!terms.checked) { setError(terms, "You must agree to terms"); valid = false; } 
      else clearError(terms);

      return valid;
    }

    function saveTicket(ticket) {
      const tickets = storage.get();
      tickets.push(ticket);
      storage.save(tickets);
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      if (!validateInput()) return;

      const ticket = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim(),
        preferredContact: [...form.preferredContact].find(r => r.checked).value,
        attachments: selectedFiles.map(f => f.name),
        date: new Date(),
      };

      saveTicket(ticket);
      form.reset();
      selectedFiles = [];
      renderSelectedFiles();
      alert("Ticket submitted successfully!");
    });

    form.addEventListener("reset", () => {
      selectedFiles = [];
      renderSelectedFiles();
      form.querySelectorAll(".error-message").forEach(el => el.textContent = "");
      form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    });
  }

  // TICKETS PAGE LOGIC
  const ticketsBody = document.getElementById("tickets-body");
  if (ticketsBody) {
    function renderTickets() {
  ticketsBody.innerHTML = "";
  const tickets = storage.get();
  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");
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
        <div class="cell-content">${new Date(ticket.date).toLocaleString()}</div>
      </td>
      <td>
        <div class="actions">
          <button class="icon-btn" title="Show details">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          ${ticket.attachments && ticket.attachments.length ? `
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

  ticketsBody.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      const tickets = storage.get();
      tickets.splice(index, 1);
      storage.save(tickets);
      renderTickets();
    });
  });
}


    renderTickets();

    const refreshBtn = document.querySelector(".refresh");
    refreshBtn?.addEventListener("click", renderTickets);
  }
});
