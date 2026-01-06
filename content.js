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
        highlightTweet(tweet);
        chrome.runtime.sendMessage({ action: "openGamblorNotification" });
    }
}

function highlightTweet(tweet) {
    tweet.classList.add("detected-tweet");

    // contenedor de insignia y botón
    if (!tweet.querySelector(".gamblor-action-container")) {
        const container = document.createElement("div");
        container.className = "gamblor-action-container";

        const badge = document.createElement("div");
        badge.className = "detected-badge";
        badge.textContent = "¡GAMBLOR DETECTADO!";

        const betBtn = document.createElement("button");
        betBtn.className = "gamblor-bet-button";
        betBtn.textContent = "BET";

        betBtn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            chrome.runtime.sendMessage({ action: "openGamblorNotification" });
        };

        container.appendChild(badge);
        container.appendChild(betBtn);
        tweet.appendChild(container);
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
