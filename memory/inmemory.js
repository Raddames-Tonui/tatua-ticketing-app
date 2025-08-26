document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  let tickets = [];
  let ticketCounter = 1;

  const formPage = document.getElementById("form-page");
  const ticketsPage = document.getElementById("tickets-page");
  const form = document.getElementById("ticket-form");
  const ticketsBody = document.getElementById("tickets-body");

  const navForm = document.getElementById("nav-form");
  const navTickets = document.getElementById("nav-tickets");


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

  function openModal(modal) {
    modal.style.display = "flex";
  }
  function closeModal(modal) {
    modal.style.display = "none";
  }

  const successModal = document.getElementById("success-modal");
  const successCloseBtn = document.getElementById("success-footer-close-btn");
  successCloseBtn.addEventListener("click", () => closeModal(successModal));


  
  const infoModal = document.querySelector(".info-modal");
  const editModal = document.querySelector(".edit-modal");
  const confirmModal = document.querySelector(".confirm-modal");
  const alertModal = document.querySelector(".alert-modal");

  const infoBody = infoModal.querySelector(".success-modal-body");
  const editForm = editModal.querySelector("#edit-form");
  const confirmYesBtn = confirmModal.querySelector(".confirm-yes");
  const alertMessage = alertModal.querySelector(".alert-message");
  const alertOkBtn = alertModal.querySelector(".ok");


    document.querySelectorAll(".success-close-btn, .close-modal").forEach(btn => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".success-modal-overlay");
      if (modal) closeModal(modal);
    });
  });


  document.querySelectorAll(".success-modal-overlay").forEach(m => {
    m.addEventListener("click", e => {
      if (e.target === m) closeModal(m);
    });
  });

  function showAlert(msg) {
    alertMessage.textContent = msg;
    openModal(alertModal);
  }
  alertOkBtn.addEventListener("click", () => closeModal(alertModal));

  function showTicketModal(ticket, index) {
    infoBody.innerHTML = `
      <div class="ticket-card">
          <h2 class="ticket-title">Ticket  ${index + 1}</h2>
          <div class="ticket-details">
          <p><strong>Name:</strong> ${ticket.fullName}</p>
          <p><strong>Email:</strong> ${ticket.email || "N/A"}</p>
          <p><strong>Phone:</strong> ${ticket.phone || "N/A"}</p>
          <p><strong>Subject:</strong> ${ticket.subject}</p>
          <p><strong>Message:</strong> ${ticket.message}</p>
          <p><strong>Date:</strong> ${new Date(ticket.date).toLocaleString()}</p>
          <p><strong>Attachments:</strong></p>
          <ul class="ticket-attachments">
            ${
              ticket.attachments && ticket.attachments.length > 0
                ? ticket.attachments.map(file => {
                    if (file.data && file.data.startsWith("data:image")) {
                      return `
                        <li class="attachment-item">
                          <a href="${file.data}" target="_blank" rel="noopener noreferrer">
                              <img src="${file.data}" alt="${file.name}" 
                                  class="attachment-img"/>
                            </a>
                        </li>`;
                    } else {
                      return `
                        <li class="attachment-item">
                          <a href="${file.data}" target="_blank" rel="noopener noreferrer" 
                            class="attachment-link">
                            ${file.name}
                          </a>
                        </li>`;
                    }
                  }).join("")
                : "<li class='attachment-item'>No attachments</li>"
            }
          </ul>
        </div>
      </div>
      `;

    openModal(infoModal);
  }


  function downloadAttachmentModal(ticket, index) {
  const icon = {
    download: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 13.333h9.334V12H3.333m9.334-6H10V2H6v4H3.333L8 10.667 12.667 6Z" fill="#444054"/></svg>`,
  }

  infoBody.innerHTML = `
    <div class="ticket-card">
        <h2 class="ticket-title">Ticket  ${index + 1}</h2>
        <ul class="ticket-attachments">
          ${
            ticket.attachments && ticket.attachments.length > 0
              ? ticket.attachments.map(file => {
                  if (file.data && file.data.startsWith("data:image")) {
                    return `
                      <li class="attachment-item">
                        <a href="${file.data}" target="_blank" rel="noopener noreferrer">
                          <img src="${file.data}" alt="${file.name}" class="attachment-img"/>
                        </a>
                          <a href="${file.data}" download="${file.name}" class="download-btn"> ${icon.download} Download</a>
                      </li>
                      `;
                  } else {
                    return `
                      <li class="attachment-item">
                        <a href="${file.data}" download="${file.name}" class="attachment-link">${file.name} </a>
                      </li>`;
                  }
                }).join("")
              : "<li class='attachment-item'>No attachments</li>"
          }
        </ul>
      </div>
    </div>
    `;

  openModal(infoModal);
  }

  function renderTickets() {
    ticketsBody.innerHTML = "";
      const icons = {
        info: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.33337 4.66665V5.99998H8.66671V4.66665H7.33337ZM9.33337 11.3333V9.99998H8.66671V7.33331H6.66671V8.66665H7.33337V9.99998H6.66671V11.3333H9.33337ZM14.6667 7.99998C14.6667 11.6666 11.6667 14.6666 8.00004 14.6666C4.33337 14.6666 1.33337 11.6666 1.33337 7.99998C1.33337 4.33331 4.33337 1.33331 8.00004 1.33331C11.6667 1.33331 14.6667 4.33331 14.6667 7.99998ZM13.3334 7.99998C13.3334 5.05331 10.9467 2.66665 8.00004 2.66665C5.05337 2.66665 2.66671 5.05331 2.66671 7.99998C2.66671 10.9466 5.05337 13.3333 8.00004 13.3333C10.9467 13.3333 13.3334 10.9466 13.3334 7.99998Z" fill="#444054"/>
              </svg>
              `,
        download: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.333 13.333h9.334V12H3.333m9.334-6H10V2H6v4H3.333L8 10.667 12.667 6Z" fill="#444054"/></svg>`,
        phone: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4.413 7.193C5.373 9.08 6.92 10.627 8.807 11.587l1.466-1.467c.187-.187.447-.24.68-.167.747.247 1.547.38 2.38.38.177 0 .347.07.472.195.125.125.195.295.195.472v2.333a.667.667 0 0 1-.667.667c-3.006 0-5.889-1.194-8.014-3.32C3.194 8.555 2 5.672 2 2.667c0-.177.07-.347.195-.472A.667.667 0 0 1 2.667 2H5c.177 0 .347.07.472.195.125.125.195.295.195.472 0 .833.133 1.633.38 2.38.073.233.02.493-.167.68L4.413 7.193Z" fill="#999"/></svg>`,
        email: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M14.667 3.667H6c-.733 0-1.333.6-1.333 1.333V11c0 .74.6 1.333 1.333 1.333h8.667c.74 0 1.333-.593 1.333-1.333V5c0-.733-.593-1.333-1.333-1.333ZM14.667 11H6V6.113l4.333 2.22 4.334-2.22V11ZM10.333 7.207 6 5h8.667l-4.334 2.207Z" fill="#444054"/></svg>`,
        edit: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.573 14.287 6 14.667l-2-1.334-2 1.334V2h12v4.8c-.42-.18-.907-.18-1.334.013V3.333H3.333v8.84L4 11.733l2 1.333.573-.4v1.62Zm1.334-.98 4.094-4.087 1.353 1.36L9.267 14.667H7.907v-1.36ZM14.473 9.46l-.653.653-1.36-1.36.653-.654c.114-.106.287-.113.414-.026.02.007.04.027.054.04l.88.88c.133.133.133.353 0 .567ZM11.333 6V4.667H4.667V6h6.666ZM10 8.667V7.333H4.667v1.334H10Z" fill="#444054"/></svg>`,
        delete: `<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 2v.667H2.667V4H3.333v8.667c0 .353.14.693.39.943.25.25.589.39.943.39h6.667c.353 0 .692-.14.942-.39.25-.25.39-.59.39-.943V4h.667V2.667H10V2H6ZM4.667 4h6.666v8.667H4.667V4Zm1.333 1.333v6h1.334v-6H6Zm2.667 0v6h1.333v-6H8.667Z" fill="#FF3B30"/></svg>`
      };

    tickets.forEach((ticket, index) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="ticket-id"><div class="cell-content">${ticket.id}</div></td>
        <td><strong>${ticket.fullName}</strong><span>${ticket.email || ticket.phone || ""}</span></td>
        <td><strong>${ticket.subject}</strong><span>${ticket.message.length > 30 ? ticket.message.slice(0,30) + '…' : ticket.message}</span></td>
        <td><div class="cell-content">${ticket.date}</div></td>
        <td>
          <div class="flex-cell">
            <button class="icon-btn info" title="Show details">${icons.info}</button>
            <button class="icon-btn download" title="Download">${icons.download}</button>
            <button class="icon-btn call" title="Call user">${icons.phone}</button>
            <button class="icon-btn email" title="Send email">${icons.email}</button>
            <button class="icon-btn edit" title="Edit ticket">${icons.edit}</button>
            <button class="icon-btn delete" title="Delete ticket">${icons.delete}</button>
          </div>
        </td>
      `;
      ticketsBody.appendChild(tr);

      // tr.querySelector('[title="Show details"]').addEventListener("click", () => showTicketModal(ticket, index));

      // tr.querySelector(".info").addEventListener("click", () => alert(JSON.stringify(ticket, null, 2)));
      // tr.querySelector(".call")?.addEventListener("click", () => {
      //   ticket.phone ? window.location.href = `tel:${ticket.phone}` : alert("No phone number available.");
      // });
      // tr.querySelector(".email")?.addEventListener("click", () => {
      //   ticket.email ? window.location.href = `mailto:${ticket.email}?subject=${encodeURIComponent(ticket.subject)}` : alert("No email available.");
      // });
      // tr.querySelector(".delete").addEventListener("click", () => {
      //   if (confirm("Delete this ticket?")) {
      //     tickets.splice(index, 1);
      //     renderTickets();
      //   }
      // });
      // tr.querySelector(".edit")?.addEventListener("click", () => {
      //   form.fullName.value = ticket.fullName;
      //   form.email.value = ticket.email;
      //   form.phone.value = ticket.phone;
      //   form.subject.value = ticket.subject;
      //   form.message.value = ticket.message;

      //   ticketCounter--; 
      //   tickets.splice(index, 1);

      //   showPage("form");
      // });
      
    tr.querySelector('[title="Show details"]').addEventListener("click", () => showTicketModal(ticket, index));
    tr.querySelector('[title = "Download"]').addEventListener("click", () => downloadAttachmentModal(ticket, index ))
    tr.querySelector('[title="Call user"]').addEventListener("click", () => {
      ticket.phone ? (window.location.href = `tel:${ticket.phone}`) : showAlert("No phone number available.");
    });

    tr.querySelector('[title="Send email"]').addEventListener("click", () => {
      ticket.email ? (window.location.href = `mailto:${ticket.email}?subject=${encodeURIComponent(ticket.subject)}`) : showAlert("No email available.");
    });

    tr.querySelector('[title="Edit ticket"]').addEventListener("click", () => {
      editForm.fullName.value = ticket.fullName;
      editForm.email.value = ticket.email || "";
      editForm.phone.value = ticket.phone || "";
      editForm.subject.value = ticket.subject;
      editForm.message.value = ticket.message;

      const editAttachments = document.getElementById("edit-attachments");
      editAttachments.innerHTML = ticket.attachments && ticket.attachments.length > 0
        ? ticket.attachments.map(file => {
            if (file.data && file.data.startsWith("data:image")) {
              return `
                <li class="attachment-item">
                  <a href="${file.data}" target="_blank" rel="noopener noreferrer">
                    <img src="${file.data}" alt="${file.name}" class="attachment-img"/>
                  </a>
                  <a href="${file.data}" download="${file.name}" class="download-link">⬇️</a>
                </li>`;
            } else {
              return `
                <li class="attachment-item">
                  <a href="${file.data}" target="_blank" rel="noopener noreferrer" class="attachment-link">
                    ${file.name}
                  </a>
                  <a href="${file.data}" download="${file.name}" class="download-link">⬇️</a>
                </li>`;
            }
          }).join("")
        : "<li class='attachment-item'>No attachments</li>";
      
        form.fullName.value = ticket.fullName;
        form.email.value = ticket.email;
        form.phone.value = ticket.phone;
        form.subject.value = ticket.subject;
        form.message.value = ticket.message;

        ticketCounter--; 
        tickets.splice(index, 1);
      
      // openModal(editModal);
      showPage("form");

      editForm.onsubmit = (e) => {
        e.preventDefault();
        if (!editForm.subject.value.trim() || !editForm.message.value.trim()) {
          showAlert("Subject and Message cannot be empty.");
          return;
        }

        ticket.fullName = editForm.fullName.value.trim();
        ticket.email = editForm.email.value.trim();
        ticket.phone = editForm.phone.value.trim();
        ticket.subject = editForm.subject.value.trim();
        ticket.message = editForm.message.value.trim();

        storage.save(tickets);
        closeModal(editModal);
        renderTickets();
      };
    });


    tr.querySelector(".delete").addEventListener("click", () => {
      openModal(confirmModal);
      confirmYesBtn.onclick = () => {
        tickets.splice(index, 1);
        storage.save(tickets);
        closeModal(confirmModal);
        renderTickets();
      };
    });

    });
  }

  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);

    const files = form.attachment.files;
    let totalSize = 0;
    for (let file of files) totalSize += file.size;
    if (totalSize > 3 * 1024 * 1024) {
      alert("Total file size cannot exceed 3 MB.");
      return;
    }

    const newTicket = {
      id: ticketCounter++,
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
      preferredContact: formData.get("preferredContact"),
      terms: formData.get("terms") ? true : false,
      attachment: [...files].map(f => f.name),
      date: new Date().toISOString().replace("T", " ").slice(0,19)
    };

    tickets.push(newTicket);
    form.reset();
    showPage("tickets");
    renderTickets();
    openModal(successModal);
  });

  navForm.addEventListener("click", e => {
    e.preventDefault(); showPage("form");
  });
  navTickets.addEventListener("click", e => {
    e.preventDefault(); showPage("tickets");
  });

  renderTickets();
});
