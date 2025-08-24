// app.js
document.addEventListener("DOMContentLoaded", () => {
  const content = document.getElementById("content");
  const navLinks = document.querySelectorAll("[data-page]");

  // Load a page into the content div
  function loadPage(page) {
    fetch(`${page}.html`)
      .then(res => res.text())
      .then(html => {
        content.innerHTML = html;
        localStorage.setItem("activePage", page); // persist state
      })
      .catch(() => {
        content.innerHTML = "<p>Page not found.</p>";
      });
  }

  // Handle navigation clicks
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      loadPage(page);
    });
  });

  // On refresh/load → restore last visited page
  const savedPage = localStorage.getItem("activePage");
  if (savedPage) {
    loadPage(savedPage);
  } else {
    loadPage("home"); // default page
  }
});


(() => {
  // --- Active Navlink ---
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.href === window.location.href) link.classList.add('active');
  });

  // --- Storage Strategies ---
  let inMemoryTickets = [];

  const storageStrategies = {
    inmemory: {
      get: () => inMemoryTickets,
      save: (tickets) => { inMemoryTickets = tickets; },
      init: renderTickets
    },
    local: {
      get: () => JSON.parse(localStorage.getItem("tickets")) || [],
      save: (tickets) => localStorage.setItem("tickets", JSON.stringify(tickets)),
      init: renderTickets
    },
    session: {
      get: () => JSON.parse(sessionStorage.getItem("tickets")) || [],
      save: (tickets) => sessionStorage.setItem("tickets", JSON.stringify(tickets)),
      init: renderTickets
    }
  };

  let currentStrategy = storageStrategies.inmemory;

  function setStorage(type) {
    currentStrategy = storageStrategies[type] || storageStrategies.inmemory;
    // If switching *to* inmemory on tickets.html, it will just show empty (expected).
  }

  // --- ID helper (stable across reloads for local/session) ---
  function nextId(tickets) {
    return tickets.length ? Math.max(...tickets.map(t => Number(t.id) || 0)) + 1 : 1;
  }

  // --- Render table (shared) ---
  function renderTickets() {
    const tbody = document.getElementById("tickets-body");
    if (!tbody) return;

    const tickets = currentStrategy.get();
    tbody.innerHTML = "";

    tickets.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td class="ticket-id">${t.id}</td>
        <td>${t.fullName}<br><span class="email">${t.email || t.phone || ""}</span></td>
        <td><strong>${t.subject || ""}</strong> ${t.message || ""}</td>
        <td>${t.date || ""}</td>
        <td>
          <div class="actions">
            <button class="icon-btn delete" data-id="${t.id}" title="Delete ticket">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Delegate delete
    tbody.querySelectorAll(".delete").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const id = Number(e.currentTarget.dataset.id);
        const updated = currentStrategy.get().filter(t => t.id !== id);
        currentStrategy.save(updated);
        renderTickets();
      });
    });
  }

  // --- Optional: two-panel toggle only if both panels exist (index) ---
  function showPage(page) {
    const formPage = document.getElementById("form-page");
    const ticketsPage = document.getElementById("tickets-page");
    const navForm = document.getElementById("nav-form");
    const navTickets = document.getElementById("nav-tickets");
    if (!formPage || !ticketsPage) return; // not on index

    if (page === "form") {
      formPage.style.display = "block";
      ticketsPage.style.display = "none";
      navForm?.classList.add("active");
      navTickets?.classList.remove("active");
    } else {
      formPage.style.display = "none";
      ticketsPage.style.display = "block";
      navTickets?.classList.add("active");
      navForm?.classList.remove("active");
      renderTickets();
    }
  }

  // --- Bootstrap for both pages ---
  document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("storage-selector");
    const hasForm = !!document.getElementById("ticket-form");
    const hasTicketsTable = !!document.getElementById("tickets-body");

    // Decide initial storage type:
    // - If selector exists (index): use saved or selector value (default inmemory).
    // - If no selector (tickets.html): use saved; if saved is 'inmemory', fall back to 'local'
    //   because in-memory data doesn't survive navigation.
    let savedType = localStorage.getItem("chosenStorage");
    if (selector) {
      const initial = savedType || selector.value || "inmemory";
      selector.value = initial;
      setStorage(initial);
    } else {
      let initial = savedType || "local";
      if (initial === "inmemory") initial = "local"; // sensible fallback on tickets.html
      setStorage(initial);
    }

    // Persist selection when changed (index only)
    if (selector) {
      selector.addEventListener("change", (e) => {
        const val = e.target.value;
        localStorage.setItem("chosenStorage", val);
        setStorage(val);
        renderTickets();
      });
    }

    // Form submission (index)
    const form = document.getElementById("ticket-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const fullName = form.fullName.value.trim();
        const email = form.email.value.trim();
        const phone = form.phone.value.trim();
        const subject = form.subject.value;
        const message = form.message.value.trim();
        if (!fullName || !email || !subject || !message) {
          alert("Please fill in all required fields.");
          return;
        }

        const tickets = currentStrategy.get();
        tickets.push({
          id: nextId(tickets),
          fullName, email, phone, subject, message,
          date: new Date().toLocaleString()
        });
        currentStrategy.save(tickets);
        renderTickets();
        form.reset();

        // If on the two-panel index page, switch to tickets panel in inmemory mode
        if (selector && selector.value === "inmemory") showPage("tickets");
      });
    }

    // Nav buttons on index (only if present)
    const navForm = document.getElementById("nav-form");
    const navTickets = document.getElementById("nav-tickets");
    if (navForm && navTickets) {
      navForm.addEventListener("click", (e) => { e.preventDefault(); showPage("form"); });
      navTickets.addEventListener("click", (e) => { e.preventDefault(); showPage("tickets"); });
    }

    // Refresh button (both pages)
    const refreshBtn = document.querySelector(".refresh");
    if (refreshBtn) refreshBtn.addEventListener("click", () => window.location.reload());

    // Initial render on both pages
    renderTickets();
  });
})();
