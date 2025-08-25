//  Local storage
function encrypt(data) {
  return btoa(JSON.stringify(data));
}
function decrypt(data) {
  return JSON.parse(atob(data));
}

function saveTickets(tickets) {
  localStorage.setItem("tickets", encrypt(tickets));
}
function getTickets() {
  const raw = localStorage.getItem("tickets");
  if (!raw) return [];

  try {
    return decrypt(raw);
  } catch (e) {
    console.warn("Failed to decode tickets, clearing corrupted data:", e);
    localStorage.removeItem("tickets"); 
    return [];
  }
}
