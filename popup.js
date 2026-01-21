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
    } else if (view === "sportsbook") {
      showSportsbookView();
    } else if (view === "games") {
      showGamesView();
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
      } else if (view === "sportsbook") {
        showSportsbookView();
      } else if (view === "games") {
        showGamesView();
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
    chrome.storage.local.set({ currentView: "default" });
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
        provScrollContainer.scrollTo({
          left: provScrollContainer.scrollWidth,
          behavior: "smooth",
        });
      } else {
        provScrollContainer.scrollBy({ left: -160, behavior: "smooth" });
      }
    });

    btnProvNext.addEventListener("click", () => {
      const tolerance = 5;
      const maxScroll =
        provScrollContainer.scrollWidth - provScrollContainer.clientWidth;

      if (provScrollContainer.scrollLeft >= maxScroll - tolerance) {
        provScrollContainer.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        provScrollContainer.scrollBy({ left: 160, behavior: "smooth" });
      }
    });
  }
  // --- WITHDRAW NETWORK SELECTION ---
  const wdNetworkBtns = document.querySelectorAll(".wd-net-btn");
  wdNetworkBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      wdNetworkBtns.forEach((b) => b.classList.remove("active"));
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
});

function switchView(viewId) {
  if (viewId === "view-premier") {
    document.body.classList.add("premier-mode");
    document.body.classList.remove("success-mode");
  } else if (viewId === "view-success") {
    document.body.classList.add("success-mode");
    document.body.classList.remove("premier-mode");
  } else {
    document.body.classList.remove("premier-mode", "success-mode");
  }

  const views = document.querySelectorAll(".view-section");
  views.forEach((view) => {
    view.classList.remove("active");
  });

  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add("active");
  }
}

function showHomeView() {
  switchView("view-home");
  fetchMe();
}

function showPremierLeagueView() {
  switchView("view-premier");
}

function showSuccessView() {
  switchView("view-success");
}

function showHelpView() {
  switchView("view-help");
}

function showProfileView() {
  switchView("view-profile");
  fetchMe();
}

function showGamesView() {
  switchView("view-games");
  fetchMe();
}

function showDepositView() {
  switchView("view-deposit");
}

function showWithdrawView() {
  switchView("view-withdraw");
}

function showHistoryView() {
  switchView("view-history");
}

function showBetHistoryView() {
  switchView("view-bets");
}

function showSportsbookView() {
  switchView("view-sportsbook");
  fetchMe();

  const iframe = document.getElementById("sportsbook-frame");

  // iframe.src = "http://localhost:3000/sportsbook-extension";
  iframe.src = "https://preview.gamblor.io/sportsbook-extension";
}

// --- SPORTSBOOK VIEW NAVIGATION ---
const sportsbookView = document.getElementById("view-sportsbook");
if (sportsbookView) {
  const sbHomeBtn = document.getElementById("nav-btn-home-sb");
  if (sbHomeBtn) sbHomeBtn.addEventListener("click", () => showHomeView());

  const sbGamesBtn = document.getElementById("nav-btn-games-sb");
  if (sbGamesBtn) sbGamesBtn.addEventListener("click", () => showGamesView());

  const sbProfileBtn = sportsbookView.querySelector(".profile-nav-btn-sb");
  if (sbProfileBtn)
    sbProfileBtn.addEventListener("click", () => showProfileView());
}

const API_BASE = "https://api-staging.gamblor.io";

async function getToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get("authToken", (res) => {
      resolve(res.authToken);
    });
  });
}

async function fetchMe() {
  const { authToken } = await chrome.storage.local.get("authToken");

  if (!authToken) {
    console.log("Not logged in");
    return;
  }

  const res = await fetch(`${API_BASE}/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch /me");
    return;
  }

  const me = await res.json();
  console.log("Fetched /me successfully", me);
  renderUser(me);
}

function renderUser(user) {
  document.getElementById("username").textContent = user.name ?? "User";
  document.getElementById("balanceAmount").textContent =
    `$${user.balance}` ?? "$0.00";

  document.querySelectorAll(".user-balance").forEach((el) => {
    el.textContent = `${user.balance}` ?? "0.00";
  });

  if (user.avatar) {
    document.querySelector(".avatar-img").style.backgroundImage =
      `url("${user.avatar}")`;
  }

  document.getElementById("loginBtn").style.display = "none";
}

document.addEventListener("DOMContentLoaded", fetchMe);

document.getElementById("loginBtn").addEventListener("click", () => {
  console.log("Login button clicked");
  chrome.runtime.sendMessage({ type: "OPEN_LOGIN" });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.authToken) {
    fetchMe();
  }
});

function getAuthToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get("authToken", (res) => {
      resolve(res.authToken);
    });
  });
}

async function fetchSection(endpoint) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    console.error("Failed to fetch", endpoint);
    return [];
  }

  const data = await res.json();
  return data.items ?? [];
}

function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";

  card.innerHTML = `
    <img src="${game.image}" alt="${game.title}" />
    
    <div class="gc-info">
      <span class="gc-title">${game.title}</span>
      ${game.provider ? `<span class="gc-prov">${game.provider}</span>` : ""}
    </div>
    <div class="gc-border"></div>
  `;

  card.addEventListener("click", async () => {
    await chrome.storage.local.set({
      currentView: "game",
      currentGame: {
        slug: game.slug,
        mode: "real",
      },
    });

    showGameView({ slug: game.slug, mode: "real" });
    setGameTitle({
      title: game.title,
      provider: game.provider,
    });

    const lastFocusedWindow = await chrome.windows.getLastFocused();
    await chrome.sidePanel.open({ windowId: lastFocusedWindow.id });

    // window.close(); // close popup
  });

  return card;
}

async function renderSection(gridId, endpoint) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = ""; // clear placeholder

  const games = await fetchSection(endpoint);

  games.forEach((game) => {
    grid.appendChild(createGameCard(game));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderSection("continue-grid", "/games/section/recent?take=12&skip=0");

  renderSection(
    "trending-grid",
    "/games/section/trending?take=12&skip=0&sort=popular",
  );

  renderSection("liked-grid", "/games/section/liked?take=12&skip=0");
});

async function showGameView({ slug, mode }) {
  switchView("view-game");

  const token = await getAuthToken();

  const res = await fetch(`${API_BASE}/games/launch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      identifier: slug,
      demo: false,
      isMobile: true,
      locale: "en",
    }),
  });

  if (!res.ok) {
    console.error("Failed to launch game");
    return;
  }

  const { game_url } = await res.json();

  const iframe = document.getElementById("game-frame");
  iframe.src = game_url;
}

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data?.type) return;

  if (data.type === "RBackToHome" || data.type === "rgs-backToHome") {
    chrome.storage.local.set({ currentView: "default" });
    showHomeView();
  }

  if (data.type === "rgs-gameChange") {
    const newSlug = data.gameId;
    showGameView({ slug: newSlug, mode: "real" });
  }
});

document.getElementById("game-back-btn").addEventListener("click", () => {
  chrome.storage.local.set({ currentView: "default" });
  showHomeView();

  // optional: stop the game
  const iframe = document.getElementById("game-frame");
  if (iframe) iframe.src = "about:blank";
});

function setGameTitle({ title, provider }) {
  const el = document.getElementById("game-title");
  if (!el) return;
  console.log("Setting game title:", { title, provider });

  if (provider && title) {
    el.textContent = `${provider} · ${title}`;
  } else {
    el.textContent = title || "Game";
  }
}

document.getElementById("sportsbook-back-btn").addEventListener("click", () => {
  showHomeView();
  document.getElementById("sportsbook-frame").src = "about:blank";
});

window.addEventListener("message", (event) => {
  if (event.data?.type === "SPORTSBOOK_BACK") {
    showHomeView();
  }
});
