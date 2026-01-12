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

  const settingsBtn = document.querySelector(".settings-btn");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      showHelpView();
    });
  }

  // --- PREMIER LEAGUE  ---
  // boton atras
  document.getElementById("back-home").addEventListener("click", () => {
    // se limpia el estado para que la próxima vez se abra en home
    chrome.storage.local.set({ "currentView": "default" });
    showHomeView();
  });

  // boton Place Bet (simulado)
  document.querySelector(".place-bet-btn").addEventListener("click", () => {
    showSuccessView();
  });

  // --- HELP ACTIONS ---
  const backHelpBtn = document.getElementById("back-help");
  if (backHelpBtn) {
    backHelpBtn.addEventListener("click", () => {
      showHomeView();
    });
  }

  // --- PROFILE  ---
  const navItems = document.querySelectorAll(".nav-item");
  const profileNavBtn = navItems[navItems.length - 1];
  if (profileNavBtn) {
    profileNavBtn.addEventListener("click", () => {
      showProfileView();
    });
  }

  const backProfileBtn = document.getElementById("back-profile");
  if (backProfileBtn) {
    backProfileBtn.addEventListener("click", () => {
      showHomeView();
    });
  }

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
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
}

function showPremierLeagueView() {
  document.body.classList.add("premier-mode");
  document.body.classList.remove("success-mode");
  document.getElementById("view-premier").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
}

function showSuccessView() {
  document.body.classList.add("success-mode");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.add("active");
  document.getElementById("view-premier").classList.remove("active");
}

function showHelpView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-help").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
}

function showProfileView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-profile").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
}
