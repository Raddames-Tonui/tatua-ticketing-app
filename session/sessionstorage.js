// Session Storage

function getTickets(){
  return JSON.parse(sessionStorage.getItem("tickets")) || [];
}

function saveTickets(tickets) {
  sessionStorage.setItem("tickets", JSON.stringify(tickets));
}