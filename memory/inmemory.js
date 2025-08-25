// In memory

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
// render table
function renderTickets() {
  ticketsBody.innerHTML = "";
  tickets.forEach(ticket => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="ticket-id">
        <div class="cell-content">${ticket.id}</div>
      </td>
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
          <button class="icon-btn delete" data-id="${ticket.id}" title="Delete ticket">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    `;
    ticketsBody.appendChild(tr);
  });
}



//  Form submission
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  const files = form.attachment.files;
  let totalSize = 0;
  for (let file of files) {
    totalSize += file.size;
  }

  if (totalSize > 3 * 1024 * 1024){
    alert("Total file size cannot exceed 3 MB.")
    return;
  }

  const newTicket = {
    id : ticketCounter++,
    fullName : formData.get("fullName"),
    email : formData.get("email"),
    phone : formData.get("phone"),
    subject : formData.get("subject"),
    message : formData.get("message"),
    preferredContact: formData.get("preferredContact"),
    terms : formData.get("terms")? true : false,
    // attachment : formData.get("attachment")? formData.get("attachment").name : null,
    attachment : [...files].map(f => f.name),
    date: new Date().toISOString().replace("T", " ").slice(0,19)
  };

  tickets.push(newTicket);
  form.reset();
  showPage("tickets");
})


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


// Delete Ticket
ticketsBody.addEventListener("click", function(e){
  if (e.target.closest(".delete")){
    const id =Number(e.target.closest(".delete").dataset.id);
    tickets = tickets.filter(t => t.id !== id);
    renderTickets();
  }
})