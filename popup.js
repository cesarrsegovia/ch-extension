document.addEventListener("DOMContentLoaded", () => {
  // redireccionar al hacer click
  const btn = document.getElementById("go-gamblor");
  if (btn) {
    btn.addEventListener("click", () => {
      // chrome.tabs.create({ url: "https://www.gamblor.io/" });
      setTimeout(() => {
        window.close(); // Cerrar el popup después de abrir la pestaña
      }, 100);
    });
  }
});
