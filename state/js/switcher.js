  document.addEventListener("DOMContentLoaded", () => {
    const select = document.getElementById("storageSelect");

    // Pre-select the correct option based on the current folder
    if (window.location.pathname.includes("memory")) {
      select.value = "memory";
    } else if (window.location.pathname.includes("session")) {
      select.value = "session";
    } else if (window.location.pathname.includes("local")) {
      select.value = "local";
    }

    // Handle switching
    select.addEventListener("change", () => {
      const choice = select.value;
      if (choice) {
        window.location.href = `../${choice}/index.html`;
      }
    });
  });
