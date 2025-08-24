document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});


function getTickets() {
  return JSON.parse(localStorage.getItem("tickets")) || [];
}

function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}

function renderTickets() {
  const ticketsBody = document.getElementById("tickets-body");
  if (!ticketsBody) return;
  ticketsBody.innerHTML = "";

  const tickets = getTickets();

  tickets.forEach((ticket, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="ticket-id">${index + 1}</td>
      <td>
        ${ticket.fullName}<br>
        <span class="email">${ticket.email || ticket.phone}</span>
      </td>
      <td>
        <strong>${ticket.subject}</strong>
        ${ticket.message}
      </td>
      <td>${ticket.date}</td>
      <td>
        <div class="actions">
          <button class="icon-btn" title="Show details">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <button class="icon-btn" title="Download attachment">
            <i class="fa-solid fa-download"></i>
          </button>
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

  // Delete 
  document.querySelectorAll(".delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.currentTarget.dataset.index;
      deleteTicket(idx);
    });
  });
}

function deleteTicket(index) {
  const tickets = getTickets();
  tickets.splice(index, 1);
  saveTickets(tickets);
  renderTickets(); 
}

//  Form handling 
const form = document.getElementById("ticket-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const subject = document.getElementById("subject").value;
    const message = document.getElementById("message").value.trim();
    const preferredContact = document.querySelector("input[name='preferredContact']:checked").value;

    if (!fullName || !email || !subject || !message) {
      alert("Please fill in all required fields.");
      return;
    }

    const tickets = getTickets();  

    const ticket = {
      id: tickets.length + 1,
      fullName,
      email,
      phone,
      subject,
      message,
      preferredContact,
      date: new Date().toLocaleString()
    };

    tickets.push(ticket);
    saveTickets(tickets);
    renderTickets();

    e.target.reset();
  });
}


window.addEventListener("DOMContentLoaded", () => {
  renderTickets();
});

document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  renderTickets();
});
