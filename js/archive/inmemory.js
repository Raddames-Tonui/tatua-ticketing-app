document.querySelectorAll('.nav-link').forEach(link => {
    if  (link.href === window.location.href) {
        link.classList.add('active')
    }
})

let tickets = [];
let ticketCounter = 1;

const formPage = document.getElementById("form-page");
const ticketsPage = document.getElementById("tickets-page");
const form = document.getElementById("ticket-form");
const ticketsBody = document.getElementById("tickets-body");

const navForm = document.getElementById("nav-form");
const navTickets = document.getElementById("nav-tickets");

// toggle function
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

// render table
function renderTickets() {
  ticketsBody.innerHTML = "";
  tickets.forEach(ticket => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ticket-id">${ticket.id}</td>
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
          <button class="icon-btn delete" title="Delete ticket">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;

    ticketsBody.appendChild(tr);
  });
}

form.addEventListener("submit", function (e) {
  e.preventDefault(); 

  const newTicket = {
    id: ticketCounter++,
    fullName: form.fullName.value,
    email: form.email.value,
    phone: form.phone.value,
    subject: form.subject.value,
    message: form.message.value,
    date: new Date().toLocaleString()
  };

  tickets.push(newTicket);
  form.reset();
  showPage("tickets");
});


ticketsBody.addEventListener("click", function (e) {
  if (e.target.closest(".delete")) {
    const id = Number(e.target.closest(".delete").dataset.id);
    tickets = tickets.filter(t => t.id !== id);
    renderTickets();
  }
});


navForm.addEventListener("click", e => {
  e.preventDefault();
  showPage("form");fbh
});
navTickets.addEventListener("click", e => {
  e.preventDefault();
  showPage("tickets");
});



// Refresh button click = reload page
document.addEventListener("DOMContentLoaded", () => {
  const refreshBtn = document.querySelector(".refresh");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      window.location.reload();
    });
  }

  renderTickets();
});
