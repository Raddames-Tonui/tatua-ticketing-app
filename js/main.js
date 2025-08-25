document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.href;
  const isLocal = url.includes("/local/");

  // ============================
  // Storage Helpers
  // ============================
  const storage = {
    save: (tickets) => {
      if (isLocal) localStorage.setItem("tickets", btoa(JSON.stringify(tickets)));
      else sessionStorage.setItem("tickets", JSON.stringify(tickets));
    },
    get: () => {
      if (isLocal) {
        const raw = localStorage.getItem("tickets");
        if (!raw) return [];
        try {
          return JSON.parse(atob(raw));
        } catch (e) {
          console.warn("Corrupted local tickets, clearing data:", e);
          localStorage.removeItem("tickets");
          return [];
        }
      } else {
        return JSON.parse(sessionStorage.getItem("tickets")) || [];
      }
    }
  };

  // ============================
  // FORM PAGE LOGIC
  // ============================
  const form = document.getElementById("ticket-form");
  let selectedFiles = [];
  let attachmentInput, selectedFilesContainer;

  if (form) {
    attachmentInput = document.getElementById("attachment");
    selectedFilesContainer = form.querySelector(".selected-files");

    // ============================
    // Validate Input
    // ============================
    const validateInput = (input) => {
      const wrapper = input.closest(".input-wrapper");
      const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
      const error = input.closest(".form-group").querySelector(".error-message");

      if (!input.value.trim()) {
        if (input.required) {
          input.classList.add("invalid");
          input.classList.remove("valid");
          if (indicator) {
            indicator.innerText = "🚫";
            indicator.style.display = "inline";
          }
          if (error) {
            error.innerText = "This field is required";
            error.style.display = "block";
          }
          return false;
        } else {
          input.classList.remove("invalid", "valid");
          if (indicator) indicator.style.display = "none";
          if (error) {
            error.innerText = "";
            error.style.display = "none";
          }
          return true;
        }
      }

      // Custom validations
      let customValid = true;
      let customMessage = "";

      if (input.name === "fullName") {
        if (input.value.trim().length < 3) {
          customValid = false;
          customMessage = "Name must have at least 3 characters";
        }
      } else if (input.name === "phone") {
        const val = input.value.trim();
        const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/;
        if (!regex.test(val)) {
          customValid = false;
          customMessage = "Phone must start with +254, 07, or 01 and be valid length";
        }
      }

      if (input.checkValidity() && customValid) {
        input.classList.remove("invalid");
        input.classList.add("valid");
        if (indicator) indicator.style.display = "inline";
        if (error) {
          error.innerText = "";
          error.style.display = "none";
        }
        return true;
      } else {
        input.classList.add("invalid");
        input.classList.remove("valid");
        if (indicator) {
          indicator.innerText = "🚫";
          indicator.style.display = "inline";
        }
        if (error) {
          error.innerText = customMessage || input.validationMessage || `Please provide a valid ${input.name}`;
          error.style.display = "block";
        }
        return false;
      }
    };

    // Standard inputs
    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (input.type !== "radio" && input.type !== "checkbox") {
        input.addEventListener("input", () => validateInput(input));
        input.addEventListener("blur", () => validateInput(input));
      }
    });

    // Radio buttons
    const radios = form.querySelectorAll("input[type='radio'][name='preferredContact']");
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        const error = radios[0].closest(".form-group").querySelector(".error-message");
        error.innerText = "";
        error.style.display = "none";
      });
    });

    // Terms checkbox
    const checkbox = form.querySelector("input[type='checkbox'][name='terms']");
    if (checkbox) {
      checkbox.addEventListener("change", () => {
        const error = checkbox.closest(".form-group").querySelector(".error-message");
        if (checkbox.checked) {
          error.innerText = "";
          error.style.display = "none";
        }
      });
    }

    // Attachments
    attachmentInput.addEventListener("change", () => {
      const newFiles = Array.from(attachmentInput.files);
      selectedFiles = selectedFiles.concat(newFiles);
      renderSelectedFiles(selectedFilesContainer);
    });

    function renderSelectedFiles(container) {
      container.innerHTML = "";
      selectedFiles.forEach((file, index) => {
        const div = document.createElement("div");
        div.className = "selected-file";
        div.innerHTML = `
          <span class="file-name">${file.name}</span>
          <button type="button" data-index="${index}" class="remove-file-btn">Remove</button>
        `;
        container.appendChild(div);
      });

      container.querySelectorAll(".remove-file-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = parseInt(e.target.dataset.index);
          selectedFiles.splice(idx, 1);
          renderSelectedFiles(container);
        });
      });
    }

    // Form submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      form.querySelectorAll("input, select, textarea").forEach(input => {
        if (input.type !== "radio" && input.type !== "checkbox") {
          const fieldValid = validateInput(input);
          if (!fieldValid) isValid = false;
        }
      });

      if (radios.length && ![...radios].some(r => r.checked)) {
        const error = radios[0].closest(".form-group").querySelector(".error-message");
        error.innerText = "Please select an option";
        error.style.display = "block";
        isValid = false;
      }

      if (checkbox && checkbox.required && !checkbox.checked) {
        const error = checkbox.closest(".form-group").querySelector(".error-message");
        error.innerText = "You must accept terms";
        error.style.display = "block";
        isValid = false;
      }

      if (!isValid) return;

      // Save ticket
      const ticket = {
        fullName: form.fullName.value.trim(),
        email: form.email.value.trim(),
        phone: form.phone.value.trim(),
        subject: form.subject.value,
        message: form.message.value.trim(),
        preferredContact: [...form.preferredContact].find(r => r.checked).value,
        attachments: selectedFiles.map(f => f.name),
        date: new Date()
      };

      storage.save([...storage.get(), ticket]);
      form.reset();
      selectedFiles = [];
      renderSelectedFiles(selectedFilesContainer);
      // alert("Ticket submitted successfully!");
      showSuccessModal();
    });

      // Success Modal
    const successModal = document.getElementById("success-modal");
    const closeModalBtn = document.getElementById("close-modal");

    function showSuccessModal() {
      successModal.classList.remove("hidden");
    }

    function hideSuccessModal() {
      successModal.classList.add("hidden");
    }

    closeModalBtn.addEventListener("click", hideSuccessModal);


    // Form reset
    form.addEventListener("reset", () => {
      selectedFiles = [];
      renderSelectedFiles(selectedFilesContainer);
      form.querySelectorAll(".error-message").forEach(el => el.innerText = "");
      form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
      form.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
    });
  }

  // ============================
  // TICKETS PAGE LOGIC
  // ============================
  const ticketsBody = document.getElementById("tickets-body");
  if (ticketsBody) {
    function renderTickets() {
      ticketsBody.innerHTML = "";
      const tickets = storage.get();
      tickets.forEach((ticket, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td class="ticket-id"><div class="cell-content">${index + 1}</div></td>
          <td>
            <strong>${ticket.fullName}</strong>
            <span class="email">${ticket.email || ticket.phone}</span>
          </td>
          <td class="ticket-message">
            <strong>${ticket.subject}</strong>
            <span class="truncate">${ticket.message}</span>
          </td>
          <td class="ticket-date">
            <div class="cell-content">${new Date(ticket.date).toLocaleString()}</div>
          </td>
          <td>
            <div class="actions">
              <button class="icon-btn" title="Show details">
                <i class="fa-solid fa-circle-info"></i>
              </button>
              ${ticket.attachments && ticket.attachments.length ? `
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
              <button class="icon-btn delete" title="Delete ticket" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        `;
        ticketsBody.appendChild(tr);
      });

      ticketsBody.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index);
          const tickets = storage.get();
          tickets.splice(idx, 1);
          storage.save(tickets);
          renderTickets();
        });
      });
    }

    renderTickets();

    // Refresh button
    const refreshBtn = document.querySelector(".refresh");
    refreshBtn?.addEventListener("click", renderTickets);
  }
});