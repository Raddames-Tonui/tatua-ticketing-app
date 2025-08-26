// validation.js
export function validateInput(input) {
  const value = input.value.trim();

  // Required check
  if (input.required && !value) {
    return { valid: false, message: "This field is required" };
  }

  // Custom rules
  if (input.name === "fullName" && value.length < 3) {
    return { valid: false, message: "Name must have at least 3 characters" };
  }

  if (input.name === "phone" && value) {
    const regex = /^(\+254|0)?(7\d{8}|1\d{8})$/;
    if (!regex.test(value)) {
      return {
        valid: false,
        message: "Phone must start with +254, 07, or 01 and be valid length"
      };
    }
  }

  // Let native validation handle other fields (like email)
  if (!input.checkValidity()) {
    return { valid: false, message: input.validationMessage };
  }

  return { valid: true, message: "" };
}

export function validateAttachments(files) {
  const allowedTypes = ["image/jpeg", "image/jpg", "application/pdf"];
  const maxSize = 3 * 1024 * 1024; // 3MB

  for (let file of files) {
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: `Invalid type: ${file.name}` };
    }
    if (file.size > maxSize) {
      return { valid: false, message: `File too large: ${file.name}` };
    }
  }
  return { valid: true, message: "" };
}

export function validateRadios(radios) {
  if (![...radios].some(r => r.checked)) {
    return { valid: false, message: "Please select an option" };
  }
  return { valid: true, message: "" };
}

export function validateCheckbox(checkbox) {
  if (checkbox.required && !checkbox.checked) {
    return { valid: false, message: "You must accept terms" };
  }
  return { valid: true, message: "" };
}
