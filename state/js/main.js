import { validateInput, validateAttachments } from "../js/validation.js";

document.querySelectorAll(".nav-link").forEach(link => {
  if (link.href === window.location.href) link.classList.add("active");
});

document.addEventListener("DOMContentLoaded", () => {
  const url = window.location.href;
  const isLocal = url.includes("/local/");
  const isSession = url.includes("/session/");
  const isMemory = url.includes("/memory/");

  let memoryStore = [];

  const storage = {
    save: tickets => {
      if (isLocal) localStorage.setItem("tickets", btoa(JSON.stringify(tickets)));
      else if (isSession) sessionStorage.setItem("tickets", JSON.stringify(tickets));
      else if (isMemory) memoryStore = [...tickets];
    },
    get: () => {
      if (isLocal) {
        const raw = localStorage.getItem("tickets");
        if (!raw) return [];
        try { return JSON.parse(atob(raw)); } 
        catch (e) { localStorage.removeItem("tickets"); return []; }
      }
      if (isSession) return JSON.parse(sessionStorage.getItem("tickets")) || [];
      if (isMemory) return [...memoryStore];
      return [];
    }
  };

  const form = document.getElementById("ticket-form");
  if (!form) return;

  const successModal = document.querySelector(".success-modal-overlay");
  const modalCloseButtons = document.querySelectorAll(".success-close-btn, .success-modal-close-btn");

  if (sessionStorage.getItem("ticketSubmitted") === "true") successModal.style.display = "none";

  const showSuccessModal = () => { successModal.style.display = "flex"; sessionStorage.setItem("ticketSubmitted", "true"); };
  const hideSuccessModal = () => { successModal.style.display = "none"; };

  modalCloseButtons.forEach(btn => btn.addEventListener("click", hideSuccessModal));

  // File attachments
  let selectedFiles = [];
  const attachmentInput = document.getElementById("attachment");
  const selectedFilesContainer = form.querySelector(".selected-files");

  const renderSelectedFiles = container => {
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
      btn.addEventListener("click", e => {
        const idx = parseInt(e.target.dataset.index);
        selectedFiles.splice(idx, 1);
        renderSelectedFiles(container);
      });
    });
  };

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

  // Input validations
  form.querySelectorAll("input, select, textarea").forEach(input => {
    if (!["radio", "checkbox"].includes(input.type)) {
      input.addEventListener("input", () => {
        if (input.classList.contains("invalid") && validateInput(input)) {
          input.classList.remove("invalid");
          const wrapper = input.closest(".input-wrapper");
          const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
          const error = input.closest(".form-group").querySelector(".error-message");
          if (indicator) indicator.style.display = "none";
          if (error) { error.innerText = ""; error.style.display = "none"; }
        }
      });
      input.addEventListener("blur", () => validateInput(input));
    }
  });

  // Radio validation
  const radios = form.querySelectorAll("input[type='radio'][name='preferredContact']");
  radios.forEach(radio => radio.addEventListener("change", () => {
    const error = radios[0].closest(".form-group").querySelector(".error-message");
    error.innerText = "";
    error.style.display = "none";
  }));

  // Terms checkbox validation
  const checkbox = form.querySelector("input[type='checkbox'][name='terms']");
  if (checkbox) {
    checkbox.addEventListener("change", () => {
      const error = checkbox.closest(".form-group").querySelector(".error-message");
      if (checkbox.checked) { error.innerText = ""; error.style.display = "none"; }
    });
  }

  // Form submission
  form.addEventListener("submit", async e => {
    e.preventDefault();
    let isValid = true;

    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (!["radio", "checkbox"].includes(input.type)) if (!validateInput(input)) isValid = false;
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

    const base64Files = await Promise.all(
      selectedFiles.map(file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, type: file.type, data: reader.result });
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    );

    const ticket = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      subject: form.subject.value,
      message: form.message.value.trim(),
      preferredContact: [...form.preferredContact].find(r => r.checked).value,
      attachments: base64Files,
      date: new Date()
    };

    console.log(ticket);
    storage.save([...storage.get(), ticket]);

    form.reset();
    selectedFiles = [];
    renderSelectedFiles(selectedFilesContainer);
    showSuccessModal();
  });

  // Form reset
  form.addEventListener("reset", () => {
    selectedFiles = [];
    renderSelectedFiles(selectedFilesContainer);
    form.querySelectorAll(".error-message").forEach(el => el.innerText = "");
    form.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
    form.querySelectorAll(".valid").forEach(el => el.classList.remove("valid"));
    form.querySelectorAll(".input-indicator").forEach(ind => ind.innerText = "");
  });

});
