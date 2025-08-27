document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticket-form");

  const validateInput = (input) => {
    const wrapper = input.closest(".input-wrapper");
    const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
    const error = input.closest(".form-group").querySelector(".error-message");

    if (!input.value) {
        const wrapper = input.closest(".input-wrapper");
        const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
        const error = input.closest(".form-group").querySelector(".error-message");

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
            // optional field
            input.classList.remove("invalid", "valid");
            if (indicator) indicator.style.display = "none";
            if (error) {
            error.innerText = "";
            error.style.display = "none";
            }
            return true;
        }
    }


    let customValid = true;
    let customMessage = "";

    // Custom validations
    if (input.name === "name") {
      if (input.value.trim().length < 3) {
        customValid = false;
        customMessage = "Name must have at least 3 characters";
      }
    } else if (input.name === "contact") {
      const val = input.value.trim();
      const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/; // allows +254, 07, 01 and 9 digits
      if (!regex.test(val)) {
        customValid = false;
        customMessage = "Contact must start with +254, 07, or 01 and be valid length";
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

  // Form submit
  form.addEventListener("submit", (e) => {
    let isValid = true;

    form.querySelectorAll("input, select, textarea").forEach(input => {
      const fieldValid = validateInput(input);
      if (!fieldValid) isValid = false;
    });

    // Radio validation
    if (radios.length && ![...radios].some(r => r.checked)) {
      const error = radios[0].closest(".form-group").querySelector(".error-message");
      error.innerText = "Please select an option";
      error.style.display = "block";
      isValid = false;
    }

    // Checkbox validation
    if (checkbox && checkbox.required && !checkbox.checked) {
      const error = checkbox.closest(".form-group").querySelector(".error-message");
      error.innerText = "You must accept terms";
      error.style.display = "block";
      isValid = false;
    }

    if (!isValid) {
      e.preventDefault(); // prevent submission
      // DO NOT clear any inputs
    }
  });

  // Attachments
  const attachmentInput = document.getElementById("attachment");
  let selectedFiles = [];

  attachmentInput.addEventListener("change", () => {
    const container = attachmentInput.closest(".form-group").querySelector(".selected-files");
    const newFiles = Array.from(attachmentInput.files);
    selectedFiles = selectedFiles.concat(newFiles);
    renderSelectedFiles(container);
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
});
