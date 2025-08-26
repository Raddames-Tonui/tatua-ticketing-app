document.getElementById("sort").addEventListener("click", () => {
  showModal({
    title: "Sort Tickets",
    body: `<div id="sort-body" class="sort-body"></div>
           <button id="add-sorter-btn" style="margin-top:10px; color:#3b82f6; background:none; border:none; cursor:pointer;">+ Add Sorter</button>`,
    footer: `
      <button id="reset-sort" class="cancel">Reset Sorting</button>
      <button id="submit-sort" class="success-modal-close-btn">Submit</button>
    `
  });

  const sortBody = document.getElementById("sort-body");
  const addBtn = document.getElementById("add-sorter-btn");

  // Match your actual data structure
  const columns = [
    { key: "fullName", label: "Raised By" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "subject", label: "Subject" },
    { key: "date", label: "Date Created" }
  ];

  function addSorterRow() {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "8px";
    row.style.marginBottom = "8px";

    row.innerHTML = `
      <select class="sort-column" style="flex:1; padding:6px;">
        <option value="">Select Column</option>
        ${columns.map(c => `<option value="${c.key}">${c.label}</option>`).join("")}
      </select>
      <select class="sort-order" style="flex:1; padding:6px;">
        <option value="">Select Order</option>
        <option value="asc">Ascending</option>
        <option value="desc">Descending</option>
      </select>
      <button class="delete-sorter" style="border:none;background:none;cursor:pointer;color:#a00;">🗑</button>
    `;

    row.querySelector(".delete-sorter").addEventListener("click", () => row.remove());
    sortBody.appendChild(row);
  }

  addBtn.addEventListener("click", addSorterRow);

  document.getElementById("reset-sort").addEventListener("click", () => {
    sortBody.innerHTML = "";
  });

  document.getElementById("submit-sort").addEventListener("click", () => {
    const sorters = [...sortBody.querySelectorAll("div")].map(row => ({
      column: row.querySelector(".sort-column").value,
      order: row.querySelector(".sort-order").value
    })).filter(s => s.column && s.order);

    console.log("Applied Sorters:", sorters);

    const tickets = storage.get();
    const sorted = applySorting(tickets, sorters);
    renderTickets(sorted);

    closeModal();
  });

  addSorterRow(); // start with one row
});

function applySorting(tickets, sorters) {
  return [...tickets].sort((a, b) => {
    for (const sorter of sorters) {
      const { column, order } = sorter;
      let valA = a[column];
      let valB = b[column];

      if (valA === undefined || valB === undefined) continue;

      // Normalize per column
      switch (column) {
        case "fullName":
        case "subject":
        case "email":
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
          break;
        case "phone":
          valA = String(valA).replace(/\D/g, "");
          valB = String(valB).replace(/\D/g, "");
          break;
        case "date":
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
          break;
        default:
          valA = String(valA);
          valB = String(valB);
      }

      if (valA < valB) return order === "asc" ? -1 : 1;
      if (valA > valB) return order === "asc" ? 1 : -1;
    }
    return 0;
  });
}
