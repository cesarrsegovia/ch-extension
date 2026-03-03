document.addEventListener("DOMContentLoaded", () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // mantenemos la conexión viva mientras el panel esté abierto
      chrome.tabs.connect(tabs[0].id, { name: "gamblor-sidepanel" });
    }
  });

  // Initialize i18n
  if (typeof localizeHtmlPage === 'function') {
    localizeHtmlPage();
  }

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

  // --- GLOBAL NAVIGATION (sidepanel.html) ---
  const navHome = document.getElementById("nav-global-home");
  const navGames = document.getElementById("nav-global-games");
  const navCenter = document.getElementById("nav-global-center"); // Soccer ball
  const navSb = document.getElementById("nav-global-sb");
  const navProfile = document.getElementById("nav-global-profile");

  if (navHome) navHome.addEventListener("click", () => showHomeView());
  if (navGames) navGames.addEventListener("click", () => showGamesView());
  if (navCenter) navCenter.addEventListener("click", () => showSportsbookView());
  if (navSb) navSb.addEventListener("click", () => showSportsbookView());
  if (navProfile) navProfile.addEventListener("click", () => showProfileView());

  // --- POPUP.HTML PER-VIEW NAVIGATION ---
  // Home view nav buttons (no IDs, use querySelectorAll for nav-items)
  // Games view: nav-btn-home (Home), profile-nav-btn-games (Profile)
  // Sportsbook view: nav-btn-home-sb-pop (Home), back-home-sb-pop (Back), profile-nav-btn-sb (Profile)

  const navBtnHome = document.getElementById("nav-btn-home");
  if (navBtnHome) navBtnHome.addEventListener("click", () => showHomeView());

  const navBtnHomeSbPop = document.getElementById("nav-btn-home-sb-pop");
  if (navBtnHomeSbPop) navBtnHomeSbPop.addEventListener("click", () => showHomeView());

  const backHomeSbPop = document.getElementById("back-home-sb-pop");
  if (backHomeSbPop) backHomeSbPop.addEventListener("click", () => showHomeView());

  const navBtnHomeSbPop2 = document.getElementById("nav-btn-home-sb-pop2");
  if (navBtnHomeSbPop2) navBtnHomeSbPop2.addEventListener("click", () => showHomeView());

  const profileNavGames = document.querySelector(".profile-nav-btn-games");
  if (profileNavGames) profileNavGames.addEventListener("click", () => showProfileView());

  const profileNavSb = document.querySelector(".profile-nav-btn-sb");
  if (profileNavSb) profileNavSb.addEventListener("click", () => showProfileView());

  // Home view nav bar: Games and Profile buttons (no IDs — use positional approach)
  // The home nav has: Home(0), Games(1), Center(div), Rewards(3), Profile(4)
  const homeNav = document.querySelector("#view-home .nav-bar .nav-container");
  if (homeNav) {
    const homeNavButtons = homeNav.querySelectorAll(":scope > button.nav-item");
    // homeNavButtons[0] = Home (already active), [1] = Games, [2] = Rewards, [3] = Profile
    if (homeNavButtons[1]) homeNavButtons[1].addEventListener("click", () => showGamesView());
    if (homeNavButtons[3]) homeNavButtons[3].addEventListener("click", () => showProfileView());
  }

  // Games view nav bar: Sportsbook (center-btn) already handled, but Rewards button not needed
  // Sportsbook view nav bar: Games button uses onclick="showGamesView()" already in HTML

  // --- PREMIER LEAGUE  ---
  // boton atras
  const btnBackHome = document.getElementById("back-home");
  if (btnBackHome) {
    btnBackHome.addEventListener("click", () => {
      // se limpia el estado para que la próxima vez se abra en home
      chrome.storage.local.set({ "currentView": "default" });
      showHomeView();
    });
  }

  // boton Place Bet (simulado)
  const placeBetBtn = document.querySelector(".place-bet-btn");
  if (placeBetBtn) {
    placeBetBtn.addEventListener("click", () => {
      showSuccessView();
    });
  }

  // --- HELP ACTIONS ---
  const backHelpBtn = document.getElementById("back-help");
  if (backHelpBtn) {
    backHelpBtn.addEventListener("click", () => {
      showHomeView();
    });
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

    // Back from landing
    const backBtn = document.getElementById("back-home-sb-land");
    if (backBtn) backBtn.addEventListener("click", () => showHomeView());
  }

  // --- SPORTSBOOK FULL VIEW NAVIGATION ---
  const backHomeSbBtn = document.getElementById("back-landing-sb");
  if (backHomeSbBtn) {
    backHomeSbBtn.addEventListener("click", () => showSportsbookView()); // Back to Landing
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

let refreshInterval = null;

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
    console.log("Auto-refresh stopped");
  }
}

function startAutoRefresh() {
  stopAutoRefresh(); // ensure no duplicates
  console.log("Auto-refresh started (60s)");
  refreshInterval = setInterval(() => {
    console.log("Refreshing sportsbook data...");
    loadSportsbookData();
  }, 60000); // 60 seconds
}

function switchView(viewId) {
  // Stop refreshing when leaving a view (default safety)
  stopAutoRefresh();

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

  updateNavState(viewId);
}

function updateNavState(viewId) {
  // Remove active from all
  document.querySelectorAll('.global-nav .nav-item').forEach(btn => {
    btn.classList.remove('active');
    btn.style.color = ''; // reset inline color
  });

  // Default color for active
  const activeColor = 'var(--dash-primary)';

  if (viewId === 'view-home') {
    const btn = document.getElementById('nav-global-home');
    if (btn) {
      btn.classList.add('active');
      btn.style.color = activeColor;
    }
  } else if (viewId === 'view-games') {
    const btn = document.getElementById('nav-global-games');
    if (btn) {
      btn.classList.add('active');
      btn.style.color = activeColor;
    }
  } else if (viewId === 'view-sb-landing' || viewId === 'view-sportsbook') {
    const btn = document.getElementById('nav-global-sb');
    if (btn) {
      btn.classList.add('active');
      btn.style.color = activeColor;
    }
  } else if (viewId === 'view-profile' || viewId === 'view-history' || viewId === 'view-bets') {
    // Keep profile active for profile sub-pages too
    const btn = document.getElementById('nav-global-profile');
    if (btn) {
      btn.classList.add('active');
      btn.style.color = activeColor;
    }
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
  // popup.html only has view-sportsbook, sidepanel.html has view-sb-landing
  const landing = document.getElementById('view-sb-landing');
  if (landing) {
    switchView('view-sb-landing');
  } else {
    switchView('view-sportsbook');
  }
  loadSportsbookData();
  startAutoRefresh();
}

function showSportsbookFullView() {
  switchView('view-sportsbook');
  loadSportsbookData();
  startAutoRefresh();
}


/**
 * Loads AFA data using SoccerAPI
 */
async function loadSportsbookData() {
  if (!window.SoccerAPI) {
    console.error("SoccerAPI not found. Make sure lib/soccer-api.js is loaded.");
    return;
  }

  try {
    const badgeUrl = await window.SoccerAPI.getLeagueBadge();
    const badgeImg = document.getElementById("sb-league-badge");
    if (badgeUrl && badgeImg) {
      badgeImg.src = badgeUrl;
    }

    const matches = await window.SoccerAPI.getArgentineMatches();
    renderMatches(matches);
  } catch (e) {
    console.error("Error loading sportsbook data:", e);
  }
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

  if (!upcomingList || !recentList) {
    console.error("Sportsbook lists not found in DOM");
    return;
  }

  // Clear all lists (except landing list if we want to keep it persistent for a sec, but clearing is safer)
  if (landingLiveList) landingLiveList.innerHTML = "";
  if (liveList) liveList.innerHTML = "";
  upcomingList.innerHTML = "";
  recentList.innerHTML = "";

  let hasLive = false;

  if (!matches || matches.length === 0) {
    upcomingList.innerHTML = '<div class="sb-match-skeleton">No matches found.</div>';
    return;
  }

  // Matches rendering
  matches.forEach(match => {
    try {
      let oddsHtml = '';
      if (match.odds) {
        oddsHtml = `
          <div class="sb-odds-row">
            <div class="sb-odd-item" title="Local">
              <span class="sb-odd-label">1</span>
              <span class="sb-odd-val">${match.odds.home || '-'}</span>
            </div>
            <div class="sb-odd-item" title="Empate">
              <span class="sb-odd-label">X</span>
              <span class="sb-odd-val">${match.odds.draw || '-'}</span>
            </div>
            <div class="sb-odd-item" title="Visitante">
              <span class="sb-odd-label">2</span>
              <span class="sb-odd-val">${match.odds.away || '-'}</span>
            </div>
          </div>
        `;
      }

      const matchDate2 = new Date(match.date);
      const timeDiff = new Date() - matchDate2;
      const minutes = Math.floor(timeDiff / 60000);

      let displayTime = '';
      if (match.isLive) {
        if (minutes <= 45) {
          displayTime = minutes + "'";
        } else if (minutes > 45 && minutes <= 60) {
          displayTime = "ET"; // Entretiempo
        } else {
          // Second half estimation (subtract 15 min break)
          displayTime = (minutes - 15) + "'";
        }
      } else {
        displayTime = matchDate2.toLocaleDateString([], { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      }

      const matchHtml = `
        <div class="sb-match-card">
          <div class="sb-match-header">
            <span class="sb-match-time">${displayTime}</span>
            ${match.isLive ? '<div class="sb-live-tag animate-blink-red"><span class="material-symbols-outlined" style="font-size:12px">bolt</span>LIVE</div>' : `<span>${match.status === 'Upcoming' ? 'Upcoming' : 'Finished'}</span>`}
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
          ${oddsHtml}
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
    } catch (err) {
      console.error("Error rendering match:", err, match);
    }
  });

  if (liveSection) liveSection.style.display = hasLive ? "block" : "none";
  // Landing section live visibility check handled by content presence, but we can add a placeholder if empty
  if (landingLiveList && landingLiveList.innerHTML === "") {
    landingLiveList.innerHTML = '<div class="sb-match-skeleton">No live matches currently.</div>';
  }

  // Add Last Updated header at the bottom
  const updateTime = new Date().toLocaleTimeString();
  const updateBadge = `<div style="font-size:10px; color:#6b7280; text-align:center; padding-top:8px; width:100%;">Updated: ${updateTime}</div>`;

  if (hasLive) {
    if (liveList) liveList.innerHTML += updateBadge;
    if (landingLiveList) landingLiveList.innerHTML += updateBadge;
  }

  console.log(`Rendering matches at ${updateTime}. Total matches: ${matches.length}`);

  if (upcomingList.innerHTML === "") upcomingList.innerHTML = '<div class="sb-match-skeleton">No upcoming matches scheduled.</div>';
  if (recentList.innerHTML === "") recentList.innerHTML = '<div class="sb-match-skeleton">No recent results.</div>';
}
