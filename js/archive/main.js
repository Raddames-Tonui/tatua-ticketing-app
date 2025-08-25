// Wait until the DOM content is fully loaded before executing the code
// This ensures all DOM elements are accessible and ready for manipulation
document.addEventListener("DOMContentLoaded", () => {

  // Determine if the app is in "local" mode based on the current URL
  // If the URL contains "/local/", use localStorage; otherwise, use sessionStorage
  const url = window.location.href;
  const isLocal = url.includes("/local/");

  // ===========================
  // STORAGE HELPERS
  // ===========================
  // The `storage` object provides an abstraction for saving and retrieving tickets
  // It automatically chooses between localStorage and sessionStorage based on `isLocal`
  const storage = {
    /**
     * save(tickets)
     * Logic: Save the provided array of tickets to storage.
     * - If local, encode the JSON string in Base64 before saving.
     * - If session, save plain JSON string.
     * - This allows secure localStorage without exposing raw JSON.
     */
    save: (tickets) => {
      if (isLocal) {
        localStorage.setItem("tickets", btoa(JSON.stringify(tickets)));
      } else {
        sessionStorage.setItem("tickets", JSON.stringify(tickets));
      }
    },

    /**
     * get()
     * Logic: Retrieve tickets from storage.
     * - If local storage, decode Base64 string and parse JSON.
     * - If corrupted (invalid JSON), clear local storage and return empty array.
     * - If session storage, parse JSON or return empty array if not set.
     */
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

  // ===========================
  // FORM PAGE LOGIC
  // ===========================
  // Initialize form-related variables
  const form = document.getElementById("ticket-form");
  let selectedFiles = []; // Stores files temporarily before form submission
  let attachmentInput, selectedFilesContainer;

  if (form) {
    // Get DOM elements for attachment input and container for selected files
    attachmentInput = document.getElementById("attachment");
    selectedFilesContainer = form.querySelector(".selected-files");

    // ===========================
    // INPUT VALIDATION FUNCTION
    // ===========================
    /**
     * validateInput(input)
     * Logic: Validates a single form input.
     * - Handles required fields and optional fields.
     * - Adds CSS classes `valid` or `invalid` for visual feedback.
     * - Shows error messages if input is invalid.
     * - Supports custom validation rules:
     *    - fullName: minimum 3 characters
     *    - phone: must match Kenyan phone regex
     * - Returns true if valid, false otherwise.
     */
    const validateInput = (input) => {
      const wrapper = input.closest(".input-wrapper"); // Locate wrapper for indicator
      const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null; // Small icon feedback
      const error = input.closest(".form-group").querySelector(".error-message"); // Error message element

      // ----------------------
      // EMPTY FIELD CHECK
      // ----------------------
      if (!input.value.trim()) {
        if (input.required) {
          // Required field is empty -> mark invalid
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
          // Optional field empty -> reset styles
          input.classList.remove("invalid", "valid");
          if (indicator) indicator.style.display = "none";
          if (error) {
            error.innerText = "";
            error.style.display = "none";
          }
          return true;
        }
      }

      // ----------------------
      // CUSTOM VALIDATION
      // ----------------------
      let customValid = true;
      let customMessage = "";

      if (input.name === "fullName") {
        // Name must have at least 3 characters
        if (input.value.trim().length < 3) {
          customValid = false;
          customMessage = "Name must have at least 3 characters";
        }
      } else if (input.name === "phone") {
        // Kenyan phone number validation (+254, 07, 01)
        const val = input.value.trim();
        const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/;
        if (!regex.test(val)) {
          customValid = false;
          customMessage = "Phone must start with +254, 07, or 01 and be valid length";
        }
      }

      // ----------------------
      // FINAL VALIDATION CHECK
      // ----------------------
      if (input.checkValidity() && customValid) {
        // Input is valid -> update UI
        input.classList.remove("invalid");
        input.classList.add("valid");
        if (indicator) indicator.style.display = "inline";
        if (error) {
          error.innerText = "";
          error.style.display = "none";
        }
        return true;
      } else {
        // Input invalid -> show custom or default message
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

    // ---------------------------
    // STANDARD INPUT EVENTS
    // ---------------------------
    // For all standard inputs (not radio/checkbox):
    // - validate on typing (input)
    // - validate on leaving the field (blur)
    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (input.type !== "radio" && input.type !== "checkbox") {
        input.addEventListener("input", () => validateInput(input));
        input.addEventListener("blur", () => validateInput(input));
      }
    });

    // ---------------------------
    // RADIO BUTTONS HANDLER
    // ---------------------------
    // Clear error message when a radio option is selected
    const radios = form.querySelectorAll("input[type='radio'][name='preferredContact']");
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        const error = radios[0].closest(".form-group").querySelector(".error-message");
        error.innerText = "";
        error.style.display = "none";
      });
    });

    // ---------------------------
    // TERMS CHECKBOX HANDLER
    // ---------------------------
    // Clear error message when terms checkbox is checked
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

    // ---------------------------
    // ATTACHMENTS HANDLER
    // ---------------------------
    /**
     * Logic:
     * - Validate files for type and size using validateAttachments()
     * - If invalid, show error and reset input
     * - If valid, add files to `selectedFiles` array and render them
     */
    attachmentInput.addEventListener("change", () => {
      const newFiles = Array.from(attachmentInput.files);
      const { valid, message } = validateAttachments(newFiles);

      const error = attachmentInput.closest(".form-group").querySelector(".error-message");

      if (!valid) {
        error.innerText = message;
        error.style.display = "block";
        attachmentInput.value = ""; // Reset input for invalid files
        return;
      } else {
        error.innerText = "";
        error.style.display = "none";
      }

      // Append valid files to selectedFiles array
      selectedFiles = selectedFiles.concat(newFiles);
      renderSelectedFiles(selectedFilesContainer); // Update file list UI
    });

    // ---------------------------
    // RENDER ATTACHMENTS FUNCTION
    // ---------------------------
    /**
     * renderSelectedFiles(container)
     * Logic:
     * - Clears the container and renders the current selectedFiles array
     * - Adds a "Remove" button to each file
     * - Clicking "Remove" deletes the file from selectedFiles array and re-renders
     */
    function renderSelectedFiles(container) {
      container.innerHTML = ""; // Clear previous files
      selectedFiles.forEach((file, index) => {
        const div = document.createElement("div");
        div.className = "selected-file";
        div.innerHTML = `
          <span class="file-name">${file.name}</span>
          <button type="button" data-index="${index}" class="remove-file-btn">Remove</button>
        `;
        container.appendChild(div);
      });

      // Add remove button functionality
      container.querySelectorAll(".remove-file-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
          const idx = parseInt(e.target.dataset.index);
          selectedFiles.splice(idx, 1); // Remove file from array
          renderSelectedFiles(container); // Re-render UI
        });
      });
    }

    // ---------------------------
    // FORM SUBMISSION HANDLER
    // ---------------------------
    /**
     * Logic:
     * - Prevent default form submission
     * - Validate all inputs (standard, radio, checkbox)
     * - If invalid, stop submission
     * - Build ticket object with form data and selected files
     * - Save to storage
     * - Reset form, clear selected files, and show success modal
     */
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      let isValid = true;

      // Validate all standard inputs
      form.querySelectorAll("input, select, textarea").forEach(input => {
        if (input.type !== "radio" && input.type !== "checkbox") {
          const fieldValid = validateInput(input);
          if (!fieldValid) isValid = false;
        }
      });

      // Validate radio buttons
      if (radios.length && ![...radios].some(r => r.checked)) {
        const error = radios[0].closest(".form-group").querySelector(".error-message");
        error.innerText = "Please select an option";
        error.style.display = "block";
        isValid = false;
      }

      if (form.message.value.length > 250) {
        alert("Message cannot exceed 250 characters");
        return false;
      }


      // Validate checkbox
      if (checkbox && checkbox.required && !checkbox.checked) {
        const error = checkbox.closest(".form-group").querySelector(".error-message");
        error.innerText = "You must accept terms";
        error.style.display = "block";
        isValid = false;
      }

      if (!isValid) return; // Stop submission if invalid

      // Build ticket object from form
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

      // Save ticket
      storage.save([...storage.get(), ticket]);

      // Reset form and UI
      form.reset();
      selectedFiles = [];
      renderSelectedFiles(selectedFilesContainer);
      showSuccessModal(); // Show success message
    });

    // ---------------------------
    // SUCCESS MODAL HANDLER
    // ---------------------------
    const successModal = document.getElementById("success-modal");
    const closeModalBtn = document.getElementById("close-modal");

    function showSuccessModal() {
      successModal.classList.remove("hidden");
    }

    function hideSuccessModal() {
      successModal.classList.add("hidden");
    }

    closeModalBtn.addEventListener("click", hideSuccessModal);

    // ---------------------------
    // ATTACHMENT VALIDATION FUNCTION
    // ---------------------------
    /**
     * validateAttachments(files)
     * Logic:
     * - Check each file for allowed types (JPG, JPEG, PDF)
     * - Check file size (max 3MB)
     * - Return { valid: boolean, message: string } for feedback
     */
    function validateAttachments(files) {
      const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
      const maxSize = 3 * 1024 * 1024; // 3MB
      let valid = true;
      let message = "";

      for (let file of files) {
        if (!allowedTypes.includes(file.type)) {
          valid = false;
          message = `Invalid file type: ${file.name}. Only JPG, JPEG, PDF allowed.`;
          break;
        }
        if (file.size > maxSize) {
          valid = false;
          message = `File too large: ${file.name}. Max 3 MB allowed.`;
          break;
        }
      }

      return { valid, message };
    }

    // ---------------------------
    // FORM RESET HANDLER
    // ---------------------------
    /**
     * Logic:
     * - Clear selectedFiles array
     * - Re-render empty attachment list
     * - Clear all validation messages, invalid/valid classes, and indicators
     */
    form.addEventListener("reset", () => {
      selectedFiles = [];
      renderSelectedFiles(selectedFilesContainer);
      form.querySelectorAll(".error-message").forEach(el => el.innerText = "");
      form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
      form.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
      form.querySelectorAll(".input-indicator").forEach(ind => ind.innerText = "");
    });
  }

  // ===========================
  // TICKETS PAGE LOGIC
  // ===========================
  const ticketsBody = document.getElementById("tickets-body");
  if (ticketsBody) {
    /**
     * renderTickets()
     * Logic:
     * - Clears the tickets table body
     * - Fetches tickets from storage
     * - Builds table rows dynamically with ticket data
     * - Adds action buttons (info, download, call, email, edit, delete)
     * - Handles delete action: removes ticket from storage and re-renders table
     */
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

      // Delete button logic
      ticketsBody.querySelectorAll(".delete").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.dataset.index);
          const tickets = storage.get();
          tickets.splice(idx, 1); // Remove ticket
          storage.save(tickets);
          renderTickets(); // Re-render table
        });
      });
    }

    renderTickets(); // Initial render

    // Refresh button re-renders tickets
    const refreshBtn = document.querySelector(".refresh");
    refreshBtn?.addEventListener("click", renderTickets);
  }
});
