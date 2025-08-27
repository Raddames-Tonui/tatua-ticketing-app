// validation.js
export function validateAttachments(files) {
  const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
  const maxSize = 3 * 1024 * 1024; 

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

export function validateInput(input) {
  const wrapper = input.closest(".input-wrapper");
  const indicator = wrapper ? wrapper.querySelector(".input-indicator") : null;
  const error = input.closest(".form-group").querySelector(".error-message");

  const value = input.value.trim();

  // Check for empty input
  if (!value) {
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

  // Check max length
  if (value.length > 250) {
    input.classList.add("invalid");
    input.classList.remove("valid");
    if (indicator) {
      indicator.innerText = "🚫";
      indicator.style.display = "inline";
    }
    if (error) {
      error.innerText = "Text cannot exceed 250 characters";
      error.style.display = "block";
    }
    return false;
  }

  let customValid = true;
  let customMessage = "";

  if (input.name === "fullName" && value.length < 3) {
    customValid = false;
    customMessage = "Name must have at least 3 characters";
  } else if (input.name === "phone") {
    const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/;
    if (!regex.test(value)) {
      customValid = false;
      customMessage =
        "Phone must start with +254, 07, or 01 and be valid length";
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
      error.innerText =
        customMessage || input.validationMessage || `Please provide a valid ${input.name}`;
      error.style.display = "block";
    }
    return false;
  }
}

