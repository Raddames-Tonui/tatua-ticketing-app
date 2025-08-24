document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("ticket-form");

  const validateInput = (input) => {
    const wrapper = input.closest(".input-wrapper");
    const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
    const error = input.closest(".form-group").querySelector(".error-message");

    if (input.checkValidity()) {
      input.classList.remove("invalid");
      input.classList.add("valid");

      if (indicator) {
        indicator.innerText = "✅";
        indicator.style.display = "inline";
      }

      if (error) {
        error.innerText = "";
        error.style.display = "none";
      }
    } else {
      input.classList.add("invalid");
      input.classList.remove("valid");

      if (indicator) {
        indicator.innerText = "🚫";
        indicator.style.display = "inline";
      }

      if (error) {
        // fallback text if browser has no validationMessage
        error.innerText = input.validationMessage || `Please provide a valid ${input.name}`;
        error.style.display = "block";
      }
    }
  };

  // Attach validation listeners
  form.querySelectorAll("input, select, textarea").forEach(input => {
    if (input.type !== "radio" && input.type !== "checkbox") {
      input.addEventListener("input", () => validateInput(input));
      input.addEventListener("blur", () => validateInput(input));
    }
  });

  // Special case: radio & checkbox groups
  const radios = form.querySelectorAll("input[type='radio'][name='preferredContact']");
  if (radios.length) {
    radios.forEach(radio => {
      radio.addEventListener("change", () => {
        const error = radios[0].closest(".form-group").querySelector(".error-message");
        error.innerText = "";
        error.style.display = "none";
      });
    });
  }

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

  // On submit: validate everything
  form.addEventListener("submit", (e) => {
    let isValid = true;

    form.querySelectorAll("input, select, textarea").forEach(input => {
      if (!input.checkValidity()) {
        validateInput(input);
        isValid = false;
      }
    });

    if (!isValid) {
      e.preventDefault();
    }
  });
});
