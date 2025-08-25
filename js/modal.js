document.addEventListener("DOMContentLoaded", () => {
  const closeButtons = document.querySelectorAll(".close-btn, .submit-btn");

  closeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const modalOverlay = btn.closest(".modal-overlay");
      if (modalOverlay) {
        modalOverlay.style.display = "none";
      }
    });
  });
});


