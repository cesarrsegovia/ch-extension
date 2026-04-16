const TARGET_ACCOUNT = "FL-Sports";
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
    if (port.name === "fl-sports-sidepanel") {
        const trigger = document.getElementById("fl-sports-floating-trigger");
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
    if (document.getElementById("fl-sports-floating-trigger")) return;

    const triggerUrl = chrome.runtime.getURL("image/logo_icon.png");

    // Contenedor principal
    const container = document.createElement("div");
    container.id = "fl-sports-floating-trigger";
    container.className = "fl-sports-floating-trigger";

    // Close Button (X)
    const closeBtn = document.createElement("div");
    closeBtn.className = "fl-sports-trigger-close";
    closeBtn.innerText = "×";

    closeBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // evitar que abra el panel
        container.remove(); // eliminar el trigger del DOM
    };

    // icono principal
    const icon = document.createElement("img");
    icon.src = triggerUrl;
    icon.className = "fl-sports-floating-icon";

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
        // chrome.runtime.sendMessage({ action: "openSidePanel" }); // Ya no auto-abrimos, solo al click
    }
}

function highlightTweet(tweet, type = "default") {
    if (tweet.classList.contains("fl-sports-processed")) return;
    tweet.classList.add("fl-sports-processed");

    // se remueven estilos de borde antiguos si existen
    tweet.classList.remove("detected-tweet");

    // buscar la barra de acciones 
    // suele ser un div con role="group"
    const actionsBar = tweet.querySelector('div[role="group"]');

    if (actionsBar) {
        // crear contenedor del botón
        const btnContainer = document.createElement("div");
        btnContainer.className = "fl-sports-button-wrapper";

        // crear botón
        const btn = document.createElement("button");
        btn.className = "fl-sports-bet-button";

        // icono imagen
        const imgUrl = chrome.runtime.getURL("image/logo_icon.png");
        const imgIcon = `<img src="${imgUrl}" class="fl-sports-icon-img" />`;

        btn.innerHTML = `${imgIcon}<span class="fl-sports-btn-text" data-i18n="tweetViewMatch">View Match</span>`;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({
                action: "openSidePanel",
                type: type
            });
        };

        btnContainer.appendChild(btn);

        // insertar ANTES de la barra de acciones para que quede debajo del contenido
        actionsBar.parentNode.insertBefore(btnContainer, actionsBar);

        // Localize the newly added button
        if (typeof localizeHtmlPage === 'function') {
            localizeHtmlPage();
        }
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
