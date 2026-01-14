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

  // --- NAVIGATION HANDLERS ---

  // 1. HOME VIEW NAV
  const homeView = document.getElementById("view-home");
  if (homeView) {
    const homeNavItems = homeView.querySelectorAll(".nav-item");

    // Games Button (Index 1: Home, Games, Wallet, Rewards, Profile)
    if (homeNavItems[1]) {
      homeNavItems[1].addEventListener("click", () => showGamesView());
    }

    // Profile Button (Last Item)
    const homeProfileBtn = homeNavItems[homeNavItems.length - 1];
    if (homeProfileBtn) {
      homeProfileBtn.addEventListener("click", () => showProfileView());
    }
  }

  // 2. GAMES VIEW NAV
  const gamesView = document.getElementById("view-games");
  if (gamesView) {
    // Home Button
    const gamesHomeBtn = document.getElementById("nav-btn-home");
    if (gamesHomeBtn) {
      gamesHomeBtn.addEventListener("click", () => showHomeView());
    }
    // Profile Button
    const gamesProfileBtn = gamesView.querySelector(".profile-nav-btn-games");
    if (gamesProfileBtn) {
      gamesProfileBtn.addEventListener("click", () => showProfileView());
    }
  }

  // --- PROFILE BACK BUTTON ---
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
  // --- DEPOSIT ACTIONS ---
  // In Profile View
  const btnDepositProfile = document.querySelector(".btn-deposit");
  if (btnDepositProfile) {
    btnDepositProfile.addEventListener("click", () => showDepositView());
  }

  // In Home View
  const btnDepositHome = document.getElementById("btn-deposit");
  if (btnDepositHome) {
    btnDepositHome.addEventListener("click", () => showDepositView());
  }

  // In Games View (Header + button)
  const btnDepositGames = document.querySelector(".gh-add-btn");
  if (btnDepositGames) {
    btnDepositGames.addEventListener("click", () => showDepositView());
  }

  // In Premier View (Header + button)
  const btnDepositPremier = document.querySelector(".add-btn");
  if (btnDepositPremier) {
    btnDepositPremier.addEventListener("click", () => showDepositView());
  }

  // Back from Deposit
  const backDepositBtn = document.getElementById("back-deposit");
  if (backDepositBtn) {
    backDepositBtn.addEventListener("click", () => {
      // Logic to return to previous view could be better, defaulting to Home for now
      showHomeView();
    });
  }

  // --- WITHDRAW ACTIONS ---
  // In Home View
  const btnWithdrawHome = document.getElementById("btn-withdraw");
  if (btnWithdrawHome) {
    btnWithdrawHome.addEventListener("click", () => showWithdrawView());
  }

  // In Profile View
  const btnWithdrawProfile = document.querySelector(".btn-withdraw");
  if (btnWithdrawProfile) {
    btnWithdrawProfile.addEventListener("click", () => showWithdrawView());
  }

  // Back from Withdraw
  const backWithdrawBtn = document.getElementById("back-withdraw");
  if (backWithdrawBtn) {
    backWithdrawBtn.addEventListener("click", () => showHomeView()); // Default to Home
  }

  // --- PROVIDER SCROLL ---
  const provScrollContainer = document.getElementById("prov-scroll-container");
  const btnProvPrev = document.getElementById("btn-prov-prev");
  const btnProvNext = document.getElementById("btn-prov-next");

  if (provScrollContainer && btnProvPrev && btnProvNext) {
    btnProvPrev.addEventListener("click", () => {
      const tolerance = 5;
      // If at start, align to end
      if (provScrollContainer.scrollLeft <= tolerance) {
        provScrollContainer.scrollTo({ left: provScrollContainer.scrollWidth, behavior: "smooth" });
      } else {
        provScrollContainer.scrollBy({ left: -160, behavior: "smooth" });
      }
    });

    btnProvNext.addEventListener("click", () => {
      const tolerance = 5;
      const maxScroll = provScrollContainer.scrollWidth - provScrollContainer.clientWidth;

      // If at end (or close), loop to start
      if (provScrollContainer.scrollLeft >= maxScroll - tolerance) {
        provScrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        provScrollContainer.scrollBy({ left: 160, behavior: "smooth" });
      }
    });
  }
  // --- WITHDRAW NETWORK SELECTION ---
  const wdNetworkBtns = document.querySelectorAll(".wd-net-btn");
  wdNetworkBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active from all
      wdNetworkBtns.forEach(b => b.classList.remove("active"));
      // Add active to clicked
      btn.classList.add("active");
    });
  });

  // --- HISTORY ACTIONS ---
  // In Profile View (Transaction History is the 1st menu item)
  const profileMenuBtns = document.querySelectorAll("#view-profile .menu-item");
  if (profileMenuBtns.length > 0) {
    // 0: Transaction History
    profileMenuBtns[0].addEventListener("click", () => showHistoryView());

    // 1: Bet History (Assuming it's the second item or finding it by text if indices change, but index 1 matches HTML)
    if (profileMenuBtns[1]) {
      profileMenuBtns[1].addEventListener("click", () => showBetHistoryView());
    }
  }

  // Back from History
  const backHistoryBtn = document.getElementById("back-history");
  if (backHistoryBtn) {
    backHistoryBtn.addEventListener("click", () => showProfileView());
  }

  // Back from Bet History
  const backBetsBtn = document.getElementById("back-bets");
  if (backBetsBtn) {
    backBetsBtn.addEventListener("click", () => showProfileView());
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
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
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
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
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
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
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
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
}

function showGamesView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-games").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
}

function showDepositView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-deposit").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
}

function showWithdrawView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-withdraw").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
}

function showHistoryView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-history").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const betsView = document.getElementById("view-bets");
  if (betsView) betsView.classList.remove("active");
}

function showBetHistoryView() {
  document.body.classList.remove("premier-mode", "success-mode");
  document.getElementById("view-bets").classList.add("active");
  document.getElementById("view-home").classList.remove("active");
  document.getElementById("view-premier").classList.remove("active");
  const successView = document.getElementById("view-success");
  if (successView) successView.classList.remove("active");
  const helpView = document.getElementById("view-help");
  if (helpView) helpView.classList.remove("active");
  const profileView = document.getElementById("view-profile");
  if (profileView) profileView.classList.remove("active");
  const gamesView = document.getElementById("view-games");
  if (gamesView) gamesView.classList.remove("active");
  const depositView = document.getElementById("view-deposit");
  if (depositView) depositView.classList.remove("active");
  const withdrawView = document.getElementById("view-withdraw");
  if (withdrawView) withdrawView.classList.remove("active");
  const historyView = document.getElementById("view-history");
  if (historyView) historyView.classList.remove("active");
}
