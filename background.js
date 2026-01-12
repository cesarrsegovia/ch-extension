chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openGamblorNotification") {

        // guardar el tipo de vista que queremos mostrar antes de abrir el popup
        const viewType = message.type || "default";
        chrome.storage.local.set({ "currentView": viewType }, () => {

            // intentar abrir el popup nativo de la extensión
            if (chrome.action && chrome.action.openPopup) {
                chrome.action.openPopup();
            } else {
                // fallback
                chrome.windows.create({
                    url: chrome.runtime.getURL("popup.html"),
                    type: "popup",
                    width: 375, // ajustado para móvil
                    height: 800,
                    focused: true
                });
            }
        });
    }
});
