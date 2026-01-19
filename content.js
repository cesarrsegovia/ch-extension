const TARGET_ACCOUNT = "Gamblor Casino";
const isTw = window.location.hostname.includes("twitter.com") || window.location.hostname.includes("x.com");

if (isTw) {
    scanExistingTweets();
}

createFloatingTrigger();

// escanear tweets nuevos (Solo en X)
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" && isTw) {
        scanExistingTweets();
    }
});

// detectar conexión del Side Panel para ocultar/mostrar el trigger
chrome.runtime.onConnect.addListener((port) => {
    if (port.name === "gamblor-sidepanel") {
        const trigger = document.getElementById("gamblor-floating-trigger");
        if (trigger) {
            trigger.style.display = "none";
        }

        port.onDisconnect.addListener(() => {
            if (trigger) {
                trigger.style.display = "flex";
            }
        });
    }
});

function createFloatingTrigger() {
    if (document.getElementById("gamblor-floating-trigger")) return;

    const triggerUrl = chrome.runtime.getURL("image/logo_icon.png");

    // Contenedor principal
    const container = document.createElement("div");
    container.id = "gamblor-floating-trigger";
    container.className = "gamblor-floating-trigger";

    // Close Button (X)
    const closeBtn = document.createElement("div");
    closeBtn.className = "gamblor-trigger-close";
    closeBtn.innerText = "×";

    closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // evitar que abra el panel
        container.remove(); // eliminar el trigger del DOM
    };

    // icono principal
    const icon = document.createElement("img");
    icon.src = triggerUrl;
    icon.className = "gamblor-floating-icon";

    container.appendChild(closeBtn);
    container.appendChild(icon);

    // accion principal: abrir side panel
    container.onclick = () => {
        chrome.runtime.sendMessage({
            action: "openSidePanel"
        });
    };

    document.body.appendChild(container);
}

function scanExistingTweets() {
    const tweets = document.querySelectorAll('article[data-testid="tweet"]');
    tweets.forEach(processTweet);
}

function processTweet(tweet) {
    if (tweet.dataset.processedByDetector) return;
    tweet.dataset.processedByDetector = "true";

    // detecta exclusivamente por cuenta
    const userNames = tweet.querySelector('[data-testid="User-Name"]');
    if (userNames && userNames.innerText.includes(TARGET_ACCOUNT)) {

        let type = "default";
        const tweetText = tweet.querySelector('[data-testid="tweetText"]');
        if (tweetText && tweetText.innerText.toLowerCase().includes("premier league")) {
            type = "premier_league";
        }

        highlightTweet(tweet, type);
        // chrome.runtime.sendMessage({ action: "openGamblorNotification" }); // Ya no auto-abrimos, solo al click
    }
}

function highlightTweet(tweet, type = "default") {
    if (tweet.classList.contains("gamblor-processed")) return;
    tweet.classList.add("gamblor-processed");

    // se remueven estilos de borde antiguos si existen
    tweet.classList.remove("detected-tweet");

    // buscar la barra de acciones 
    // suele ser un div con role="group"
    const actionsBar = tweet.querySelector('div[role="group"]');

    if (actionsBar) {
        // crear contenedor del botón
        const btnContainer = document.createElement("div");
        btnContainer.className = "gamblor-button-wrapper";

        // crear botón
        const btn = document.createElement("button");
        btn.className = "gamblor-bet-button";

        // icono imagen
        const imgUrl = chrome.runtime.getURL("image/logo_icon.png");
        const imgIcon = `<img src="${imgUrl}" class="gamblor-icon-img" />`;

        // tooltip con cuotas y live
        const tooltipHtml = `
            <div class="gamblor-tooltip">
                <span style="color: #bab29c; font-weight: 500;">Odds:</span> <span style="color: #f2b90d;">2.35</span>
                <span style="margin: 0 6px; color: #444;">|</span>
                <span class="gamblor-live-indicator"></span> <span style="color: #ff4444; letter-spacing: 0.05em;">LIVE</span>
            </div>
        `;

        btn.innerHTML = `${imgIcon}<span class="gamblor-btn-text">Place Bet</span>${tooltipHtml}`;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({
                action: "openGamblorNotification",
                type: type // Pasamos el tipo al background
            });
        };

        btnContainer.appendChild(btn);

        // insertar ANTES de la barra de acciones para que quede debajo del contenido
        actionsBar.parentNode.insertBefore(btnContainer, actionsBar);
    }
}

// observador del scroll
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.matches && node.matches('article[data-testid="tweet"]')) {
                    processTweet(node);
                } else {
                    const tweets = node.querySelectorAll?.('article[data-testid="tweet"]');
                    tweets?.forEach(processTweet);
                }
            }
        });
    }
});

observer.observe(document.body, { childList: true, subtree: true });
