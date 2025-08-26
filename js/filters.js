// filters.js — replace current file with this
document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.getElementById("filter");
  if (!filterBtn) return;

  // Capture original renderer and storage.get
  const originalRender = window.renderTickets;
  const originalStorageGet = window.storage && window.storage.get;

  // Utility: parse filters from URL
  function parseFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("filters")) return [];
    return params.get("filters").split(",").map(rule => {
      const [col, rel, ...rest] = rule.split(":");
      const val = rest.join(":"); // support colons in value
      return { column: col, relation: rel, value: decodeURIComponent(val) };
    });
  }

  // Utility: parse sort from URL
  function parseSortFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("sortBy")) return [];
    return params.get("sortBy").split(",").map(r => {
      const [column, order] = r.split(":");
      return { column, order };
    });
  }

  // Apply filtering rules to a tickets array
  function applyFilteringLocal(tickets, rules) {
    if (!rules || rules.length === 0) return tickets;
    return tickets.filter(ticket =>
      rules.every(f => {
        const fieldRaw = ticket[f.column];
        const val = (fieldRaw == null ? "" : String(fieldRaw)).toLowerCase();
        const filterVal = String(f.value || "").toLowerCase();
        switch (f.relation) {
          case "equals": return val === filterVal;
          case "contains": return val.includes(filterVal);
          case "starts": return val.startsWith(filterVal);
          case "ends": return val.endsWith(filterVal);
          default: return true;
        }
      })
    );
  }

  // Apply sorting rules to a tickets array
  function applySortingLocal(tickets, rules) {
    if (!rules || rules.length === 0) return tickets;
    return [...tickets].sort((a, b) => {
      for (const r of rules) {
        let va = a[r.column];
        let vb = b[r.column];

        // normalize
        if (r.column === "date") {
          va = va ? new Date(va).getTime() : -Infinity;
          vb = vb ? new Date(vb).getTime() : -Infinity;
        } else {
          va = (va == null ? "" : String(va)).toLowerCase();
          vb = (vb == null ? "" : String(vb)).toLowerCase();
        }

        if (va < vb) return r.order === "asc" ? -1 : 1;
        if (va > vb) return r.order === "asc" ? 1 : -1;
        // else continue to next rule
      }
      return 0;
    });
  }

  // Replace storage.get temporarily, call originalRender, restore storage.get
  function renderWithFilteredSorted(ticketsArray) {
    if (!window.storage || typeof originalRender !== "function") {
      // fallback — call originalRender if present
      if (typeof originalRender === "function") {
        originalRender();
      }
      return;
    }
    const realGet = window.storage.get;
    try {
      window.storage.get = () => ticketsArray;
      originalRender();
    } finally {
      window.storage.get = realGet;
    }
  }

  // Re-render based on current URL params
  function reRenderFromParams() {
    const all = typeof originalStorageGet === "function" ? originalStorageGet() : (window.storage ? window.storage.get() : []);
    const filters = parseFiltersFromURL();
    const sorts = parseSortFromURL();
    const filtered = applyFilteringLocal(all, filters);
    const sorted = applySortingLocal(filtered, sorts);
    renderWithFilteredSorted(sorted);
  }

  // Listen to popstate so back/forward updates
  window.addEventListener("popstate", reRenderFromParams);

  // Build UI inside modal and wire up submit/reset
  filterBtn.addEventListener("click", () => {
    showModal({
      title: "Filter Table",
      body: `
        <div id="filter-body" class="filter-body"></div>
        <button id="add-filter-btn" style="margin-top:10px; background:none; border:none; cursor:pointer">➕ Add Filter</button>
      `,
      footer: `
        <button id="reset-filter" class="cancel">Reset Filter</button>
        <button id="submit-filter" class="success-modal-close-btn">Submit</button>
      `
    });

    const filterBody = document.getElementById("filter-body");
    const addBtn = document.getElementById("add-filter-btn");

    function addFilterRow(col = "", rel = "contains", val = "") {
      const row = document.createElement("div");
      row.className = "filter-row";
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "8px";
      row.style.marginBottom = "8px";

      row.innerHTML = `
        <select class="filter-column" style="flex:1; padding:6px;">
          <option value="">Select Column</option>
          <option value="fullName" ${col==="fullName"?"selected":""}>Name</option>
          <option value="email" ${col==="email"?"selected":""}>Email</option>
          <option value="phone" ${col==="phone"?"selected":""}>Phone</option>
          <option value="subject" ${col==="subject"?"selected":""}>Subject</option>
          <option value="message" ${col==="message"?"selected":""}>Message</option>
          <option value="date" ${col==="date"?"selected":""}>Date</option>
        </select>
        <select class="filter-relation" style="flex:1; padding:6px;">
          <option value="equals" ${rel==="equals"?"selected":""}>Equals</option>
          <option value="contains" ${rel==="contains"?"selected":""}>Contains</option>
          <option value="starts" ${rel==="starts"?"selected":""}>Starts With</option>
          <option value="ends" ${rel==="ends"?"selected":""}>Ends With</option>
        </select>
        <input type="text" class="filter-value" placeholder="Enter Value" value="${val}" style="flex:1; padding:6px;" />
        <button class="delete-filter" style="border:none;background:none;cursor:pointer;">🗑</button>
      `;

      row.querySelector(".delete-filter").addEventListener("click", () => row.remove());
      filterBody.appendChild(row);
    }

    addBtn.addEventListener("click", () => addFilterRow());

    // Preload filters from URL
    const existingFilters = parseFiltersFromURL();
    if (existingFilters.length) {
      filterBody.innerHTML = "";
      existingFilters.forEach(f => addFilterRow(f.column, f.relation, f.value));
    } else {
      addFilterRow();
    }

    // Reset action — clear URL filters and re-render
    document.getElementById("reset-filter").addEventListener("click", () => {
      filterBody.innerHTML = "";
      const newParams = new URLSearchParams(window.location.search);
      newParams.delete("filters");
      // keep other params (like sortBy)
      const qs = newParams.toString();
      window.history.pushState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
      reRenderFromParams();
      // close modal if your closeModal supports no-args; otherwise hide universal modal
      try { closeModal(); } catch (e) {
        const um = document.getElementById("universal-modal"); if (um) um.style.display = "none";
      }
    });

    // Submit action — write filters into URL and re-render (keeping other params)
    document.getElementById("submit-filter").addEventListener("click", () => {
      const rows = [...filterBody.querySelectorAll(".filter-row")];
      const filters = rows.map(row => {
        const col = row.querySelector(".filter-column").value;
        const rel = row.querySelector(".filter-relation").value;
        const val = row.querySelector(".filter-value").value.trim();
        return col && rel && val ? `${col}:${rel}:${encodeURIComponent(val)}` : null;
      }).filter(Boolean);

      const newParams = new URLSearchParams(window.location.search);
      if (filters.length) newParams.set("filters", filters.join(","));
      else newParams.delete("filters");

      const qs = newParams.toString();
      window.history.pushState({}, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);

      reRenderFromParams();

      try { closeModal(); } catch (e) {
        const um = document.getElementById("universal-modal"); if (um) um.style.display = "none";
      }
    });

  }); // end filterBtn click listener

  // Initial run once on load so query params present on page load take effect
  reRenderFromParams();
});
