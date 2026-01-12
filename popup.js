document.addEventListener("DOMContentLoaded", () => {

  // determinar qué vista mostrar (leyendo del storage)
  chrome.storage.local.get(["currentView"], (result) => {
    const view = result.currentView || "default";
    console.log("Popup opened with view:", view);

    if (view === "premier_league") {
      showPremierLeagueView();
    } else {
      showHomeView();
    }
  });

  // --- HOME ACTIONS ---
  const goGamblorBtn = document.getElementById("go-gamblor");
  if (goGamblorBtn) {
    goGamblorBtn.addEventListener("click", () => {
      window.open("https://www.gamblor.io/", "_blank");
      window.close();
    });
  }

  // --- PREMIER LEAGUE  ---
  // Botón Atrás
  document.getElementById("back-home").addEventListener("click", () => {
    // se limpia el estado para que la próxima vez se abra en home
    chrome.storage.local.set({ "currentView": "default" });
    showHomeView();
  });

  // Botón Place Bet (simulado)
  document.querySelector(".place-bet-btn").addEventListener("click", () => {
    showSuccessView();
  });

  // --- SUCCESS ---
  const closeSuccessBtn = document.getElementById("close-success");
  if (closeSuccessBtn) {
    closeSuccessBtn.addEventListener("click", () => {
      window.close();
    });
  }

  const backSuccessBtn = document.getElementById("back-success");
  if (backSuccessBtn) {
    backSuccessBtn.addEventListener("click", () => {
      window.close();
    });
  }
});

function showHomeView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-home").classList.add("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
}

function showPremierLeagueView() {
  document.body.classList.add("premier-mode");
  document.body.classList.remove("success-mode");
  document.getElementById("view-premier").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
}

function showSuccessView() {
  document.body.classList.add("success-mode");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.add("active");
  document.getElementById("view-premier").classList.remove("active");
}
