chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openGamblorNotification") {
        // abrir popup de la extension
        if (chrome.action && chrome.action.openPopup) {
            chrome.action.openPopup();
        } else {
            // si el navegador no soporta openPopup, se abre la ventana original
            chrome.windows.create({
                url: chrome.runtime.getURL("popup.html"),
                type: "popup",
                width: 360,
                height: 450,
                focused: true
            });
        }
    }
});
