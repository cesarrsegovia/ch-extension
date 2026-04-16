document.addEventListener("DOMContentLoaded", () => {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // mantenemos la conexión viva mientras el panel esté abierto
      chrome.tabs.connect(tabs[0].id, { name: "fl-sports-sidepanel" });
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
  const goFlSportsBtn = document.getElementById("go-fl-sports");
  if (goFlSportsBtn) {
    goFlSportsBtn.addEventListener("click", () => {
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
  // Back from landing
  const backBtn = document.getElementById("back-home-sb-land");
  if (backBtn) backBtn.addEventListener("click", () => showHomeView());

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

  // --- SPORTS SUB-NAV (Soccer / NBA / NHL) ---
  document.querySelectorAll('.sport-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const sport = tab.getAttribute('data-sport');
      switchSport(sport);
    });
  });

  // --- SPORT SUB-SECTIONS (Matches / Standings / Calendar) ---
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const section = tab.getAttribute('data-section');
      switchSection(section);
    });
  });
});

let refreshInterval = null;

// ===== PER-SPORT AUTO-REFRESH SYSTEM =====
let soccerRefreshInterval = null;
let nbaRefreshInterval = null;
let soccerHasLive = false;
let nbaHasLive = false;

const SOCCER_REFRESH_MS = 60000;  // 60 seconds
const NBA_REFRESH_MS = 30000;     // 30 seconds (faster scoring)

function stopAutoRefresh() {
  // Stop ALL sport timers
  if (refreshInterval) { clearInterval(refreshInterval); refreshInterval = null; }
  if (soccerRefreshInterval) { clearInterval(soccerRefreshInterval); soccerRefreshInterval = null; }
  if (nbaRefreshInterval) { clearInterval(nbaRefreshInterval); nbaRefreshInterval = null; }
  console.log("All auto-refresh timers stopped");
}

function startSoccerRefresh() {
  if (soccerRefreshInterval) clearInterval(soccerRefreshInterval);
  if (!soccerHasLive) {
    console.log("Soccer: no live games, skipping auto-refresh");
    return;
  }
  console.log(`Soccer: auto-refresh started (${SOCCER_REFRESH_MS / 1000}s)`);
  soccerRefreshInterval = setInterval(() => {
    if (currentSport !== 'soccer') return;
    if (!soccerHasLive) {
      clearInterval(soccerRefreshInterval);
      soccerRefreshInterval = null;
      console.log("Soccer: no live games, auto-refresh stopped");
      return;
    }
    console.log("Refreshing soccer data...");
    loadSportsbookData();
  }, SOCCER_REFRESH_MS);
}

function startNbaRefresh() {
  if (nbaRefreshInterval) clearInterval(nbaRefreshInterval);
  if (!nbaHasLive) {
    console.log("NBA: no live games, skipping auto-refresh");
    return;
  }
  console.log(`NBA: auto-refresh started (${NBA_REFRESH_MS / 1000}s)`);
  nbaRefreshInterval = setInterval(() => {
    if (currentSport !== 'nba') return;
    if (!nbaHasLive) {
      clearInterval(nbaRefreshInterval);
      nbaRefreshInterval = null;
      console.log("NBA: no live games, auto-refresh stopped");
      return;
    }
    console.log("Refreshing NBA data...");
    loadNbaData();
  }, NBA_REFRESH_MS);
}

/** Start the appropriate refresh timer for the current sport */
function startAutoRefresh() {
  if (currentSport === 'soccer') {
    startSoccerRefresh();
  } else if (currentSport === 'nba') {
    startNbaRefresh();
  }
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
  } else if (viewId === 'view-sb-landing') {
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
  switchView('view-sb-landing');
  loadSportsbookData(); // render will start refresh timer if live games found
}

/** Current active sport for sportsbook sub-nav */
let currentSport = 'soccer';

/** Current active section within the sport (matches, standings, calendar) */
let currentSection = 'matches';

/**
 * Switches the active sport tab in both sportsbook views.
 * Syncs active state and loads the appropriate data.
 * @param {string} sport - 'soccer', 'nba', or 'nhl'
 */
function switchSport(sport) {
  const previousSport = currentSport;
  currentSport = sport;

  // Stop the PREVIOUS sport's refresh timer
  if (previousSport === 'soccer' && soccerRefreshInterval) {
    clearInterval(soccerRefreshInterval); soccerRefreshInterval = null;
    soccerStandingsLoaded = false; // Reset so standings refresh next visit
  } else if (previousSport === 'nba' && nbaRefreshInterval) {
    clearInterval(nbaRefreshInterval); nbaRefreshInterval = null;
    standingsLoaded = false; // Reset NBA standings cache
  }

  // Update all sport-tab buttons across both views
  document.querySelectorAll('.sport-tab').forEach(tab => {
    if (tab.getAttribute('data-sport') === sport) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });


  if (sport === 'soccer') {
    loadSportsbookData(); // will trigger startSoccerRefresh if live games exist
  } else if (sport === 'nba') {
    loadNbaData(); // will trigger startNbaRefresh if live games exist
  } else {
    // NHL — coming soon, no refresh needed
    const liveList = document.getElementById('sb-live-list');
    const upcomingList = document.getElementById('sb-upcoming-list');
    const recentList = document.getElementById('sb-recent-list');
    const liveSection = document.getElementById('sb-live-section');
    const landingLiveList = document.getElementById('sb-landing-live-list');

    const placeholder = '<div class="sb-match-skeleton">NHL data coming soon...</div>';

    if (liveSection) liveSection.style.display = 'none';
    if (liveList) liveList.innerHTML = '';
    if (upcomingList) upcomingList.innerHTML = placeholder;
    if (recentList) recentList.innerHTML = '';
    if (landingLiveList) landingLiveList.innerHTML = placeholder;
  }

  // Show/hide sub-sections bar depending on sport
  updateSectionsBarVisibility(sport);
  // Reset to 'matches' section on sport switch
  switchSection('matches');
}

/**
 * Shows or hides the sport sub-sections bar based on the current sport.
 * Soccer shows Matches/Standings, NBA shows Matches/Standings/Calendar.
 * @param {string} sport
 */
function updateSectionsBarVisibility(sport) {
  const bars = document.querySelectorAll('.sport-sections-bar');
  const calendarTabs = document.querySelectorAll('.section-tab[data-section="calendar"]');
  const showBar = (sport === 'nba' || sport === 'soccer');
  bars.forEach(bar => {
    bar.style.display = showBar ? 'flex' : 'none';
  });
  // Calendar tab only for NBA
  calendarTabs.forEach(tab => {
    tab.style.display = (sport === 'nba') ? '' : 'none';
  });
}

/**
 * Switches the active section within the current sport.
 * @param {string} section - 'matches', 'standings', or 'calendar'
 */
function switchSection(section) {
  currentSection = section;

  // Update all section-tab buttons
  document.querySelectorAll('.section-tab').forEach(tab => {
    if (tab.getAttribute('data-section') === section) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Show/hide section content containers
  const sections = ['matches', 'standings', 'calendar'];
  sections.forEach(s => {
    const el = document.getElementById(`landing-section-${s}`);
    if (el) el.style.display = (s === section) ? '' : 'none';
  });

  // Load data if needed
  if (section === 'standings') {
    if (currentSport === 'nba') loadNbaStandings();
    else if (currentSport === 'soccer') loadSoccerStandings();
  } else if (section === 'calendar' && currentSport === 'nba') {
    loadNbaCalendar();
  }
}


/**
 * Loads AFA data using SoccerAPI (only when soccer is active)
 */
async function loadSportsbookData() {
  // Skip loading soccer data if another sport is selected
  if (currentSport !== 'soccer') return;

  if (!window.SoccerAPI) {
    console.error("SoccerAPI not found. Make sure lib/soccer-api.js is loaded.");
    return;
  }

  try {
    // Fetch badge, matches, AND ESPN live clock in parallel
    const [badgeUrl, matches, espnClock] = await Promise.all([
      window.SoccerAPI.getLeagueBadge(),
      window.SoccerAPI.getArgentineMatches(),
      window.SoccerAPI.getEspnSoccerScoreboard()
    ]);

    const badgeImg = document.getElementById("sb-league-badge");
    if (badgeUrl && badgeImg) {
      badgeImg.src = badgeUrl;
    }

    renderMatches(matches, espnClock);
  } catch (e) {
    console.error("Error loading sportsbook data:", e);
  }
}

/**
 * Renderiza las tarjetas de partidos
 */
function renderMatches(matches, espnClockMap) {
  // Landing View List (Live Only)
  const landingLiveList = document.getElementById("sb-landing-live-list");

  // Full View Lists
  const liveList = document.getElementById("sb-live-list");
  const upcomingList = document.getElementById("sb-upcoming-list");
  const recentList = document.getElementById("sb-recent-list");
  const liveSection = document.getElementById("sb-live-section");

  if (!landingLiveList && !upcomingList) {
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
      const matchDate2 = new Date(match.date);

      // Try to get match time from ESPN real clock data
      let displayTime = '';
      let espnMatch = null;
      if (espnClockMap && match.isLive) {
        // Search ESPN data by matching team names
        const homeClean = match.homeTeam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const awayClean = match.awayTeam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        for (const [id, espn] of Object.entries(espnClockMap)) {
          const eH = espn.homeTeam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          const eA = espn.awayTeam.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if ((eH.includes(homeClean) || homeClean.includes(eH) ||
            eA.includes(awayClean) || awayClean.includes(eA)) &&
            espn.state === 'in') {
            espnMatch = espn;
            break;
          }
        }
      }

      if (espnMatch) {
        // Use ESPN's real match clock
        displayTime = espnMatch.shortDetail || espnMatch.displayClock || '';
        // Normalize: ESPN returns "FT", "HT", "45'", "90'+3'" etc.
        if (displayTime === 'HT' || displayTime === 'Half Time') {
          displayTime = 'HT';
        }
      } else if (match.isLive) {
        // Fallback: estimate from commence_time
        const timeDiff = new Date() - matchDate2;
        const KICKOFF_DELAY_MS = 3 * 60 * 1000;
        const adjustedDiff = Math.max(0, timeDiff - KICKOFF_DELAY_MS);
        const minutes = Math.floor(adjustedDiff / 60000);
        if (minutes <= 45) {
          displayTime = Math.max(1, minutes) + "'";
        } else if (minutes > 45 && minutes <= 62) {
          displayTime = 'HT';
        } else {
          const secondHalfMin = minutes - 17;
          displayTime = Math.min(secondHalfMin, 90) + "'";
          if (secondHalfMin > 90) displayTime = "90+'";
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
        </div>
      `;

      if (match.isLive) {
        if (liveList) liveList.innerHTML += matchHtml;
        if (landingLiveList) landingLiveList.innerHTML += matchHtml;
        hasLive = true;
      } else if (match.status === "Upcoming") {
        if (upcomingList) upcomingList.innerHTML += matchHtml;
      } else {
        if (recentList) recentList.innerHTML += matchHtml;
      }
    } catch (err) {
      console.error("Error rendering match:", err, match);
    }
  });

  if (liveSection) liveSection.style.display = hasLive ? "block" : "none";
  // Update landing section title
  const landingSectionTitle = document.getElementById("sb-landing-section-title");
  if (landingSectionTitle) {
    landingSectionTitle.textContent = hasLive ? "Live Now" : "Live Now";
  }
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

  if (upcomingList && upcomingList.innerHTML === "") upcomingList.innerHTML = '<div class="sb-match-skeleton">No upcoming matches scheduled.</div>';
  if (recentList && recentList.innerHTML === "") recentList.innerHTML = '<div class="sb-match-skeleton">No recent results.</div>';

  // Update soccer live flag and manage its refresh timer
  soccerHasLive = hasLive;
  if (currentSport === 'soccer') {
    if (hasLive && !soccerRefreshInterval) startSoccerRefresh();
    if (!hasLive && soccerRefreshInterval) { clearInterval(soccerRefreshInterval); soccerRefreshInterval = null; console.log('Soccer: no live games, auto-refresh stopped'); }
  }
}

/**
 * Loads NBA data using NbaAPI
 */
async function loadNbaData() {
  if (currentSport !== 'nba') return;

  if (!window.NbaAPI) {
    console.error("NbaAPI not found. Make sure lib/nba-api.js is loaded.");
    return;
  }

  // Show loading state
  const upcomingList = document.getElementById('sb-upcoming-list');
  const landingLiveList = document.getElementById('sb-landing-live-list');
  if (upcomingList) upcomingList.innerHTML = '<div class="sb-match-skeleton">Loading NBA matches...</div>';
  if (landingLiveList) landingLiveList.innerHTML = '<div class="sb-match-skeleton">Loading NBA matches...</div>';

  // Update header badge and title
  const badgeUrl = await window.NbaAPI.getNbaLeagueBadge();
  const badgeImg = document.getElementById("sb-league-badge");
  if (badgeUrl && badgeImg) badgeImg.src = badgeUrl;

  const headerTitle = document.querySelector("#view-sb-landing .sb-league-info h1");
  if (headerTitle) headerTitle.textContent = "NBA";

  try {
    const matches = await window.NbaAPI.getNbaMatches();
    if (currentSport !== 'nba') return; // user may have switched away
    renderNbaMatches(matches);
  } catch (e) {
    console.error("Error loading NBA data:", e);
    if (upcomingList) upcomingList.innerHTML = '<div class="sb-match-skeleton">Error loading NBA data.</div>';
  }
}

let standingsLoaded = false;

/**
 * Loads and renders NBA conference standings into the standings container.
 */
async function loadNbaStandings() {
  const container = document.getElementById('standings-container');
  if (!container) return;

  // Don't reload if already loaded (cache for this session)
  if (standingsLoaded && container.innerHTML.includes('standings-table')) return;

  container.innerHTML = '<div class="sb-match-skeleton">Loading standings...</div>';

  if (!window.NbaAPI?.getNbaStandings) {
    container.innerHTML = '<div class="sb-match-skeleton">Standings not available.</div>';
    return;
  }

  try {
    const standings = await window.NbaAPI.getNbaStandings();

    let html = '';

    // Render Eastern Conference
    html += renderConferenceTable('Eastern Conference', standings.east);
    // Render Western Conference
    html += renderConferenceTable('Western Conference', standings.west);

    container.innerHTML = html;
    standingsLoaded = true;
  } catch (e) {
    console.error('Error loading NBA standings:', e);
    container.innerHTML = '<div class="sb-match-skeleton">Error loading standings.</div>';
  }
}

/**
 * Renders a single conference standings table.
 * @param {string} title - Conference name
 * @param {Array} teams - Sorted team entries
 * @returns {string} HTML string
 */
function renderConferenceTable(title, teams) {
  if (!teams || teams.length === 0) {
    return `<div class="sb-match-skeleton">${title}: No data available.</div>`;
  }

  let rows = teams.map((team, i) => {
    const seed = i + 1;
    const isPlayoff = seed <= 6;
    const isPlayIn = seed >= 7 && seed <= 10;
    const seedClass = isPlayoff ? 'seed-playoff' : (isPlayIn ? 'seed-playin' : 'seed-out');

    return `
      <tr class="standings-row ${seedClass}">
        <td class="standings-seed">${seed}</td>
        <td class="standings-team">
          <img src="${team.logo}" class="standings-logo" onerror="this.style.display='none'">
          <span class="standings-abbr">${team.abbreviation}</span>
        </td>
        <td class="standings-record">${team.record}</td>
        <td class="standings-pct">${team.winPct}</td>
        <td class="standings-gb">${team.gb}</td>
        <td class="standings-streak">${team.streak}</td>
        <td class="standings-l10">${team.l10}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="standings-conference">
      <div class="standings-conf-header">${title}</div>
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>W-L</th>
            <th>PCT</th>
            <th>GB</th>
            <th>STRK</th>
            <th>L10</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// ===== SOCCER STANDINGS =====
let soccerStandingsLoaded = false;

/**
 * Loads and renders Argentine soccer standings by group.
 */
async function loadSoccerStandings() {
  if (soccerStandingsLoaded) return;

  const container = document.getElementById('standings-container');
  if (!container) return;

  container.innerHTML = '<div class="sb-match-skeleton">Loading standings...</div>';

  try {
    const data = await window.SoccerAPI.getArgentineStandings();
    if (!data.groups || data.groups.length === 0) {
      container.innerHTML = '<div class="sb-match-skeleton">No standings data available.</div>';
      return;
    }

    let html = '';
    data.groups.forEach(group => {
      html += renderSoccerGroupTable(group.name, group.teams);
    });

    container.innerHTML = html;
    soccerStandingsLoaded = true;
  } catch (e) {
    console.error('Error loading soccer standings:', e);
    container.innerHTML = '<div class="sb-match-skeleton">Error loading standings.</div>';
  }
}

/**
 * Renders a single group standings table for soccer.
 * @param {string} title - Group name (e.g. "Group A")
 * @param {Array} teams - Sorted team entries
 * @returns {string} HTML string
 */
function renderSoccerGroupTable(title, teams) {
  if (!teams || teams.length === 0) {
    return `<div class="sb-match-skeleton">${title}: No data available.</div>`;
  }

  let rows = teams.map((team, i) => {
    const pos = i + 1;
    // Top 4 qualify (green), 5-8 are in contention (amber), rest dimmed
    const posClass = pos <= 4 ? 'seed-playoff' : (pos <= 8 ? 'seed-playin' : 'seed-out');

    return `
      <tr class="standings-row ${posClass}">
        <td class="standings-seed">${pos}</td>
        <td class="standings-team">
          <img src="${team.logo}" class="standings-logo" onerror="this.style.display='none'">
          <span class="standings-abbr">${team.abbreviation}</span>
        </td>
        <td class="standings-record">${team.gamesPlayed}</td>
        <td class="standings-pct">${team.wins}</td>
        <td class="standings-gb">${team.draws}</td>
        <td class="standings-streak">${team.losses}</td>
        <td class="standings-pct">${team.goalsFor}</td>
        <td class="standings-gb">${team.goalsAgainst}</td>
        <td class="standings-streak">${team.goalDifference}</td>
        <td class="standings-l10" style="color: #FBBF24; font-weight: 700;">${team.points}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="standings-conference">
      <div class="standings-conf-header">${title}</div>
      <table class="standings-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Team</th>
            <th>GP</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>GF</th>
            <th>GA</th>
            <th>GD</th>
            <th>PTS</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// ===== NBA CALENDAR (Day-by-Day) =====
let calendarDate = new Date(); // current calendar date
let calendarLoading = false;

/**
 * Formats a Date to YYYYMMDD for ESPN API.
 * @param {Date} d
 * @returns {string}
 */
function formatDateForApi(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

/**
 * Formats a Date for display (e.g. "Tue, Mar 3, 2026").
 * @param {Date} d
 * @returns {string}
 */
function formatDateDisplay(d) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

/**
 * Checks if two dates are the same calendar day.
 */
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

/**
 * Loads and renders the NBA calendar for the current calendarDate.
 */
async function loadNbaCalendar() {
  const container = document.getElementById('calendar-container');
  if (!container || calendarLoading) return;

  calendarLoading = true;
  const dateStr = formatDateForApi(calendarDate);
  const displayDate = formatDateDisplay(calendarDate);
  const isToday = isSameDay(calendarDate, new Date());
  const todayLabel = isToday ? ' (Today)' : '';

  container.innerHTML = `
    <div class="cal-header">
      <button class="cal-nav-btn" id="cal-prev">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <div class="cal-date-info">
        <span class="cal-date-text">${displayDate}${todayLabel}</span>
      </div>
      <button class="cal-nav-btn" id="cal-next">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
    <div class="cal-games-list">
      <div class="sb-match-skeleton">Loading games...</div>
    </div>
  `;

  // Attach nav listeners
  document.getElementById('cal-prev')?.addEventListener('click', () => calendarNav(-1));
  document.getElementById('cal-next')?.addEventListener('click', () => calendarNav(1));

  try {
    const games = await window.NbaAPI.getNbaSchedule(dateStr);
    renderCalendarDay(container, games, displayDate, todayLabel);
  } catch (e) {
    console.error('Error loading calendar:', e);
    container.querySelector('.cal-games-list').innerHTML =
      '<div class="sb-match-skeleton">Error loading schedule.</div>';
  }
  calendarLoading = false;
}

/**
 * Renders games for a calendar day.
 */
function renderCalendarDay(container, games, displayDate, todayLabel) {
  const gamesList = container.querySelector('.cal-games-list');
  if (!gamesList) return;

  if (!games || games.length === 0) {
    gamesList.innerHTML = '<div class="sb-match-skeleton">No games scheduled for this date.</div>';
    return;
  }

  // Update game count
  const dateInfo = container.querySelector('.cal-date-info');
  if (dateInfo) {
    dateInfo.innerHTML = `
      <span class="cal-date-text">${displayDate}${todayLabel}</span>
      <span class="cal-game-count">${games.length} game${games.length !== 1 ? 's' : ''}</span>
    `;
  }

  let html = '';
  games.forEach(game => {
    const isLive = game.statusState === 'in';
    const isCompleted = game.completed;

    let statusHtml = '';
    if (isLive) {
      statusHtml = `<span class="cal-live-badge">LIVE</span> <span class="cal-status">${game.statusDetail}</span>`;
    } else if (isCompleted) {
      statusHtml = `<span class="cal-status cal-final">Final</span>`;
    } else {
      statusHtml = `<span class="cal-status">${game.statusDetail}</span>`;
    }

    const showScore = isLive || isCompleted;

    html += `
      <div class="cal-game-card ${isLive ? 'cal-game-live' : ''}">
        <div class="cal-game-status-row">
          ${statusHtml}
        </div>
        <div class="cal-teams">
          <div class="cal-team-row">
            <img src="${game.awayTeam.logo}" class="cal-team-logo" onerror="this.style.display='none'">
            <span class="cal-team-name">${game.awayTeam.abbreviation}</span>
            <span class="cal-team-record">${game.awayTeam.record}</span>
            ${showScore ? `<span class="cal-team-score">${game.awayTeam.score}</span>` : ''}
          </div>
          <div class="cal-team-row">
            <img src="${game.homeTeam.logo}" class="cal-team-logo" onerror="this.style.display='none'">
            <span class="cal-team-name">${game.homeTeam.abbreviation}</span>
            <span class="cal-team-record">${game.homeTeam.record}</span>
            ${showScore ? `<span class="cal-team-score">${game.homeTeam.score}</span>` : ''}
          </div>
        </div>
        <div class="cal-game-meta">
          ${game.venue ? `<span class="cal-venue">${game.venue}</span>` : ''}
          ${game.broadcast ? `<span class="cal-broadcast">${game.broadcast}</span>` : ''}
        </div>
      </div>
    `;
  });

  gamesList.innerHTML = html;
}

/**
 * Navigate calendar by +/- days.
 * @param {number} delta - Number of days to move (1 or -1)
 */
function calendarNav(delta) {
  calendarDate.setDate(calendarDate.getDate() + delta);
  loadNbaCalendar();
}

/**
 * Renders NBA match cards into live and upcoming sections
 * @param {Array} matches - Array of NBA match objects
 */
function renderNbaMatches(matches) {
  const landingLiveList = document.getElementById("sb-landing-live-list");
  const landingSectionTitle = document.getElementById("sb-landing-section-title");
  const liveList = document.getElementById("sb-live-list");
  const upcomingList = document.getElementById("sb-upcoming-list");
  const recentList = document.getElementById("sb-recent-list");
  const liveSection = document.getElementById("sb-live-section");

  // Clear all lists
  if (landingLiveList) landingLiveList.innerHTML = "";
  if (liveList) liveList.innerHTML = "";
  if (upcomingList) upcomingList.innerHTML = "";
  if (recentList) recentList.innerHTML = "";

  let hasLive = false;
  const liveCards = [];
  const upcomingCards = [];

  if (!matches || matches.length === 0) {
    if (landingSectionTitle) landingSectionTitle.textContent = "Upcoming Matches";
    if (upcomingList) upcomingList.innerHTML = '<div class="sb-match-skeleton">No NBA games scheduled for today.</div>';
    if (landingLiveList) landingLiveList.innerHTML = '<div class="sb-match-skeleton">No NBA games scheduled for today.</div>';
    if (liveSection) liveSection.style.display = 'none';
    return;
  }

  const defaultLogo = 'https://www.thesportsdb.com/images/media/league/badge/oa38yp1680190067.png';

  matches.forEach(match => {
    try {
      const matchDate = new Date(match.date);
      let displayTime = '';
      if (match.isLive) {
        displayTime = `${match.periodDetail} ${match.clock}`.trim() || 'LIVE';
      } else {
        displayTime = matchDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }

      const matchHtml = `
        <div class="sb-match-card">
          <div class="sb-match-header">
            <span class="sb-match-time">${displayTime}</span>
            ${match.isLive
          ? '<div class="sb-live-tag animate-blink-red"><span class="material-symbols-outlined" style="font-size:12px">bolt</span>LIVE</div>'
          : '<span>Upcoming</span>'}
          </div>
          <div class="sb-match-body">
            <div class="sb-team-row">
              <div class="sb-team-info">
                <img src="${match.homeLogo || defaultLogo}" class="sb-team-logo" onerror="this.src='${defaultLogo}'">
                <span class="sb-team-name">${match.homeTeam}</span>
              </div>
              <span class="sb-score">${match.isLive ? match.homeScore : '–'}</span>
            </div>
            <div class="sb-team-row">
              <div class="sb-team-info">
                <img src="${match.awayLogo || defaultLogo}" class="sb-team-logo" onerror="this.src='${defaultLogo}'">
                <span class="sb-team-name">${match.awayTeam}</span>
              </div>
              <span class="sb-score">${match.isLive ? match.awayScore : '–'}</span>
            </div>
          </div>
        </div>
      `;

      if (match.isLive) {
        liveCards.push(matchHtml);
        hasLive = true;
      } else {
        upcomingCards.push(matchHtml);
      }
    } catch (err) {
      console.error("Error rendering NBA match:", err, match);
    }
  });

  // --- Full sportsbook view ---
  if (liveSection) liveSection.style.display = hasLive ? "block" : "none";
  if (liveList) liveList.innerHTML = liveCards.join('');
  if (upcomingList) upcomingList.innerHTML = upcomingCards.join('') || '<div class="sb-match-skeleton">No upcoming NBA games today.</div>';

  // --- Landing view ---
  if (landingSectionTitle) {
    landingSectionTitle.textContent = hasLive ? "Live Now" : "Upcoming Matches";
  }

  if (landingLiveList) {
    if (hasLive) {
      landingLiveList.innerHTML = liveCards.join('');
      if (upcomingCards.length > 0) {
        landingLiveList.innerHTML += '<div class="sb-list-header" style="margin-top:16px;"><h2 class="sb-list-title">Upcoming Matches</h2></div>' + upcomingCards.join('');
      }
    } else {
      landingLiveList.innerHTML = upcomingCards.join('') || '<div class="sb-match-skeleton">No NBA games scheduled for today.</div>';
    }
  }

  // Updated timestamp
  const updateTime = new Date().toLocaleTimeString();
  const updateBadge = `<div style="font-size:10px; color:#6b7280; text-align:center; padding-top:8px; width:100%;">Updated: ${updateTime}</div>`;
  if (upcomingList) upcomingList.innerHTML += updateBadge;
  if (landingLiveList) landingLiveList.innerHTML += updateBadge;
  if (hasLive && liveList) liveList.innerHTML += updateBadge;

  console.log(`NBA: Rendered ${matches.length} matches (${liveCards.length} live, ${upcomingCards.length} upcoming) at ${updateTime}`);

  // Update NBA live flag and manage its refresh timer
  nbaHasLive = hasLive;
  if (currentSport === 'nba') {
    if (hasLive && !nbaRefreshInterval) startNbaRefresh();
    if (!hasLive && nbaRefreshInterval) { clearInterval(nbaRefreshInterval); nbaRefreshInterval = null; console.log('NBA: no live games, auto-refresh stopped'); }
  }
}
