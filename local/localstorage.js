//  Local storage

function getTickets() {
  return JSON.parse(localStorage.getItem("tickets") || []);
}

function saveTickets(tickets) {
  localStorage.setItem("tickets", JSON.stringify(tickets));
}