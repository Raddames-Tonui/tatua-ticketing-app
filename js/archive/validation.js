import { validateInput, validateAttachments } from "./validation.js";

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  let tickets = [];
  let ticketCounter = 1;

  const formPage = document.getElementById("form-page");
  const ticketsPage = document.getElementById("tickets-page");
  const form = document.getElementById("ticket-form");
  const editForm = document.getElementById("edit-form");
  const ticketsBody = document.getElementById("tickets-body");

  const navForm = document.getElementById("nav-form");
  const navTickets = document.getElementById("nav-tickets");

  const successModal = document.getElementById("success-modal");
  const successCloseBtn = document.getElementById("success-footer-close-btn");

  const infoModal = document.querySelector(".info-modal");
  const alertModal = document.querySelector(".alert-modal");
  const alertMessage = alertModal.querySelector(".alert-message");
  const alertOkBtn = alertModal.querySelector(".ok");
  const confirmModal = document.querySelector(".confirm-modal");
  const confirmYesBtn = confirmModal.querySelector(".confirm-yes");

  const infoBody = infoModal.querySelector(".success-modal-body");

  function showPage(page) {
    if (page === "form") {
      formPage.style.display = "block";
      ticketsPage.style.display = "none";
      navForm.classList.add("active");
      navTickets.classList.remove("active");
    } else {
      formPage.style.display = "none";
      ticketsPage.style.display = "block";
      navTickets.classList.add("active");
      navForm.classList.remove("active");
      renderTickets();
    }
  }

  function openModal(modal) { modal.style.display = "flex"; }
  function closeModal(modal) { modal.style.display = "none"; }

  function showAlert(msg) {
    alertMessage.textContent = msg;
    openModal(alertModal);
    alertOkBtn.onclick = () => closeModal(alertModal);
  }

  successCloseBtn.addEventListener("click", () => closeModal(successModal));

  navForm.addEventListener("click", e => { e.preventDefault(); showPage("form"); });
  navTickets.addEventListener("click", e => { e.preventDefault(); showPage("tickets"); });

  function renderTickets() {
    ticketsBody.innerHTML = "";
    const icons = { info: "ℹ️", download: "⬇️", phone: "📞", email: "✉️", edit: "✏️", delete: "🗑️" };

    tickets.forEach((ticket, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ticket.id}</td>
        <td><strong>${ticket.fullName}</strong><span>${ticket.email || ticket.phone || ""}</span></td>
        <td><strong>${ticket.subject}</strong><span>${ticket.message.length > 30 ? ticket.message.slice(0,30) + '…' : ticket.message}</span></td>
        <td>${ticket.date}</td>
        <td>
          <button class="info">${icons.info}</button>
          <button class="download">${icons.download}</button>
          <button class="call">${icons.phone}</button>
          <button class="email">${icons.email}</button>
          <button class="edit">${icons.edit}</button>
          <button class="delete">${icons.delete}</button>
        </td>
      `;
      ticketsBody.appendChild(tr);

      // Actions
      tr.querySelector(".info").addEventListener("click", () => {
        infoBody.innerHTML = `
          <p><strong>Name:</strong> ${ticket.fullName}</p>
          <p><strong>Email:</strong> ${ticket.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${ticket.phone || "N/A"}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Message:</strong> ${ticket.message}</p>
        `;
        openModal(infoModal);
      });

      tr.querySelector(".call").addEventListener("click", () => ticket.phone ? window.location.href = `tel:${ticket.phone}` : showAlert("No phone number available."));
      tr.querySelector(".email").addEventListener("click", () => ticket.email ? window.location.href = `mailto:${ticket.email}?subject=${encodeURIComponent(ticket.subject)}` : showAlert("No email available."));

      tr.querySelector(".edit").addEventListener("click", () => {
        editForm.fullName.value = ticket.fullName;
        editForm.email.value = ticket.email || "";
        editForm.phone.value = ticket.phone || "";
        editForm.subject.value = ticket.subject;
        editForm.message.value = ticket.message;

        tickets.splice(index, 1);
        showPage("form");

        editForm.onsubmit = e => {
          e.preventDefault();
          let validEdit = true;
          editForm.querySelectorAll("input, textarea").forEach(input => {
            if (!validateInput(input)) validEdit = false;
          });
          if (!validEdit) return;

          ticket.fullName = editForm.fullName.value.trim();
          ticket.email = editForm.email.value.trim();
          ticket.phone = editForm.phone.value.trim();
          ticket.subject = editForm.subject.value.trim();
          ticket.message = editForm.message.value.trim();

          tickets.push(ticket);
          renderTickets();
        };
      });

      tr.querySelector(".delete").addEventListener("click", () => {
        openModal(confirmModal);
        confirmYesBtn.onclick = () => {
          tickets.splice(index, 1);
          closeModal(confirmModal);
          renderTickets();
        };
      });

    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    let valid = true;
    form.querySelectorAll("input, textarea").forEach(input => {
      if (!validateInput(input)) valid = false;
    });
    const files = [...form.attachment.files];
    const { valid: validFiles, message } = validateAttachments(files);
    if (!validFiles) { showAlert(message); return; }
    if (!valid) return;

    const newTicket = {
      id: ticketCounter++,
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      attachments: files.map(f => ({ name: f.name, type: f.type })),
      date: new Date().toISOString().replace("T", " ").slice(0,19)
    };

    tickets.push(newTicket);
    form.reset();
    showPage("tickets");
    renderTickets();
    openModal(successModal);
  });

  showPage("form");
  renderTickets();
});
