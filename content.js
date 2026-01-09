const TARGET_ACCOUNT = "Gamblor Casino";

// escanear tweets existentes al cargar
console.log("X post detector: post encontrado");
scanExistingTweets();

// escanear tweets nuevos
chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local") {
        scanExistingTweets();
    }
});

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

    // Removemos estilos de borde antiguos si existen
    tweet.classList.remove("detected-tweet");

    // Buscar la barra de acciones (footer con likes, rt, etc.)
    // Suele ser un div con role="group"
    const actionsBar = tweet.querySelector('div[role="group"]');

    if (actionsBar) {
        // Crear contenedor del botón
        const btnContainer = document.createElement("div");
        btnContainer.className = "gamblor-button-wrapper";

        // Crear Botón
        const btn = document.createElement("button");
        btn.className = "gamblor-bet-button";

        // Icono SVG (reconstruido de la imagen)
        const svgIcon = `
        <svg class="gamblor-icon-svg" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M15.42 5l-.71.71c-.9.9-2.16 1.4-3.5 1.4s-2.61-.5-3.5-1.4L7 5c-.55-.55-1.45-.55-2 0l3 7c-.55.55-.55 1.45 0 2 21.71.71c.9.9 1.4 2.16 1.4 3.5s-.5 2.61-1.4 3.5L3 17.41c-.55-.55-.55 1.45 0 2l2 2c.55.55 1.45.55 2 0l.71-.71c.9-.9 2.16-1.4 3.5-1.4s2.61.5 3.5 1.4zM12 16.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 11c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"></path>
        </svg>`;

        btn.innerHTML = `${svgIcon}<span class="gamblor-btn-text">Place Bet</span>`;

        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({
                action: "openGamblorNotification",
                type: type // Pasamos el tipo al background
            });
        };

        btnContainer.appendChild(btn);

        // Insertar ANTES de la barra de acciones para que quede debajo del contenido
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
