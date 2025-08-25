// Main.js

// ===== NAV ACTIVE LINK =====
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) {
    link.classList.add('active');
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.href;
  const isLocal = url.includes("/local/");

  // ===== STORAGE HELPERS =====
  const storage = {
    save: (tickets) => {
      if (isLocal) localStorage.setItem("tickets", btoa(JSON.stringify(tickets)));
      else sessionStorage.setItem("tickets", JSON.stringify(tickets));
    },
    get: () => {
      if (isLocal) {
        const raw = localStorage.getItem("tickets");
        if (!raw) return [];
        try { return JSON.parse(atob(raw)); }
        catch (e) { localStorage.removeItem("tickets"); return []; }
      } else return JSON.parse(sessionStorage.getItem("tickets")) || [];
    }
  };

  // ===== ELEMENTS =====
  const form = document.getElementById("ticket-form");
  const successModal = document.querySelector(".success-modal-overlay");
  const modalCloseButtons = document.querySelectorAll(".success-close-btn, .success-modal-close-btn");

  // Hide modal if already submitted
  if (sessionStorage.getItem("ticketSubmitted") === "true") {
    successModal.style.display = "none";
  }

  // ===== MODAL FUNCTIONS =====
  function showSuccessModal() {
    successModal.style.display = "flex";
    sessionStorage.setItem("ticketSubmitted", "true");
  }

  function hideSuccessModal() {
    successModal.style.display = "none";
  }

  modalCloseButtons.forEach(btn => btn.addEventListener("click", hideSuccessModal));

  if (!form) return;

  let selectedFiles = [];
  const attachmentInput = document.getElementById("attachment");
  const selectedFilesContainer = form.querySelector(".selected-files");

  // ===== INPUT VALIDATION =====
  const validateInput = (input) => {
    const wrapper = input.closest(".input-wrapper");
    const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
    const error = input.closest(".form-group").querySelector(".error-message");

    if (!input.value.trim()) {
      if (input.required) {
        input.classList.add("invalid");
        input.classList.remove("valid");
        if (indicator) { indicator.innerText = "🚫"; indicator.style.display = "inline"; }
        if (error) { error.innerText = "This field is required"; error.style.display = "block"; }
        return false;
      } else {
        input.classList.remove("invalid", "valid");
        if (indicator) indicator.style.display = "none";
        if (error) { error.innerText = ""; error.style.display = "none"; }
        return true;
      }
    }

    let customValid = true;
    let customMessage = "";

    if (input.name === "fullName" && input.value.trim().length < 3) {
      customValid = false; customMessage = "Name must have at least 3 characters";
    } else if (input.name === "phone") {
      const val = input.value.trim();
      const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/;
      if (!regex.test(val)) { customValid = false; customMessage = "Phone must start with +254, 07, or 01 and be valid length"; }
    }

    if (input.checkValidity() && customValid) {
      input.classList.remove("invalid"); input.classList.add("valid");
      if (indicator) indicator.style.display = "inline";
      if (error) { error.innerText = ""; error.style.display = "none"; }
      return true;
    } else {
      input.classList.add("invalid"); input.classList.remove("valid");
      if (indicator) { indicator.innerText = "🚫"; indicator.style.display = "inline"; }
      if (error) { error.innerText = customMessage || input.validationMessage || `Please provide a valid ${input.name}`; error.style.display = "block"; }
      return false;
    }
  };

  // ===== INPUT EVENT LISTENERS =====
  form.querySelectorAll("input, select, textarea").forEach(input => {
    if (!["radio","checkbox"].includes(input.type)) {
      input.addEventListener("input", () => {
        const wrapper = input.closest(".input-wrapper");
        const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
        const error = input.closest(".form-group").querySelector(".error-message");

        // Only remove 🚫 if the input is invalid
        if (input.classList.contains("invalid")) {
          const stillInvalid = !validateInput(input);
          if (stillInvalid) {
            if (indicator) indicator.style.display = "inline";
          } else {
            input.classList.remove("invalid");
            if (indicator) indicator.style.display = "none";
            if (error) { error.innerText = ""; error.style.display = "none"; }
          }
        }
      });

      input.addEventListener("blur", () => validateInput(input));
    }
  });

  // Radio buttons
  const radios = form.querySelectorAll("input[type='radio'][name='preferredContact']");
  radios.forEach(radio => radio.addEventListener("change", () => {
    const error = radios[0].closest(".form-group").querySelector(".error-message");
    error.innerText = ""; error.style.display = "none";
  }));

  // Terms checkbox
  const checkbox = form.querySelector("input[type='checkbox'][name='terms']");
  if (checkbox) {
    checkbox.addEventListener("change", () => {
      const error = checkbox.closest(".form-group").querySelector(".error-message");
      if (checkbox.checked) { error.innerText = ""; error.style.display = "none"; }
    });
  }

  // ===== ATTACHMENTS =====
  attachmentInput.addEventListener("change", () => {
    const newFiles = Array.from(attachmentInput.files);
    const { valid, message } = validateAttachments(newFiles);
    const error = attachmentInput.closest(".form-group").querySelector(".error-message");

    if (!valid) {
      error.innerText = message;
      error.style.display = "block";
      attachmentInput.value = "";
      return;
    }

    error.innerText = "";
    error.style.display = "none";

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

  function validateAttachments(files) {
    const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
    const maxSize = 3 * 1024 * 1024;
    let valid = true, message = "";

    for (let file of files) {
      if (!allowedTypes.includes(file.type)) { valid = false; message = `Invalid file type: ${file.name}. Only JPG, JPEG, PDF allowed.`; break; }
      if (file.size > maxSize) { valid = false; message = `File too large: ${file.name}. Max 3 MB allowed.`; break; }
    }

    return { valid, message };
  }

  // ===== FORM SUBMIT =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (!["radio","checkbox"].includes(input.type)) {
        if (!validateInput(input)) isValid = false;
      }
    });

    if (radios.length && ![...radios].some(r => r.checked)) {
      const error = radios[0].closest(".form-group").querySelector(".error-message");
      error.innerText = "Please select an option"; error.style.display = "block"; isValid = false;
    }

    if (checkbox && checkbox.required && !checkbox.checked) {
      const error = checkbox.closest(".form-group").querySelector(".error-message");
      error.innerText = "You must accept terms"; error.style.display = "block"; isValid = false;
    }

    if (!isValid) return;

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
    showSuccessModal();
  });

  // ===== FORM RESET =====
  form.addEventListener("reset", () => {
    selectedFiles = [];
    renderSelectedFiles(selectedFilesContainer);
    form.querySelectorAll(".error-message").forEach(el => el.innerText = "");
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    form.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
    form.querySelectorAll(".input-indicator").forEach(ind => ind.innerText = "");
  });

});
