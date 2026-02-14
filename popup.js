document.addEventListener("DOMContentLoaded", () => {


  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // mantenemos la conexión viva mientras el panel esté abierto
      chrome.tabs.connect(tabs[0].id, { name: "gamblor-sidepanel" });
    }
  });

  // --- SIDE PANEL ACTIONS ---
  const sidePanelBtn = document.getElementById("open-sidepanel-btn");
  if (sidePanelBtn) {
    sidePanelBtn.addEventListener("click", async () => {
      // intentar abrir directamente desde el popup
      try {
        const lastFocusedWindow = await chrome.windows.getLastFocused();
        if (lastFocusedWindow && lastFocusedWindow.id) {
          await chrome.sidePanel.open({ windowId: lastFocusedWindow.id });
          // cerrar popup solo si tuvo éxito
          window.close();
        }
      } catch (error) {
        console.error("Error abriendo side panel desde popup:", error);
      }
    });
  }

  // determinar qué vista mostrar (leyendo del storage)
  chrome.storage.local.get(["currentView"], (result) => {
    const view = result.currentView || "default";

    if (view === "premier_league") {
      showPremierLeagueView();
    } else {
      showHomeView();
    }
  });

  // escuchar cambios de vista si el panel ya está abierto
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && changes.currentView) {
      const view = changes.currentView.newValue || "default";

      if (view === "premier_league") {
        showPremierLeagueView();
      } else {
        showHomeView();
      }
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

  // --- NAVIGATION  ---

  // HOME
  const homeView = document.getElementById("view-home");
  if (homeView) {
    const homeNavItems = homeView.querySelectorAll(".nav-item");

    // Games Button 
    if (homeNavItems[1]) {
      homeNavItems[1].addEventListener("click", () => showGamesView());
    }

    // Sportsbook Button
    if (homeNavItems[2]) {
      homeNavItems[2].addEventListener("click", () => showSportsbookView());
    }

    // Profile Button
    const homeProfileBtn = homeNavItems[homeNavItems.length - 1];
    if (homeProfileBtn) {
      homeProfileBtn.addEventListener("click", () => showProfileView());
    }
  }

  // GAMES VIEW 
  const gamesView = document.getElementById("view-games");
  if (gamesView) {
    // Home Button
    const gamesHomeBtn = document.getElementById("nav-btn-home");
    if (gamesHomeBtn) {
      gamesHomeBtn.addEventListener("click", () => showHomeView());
    }

    const gamesNavItems = gamesView.querySelectorAll(".nav-item");

    if (gamesNavItems[2]) {
      gamesNavItems[2].addEventListener("click", () => showSportsbookView());
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
      // Check history to determine where to go back
      showHomeView();
    });
  }

  // --- SPORTSBOOK LANDING NAVIGATION ---
  const sbLandingView = document.getElementById("view-sb-landing");
  if (sbLandingView) {
    // Banner Click -> Full View
    const banner = document.getElementById("sb-banner");
    if (banner) {
      banner.addEventListener("click", () => showSportsbookFullView());
    }

    // Home
    const btnHome = document.getElementById("nav-btn-home-sb-land");
    if (btnHome) btnHome.addEventListener("click", () => showHomeView());

    // Games
    const btnGames = document.getElementById("nav-btn-games-sb-land");
    if (btnGames) btnGames.addEventListener("click", () => showGamesView());

    // Back from landing
    const backBtn = document.getElementById("back-home-sb-land");
    if (backBtn) backBtn.addEventListener("click", () => showHomeView());

    // Profile
    const profileBtn = sbLandingView.querySelector(".profile-nav-btn-sb-land");
    if (profileBtn) profileBtn.addEventListener("click", () => showProfileView());
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
  // --- DEPOSIT ---
  const btnDepositProfile = document.querySelector(".btn-deposit");
  if (btnDepositProfile) {
    btnDepositProfile.addEventListener("click", () => showDepositView());
  }

  // home view
  const btnDepositHome = document.getElementById("btn-deposit");
  if (btnDepositHome) {
    btnDepositHome.addEventListener("click", () => showDepositView());
  }

  // In Games View 
  const btnDepositGames = document.querySelector(".gh-add-btn");
  if (btnDepositGames) {
    btnDepositGames.addEventListener("click", () => showDepositView());
  }

  // In Premier View 
  const btnDepositPremier = document.querySelector(".add-btn");
  if (btnDepositPremier) {
    btnDepositPremier.addEventListener("click", () => showDepositView());
  }

  // Back from Deposit
  const backDepositBtn = document.getElementById("back-deposit");
  if (backDepositBtn) {
    backDepositBtn.addEventListener("click", () => {
      showHomeView();
    });
  }

  // --- WITHDRAW  ---
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
    backWithdrawBtn.addEventListener("click", () => showHomeView()); // default a home
  }

  // --- PROVIDER SCROLL ---
  const provScrollContainer = document.getElementById("prov-scroll-container");
  const btnProvPrev = document.getElementById("btn-prov-prev");
  const btnProvNext = document.getElementById("btn-prov-next");

  if (provScrollContainer && btnProvPrev && btnProvNext) {
    btnProvPrev.addEventListener("click", () => {
      const tolerance = 5;
      if (provScrollContainer.scrollLeft <= tolerance) {
        provScrollContainer.scrollTo({ left: provScrollContainer.scrollWidth, behavior: "smooth" });
      } else {
        provScrollContainer.scrollBy({ left: -160, behavior: "smooth" });
      }
    });

    btnProvNext.addEventListener("click", () => {
      const tolerance = 5;
      const maxScroll = provScrollContainer.scrollWidth - provScrollContainer.clientWidth;

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
      wdNetworkBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // --- HISTORY ACTIONS ---
  const profileMenuBtns = document.querySelectorAll("#view-profile .menu-item");
  if (profileMenuBtns.length > 0) {
    profileMenuBtns[0].addEventListener("click", () => showHistoryView());

    if (profileMenuBtns[1]) {
      profileMenuBtns[1].addEventListener("click", () => showBetHistoryView());
    }
  }

  // atras de history
  const backHistoryBtn = document.getElementById("back-history");
  if (backHistoryBtn) {
    backHistoryBtn.addEventListener("click", () => showProfileView());
  }

  // atras de bet history
  const backBetsBtn = document.getElementById("back-bets");
  if (backBetsBtn) {
    backBetsBtn.addEventListener("click", () => showProfileView());
  }
  // --- CENTER BUTTON (SPORTSBOOK) ---
  const centerBtns = document.querySelectorAll(".center-btn");
  centerBtns.forEach(btn => {
    btn.addEventListener("click", () => showSportsbookView());
  });
});

function switchView(viewId) {
  if (viewId === 'view-premier') {
    document.body.classList.add('premier-mode');
    document.body.classList.remove('success-mode');
  } else if (viewId === 'view-success') {
    document.body.classList.add('success-mode');
    document.body.classList.remove('premier-mode');
  } else {
    document.body.classList.remove('premier-mode', 'success-mode');
  }

  const views = document.querySelectorAll('.view-section');
  views.forEach(view => {
    view.classList.remove('active');
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
  }
}

function showHomeView() {
  switchView('view-home');
}

function showPremierLeagueView() {
  switchView('view-premier');
}

function showSuccessView() {
  switchView('view-success');
}

function showHelpView() {
  switchView('view-help');
}

function showProfileView() {
  switchView('view-profile');
}

function showGamesView() {
  switchView('view-games');
}

function showDepositView() {
  switchView('view-deposit');
}

function showWithdrawView() {
  switchView('view-withdraw');
}

function showHistoryView() {
  switchView('view-history');
}

function showBetHistoryView() {
  switchView('view-bets');
}

function showSportsbookView() {
  switchView('view-sb-landing');
  loadSportsbookData();
}

function showSportsbookFullView() {
  switchView('view-sportsbook');
  // loadSportsbookData() is called by default logic or we can call explicitly if needed
  // But data is shared or re-fetched. Let's re-fetch to be safe and update UI
  loadSportsbookData();
}

/**
 * Loads AFA data using SoccerAPI
 */
async function loadSportsbookData() {
  const badgeUrl = await window.SoccerAPI.getLeagueBadge();
  const badgeImg = document.getElementById("sb-league-badge");
  if (badgeUrl && badgeImg) {
    badgeImg.src = badgeUrl;
  }

  const matches = await window.SoccerAPI.getArgentineMatches();
  renderMatches(matches);
}

/**
 * Renderiza las tarjetas de partidos
 */
function renderMatches(matches) {
  // Landing View List (Live Only)
  const landingLiveList = document.getElementById("sb-landing-live-list");

  // Full View Lists
  const liveList = document.getElementById("sb-live-list");
  const upcomingList = document.getElementById("sb-upcoming-list");
  const recentList = document.getElementById("sb-recent-list");
  const liveSection = document.getElementById("sb-live-section");

  if (!upcomingList || !recentList) return;

  // Clear all lists
  if (landingLiveList) landingLiveList.innerHTML = "";
  if (liveList) liveList.innerHTML = "";
  upcomingList.innerHTML = "";
  recentList.innerHTML = "";

  let hasLive = false;

  matches.forEach(match => {
    const matchHtml = `
      <div class="sb-match-card">
        <div class="sb-match-header">
          <span>${new Date(match.date).toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
          ${match.isLive ? '<div class="sb-live-tag"><span class="material-symbols-outlined animate-pulse" style="font-size:12px">bolt</span>LIVE</div>' : `<span>${match.status === 'Upcoming' ? 'Upcoming' : 'Finished'}</span>`}
        </div>
        <div class="sb-match-body">
          <div class="sb-team-row">
            <div class="sb-team-info">
              <img src="${match.homeLogo || 'https://www.thesportsdb.com/images/media/team/badge/xvquvw1364352617.png'}" class="sb-team-logo" onerror="this.src='https://www.thesportsdb.com/images/media/team/badge/xvquvw1364352617.png'">
              <span class="sb-team-name">${match.homeTeam}</span>
            </div>
            <span class="sb-score">${match.status === 'Upcoming' ? '–' : match.homeScore}</span>
          </div>
          <div class="sb-team-row">
            <div class="sb-team-info">
              <img src="${match.awayLogo || 'https://www.thesportsdb.com/images/media/team/badge/xvquvw1364352617.png'}" class="sb-team-logo" onerror="this.src='https://www.thesportsdb.com/images/media/team/badge/xvquvw1364352617.png'">
              <span class="sb-team-name">${match.awayTeam}</span>
            </div>
            <span class="sb-score">${match.status === 'Upcoming' ? '–' : match.awayScore}</span>
          </div>
        </div>
      </div>
    `;

    if (match.isLive) {
      if (liveList) liveList.innerHTML += matchHtml;
      if (landingLiveList) landingLiveList.innerHTML += matchHtml;
      hasLive = true;
    } else if (match.status === "Upcoming") {
      upcomingList.innerHTML += matchHtml;
    } else {
      recentList.innerHTML += matchHtml;
    }
  });

  if (liveSection) liveSection.style.display = hasLive ? "block" : "none";
  // Landing section live visibility check handled by content presence, but we can add a placeholder if empty
  if (landingLiveList && landingLiveList.innerHTML === "") {
    landingLiveList.innerHTML = '<div class="sb-match-skeleton">No live matches currently.</div>';
  }

  if (upcomingList.innerHTML === "") upcomingList.innerHTML = '<div class="sb-match-skeleton">No upcoming matches scheduled.</div>';
  if (recentList.innerHTML === "") recentList.innerHTML = '<div class="sb-match-skeleton">No recent results.</div>';
}

// --- SPORTSBOOK VIEW NAVIGATION ---
const sportsbookView = document.getElementById("view-sportsbook");
if (sportsbookView) {
  const sbHomeBtn = document.getElementById("nav-btn-home-sb");
  if (sbHomeBtn) sbHomeBtn.addEventListener("click", () => showHomeView());

  const sbGamesBtn = document.getElementById("nav-btn-games-sb");
  if (sbGamesBtn) sbGamesBtn.addEventListener("click", () => showGamesView());

  const sbProfileBtn = sportsbookView.querySelector(".profile-nav-btn-sb");
  if (sbProfileBtn) sbProfileBtn.addEventListener("click", () => showProfileView());

  const backHomeBtn = document.getElementById("back-landing-sb");
  if (backHomeBtn) backHomeBtn.addEventListener("click", () => showSportsbookView()); // Back to Landing
}

