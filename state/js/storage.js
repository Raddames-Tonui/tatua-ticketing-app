document.addEventListener("DOMContentLoaded", () => {
  const select = document.getElementById("storage-select");

  // Set initial value based on current directory
  if (window.location.pathname.includes("/local/")) select.value = "local";
  else if (window.location.pathname.includes("/session/")) select.value = "session";
  else if (window.location.pathname.includes("/memory/")) select.value = "memory";
  else select.value = "memory"; // default

  // Redirect on change
  select.addEventListener("change", (e) => {
    const mode = e.target.value;
    switch (mode) {
      case "local":
        window.location.href = "../local/index.html";
        break;
      case "session":
        window.location.href = "../session/index.html";
        break;
      case "memory":
        window.location.href = "../memory/index.html";
        break;
      default:
        window.location.href = "../state/index.html";
    }
  });
});
