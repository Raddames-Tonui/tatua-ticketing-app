
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


const modal = document.getElementById("universal-modal");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalFooter = document.getElementById("modal-footer");
const modalClose = document.getElementById("modal-close");

function showModal({ title, body, footer }) {
  modalTitle.innerHTML = title || "";   
  modalBody.innerHTML = body || "";
  modalFooter.innerHTML = footer || "";
  modal.style.display = "flex";
}


function closeModal() {
  modal.style.display = "none";
  modalTitle.textContent = "";
  modalBody.innerHTML = "";
  modalFooter.innerHTML = "";
}

modalClose.addEventListener("click", closeModal);

// Close if user clicks outside modal box
modal.addEventListener("click", (e) => {
  if (e.target === modal)
    closeModal();
});
