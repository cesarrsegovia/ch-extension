chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openGamblorNotification") {

        // guardar el tipo de vista que queremos mostrar antes de abrir el popup
        const viewType = message.type || "default";
        chrome.storage.local.set({ "currentView": viewType }, () => {

            // abrir el side panel
            if (sender.tab && sender.tab.windowId) {
                chrome.sidePanel.open({ windowId: sender.tab.windowId })
                    .catch((error) => console.error("Error opening side panel:", error));
            } else {
                chrome.windows.getLastFocused().then((window) => {
                    if (window && window.id) {
                        chrome.sidePanel.open({ windowId: window.id })
                            .catch((error) => console.error("Error opening side panel:", error));
                    }
                });
            }
        });
    }

    if (message.action === "openSidePanel") {
        // priorizar la ventana del sender para no perder el contexto del user gesture
        if (sender.tab && sender.tab.windowId) {
            chrome.sidePanel.open({ windowId: sender.tab.windowId })
                .catch((error) => console.error("Error opening side panel:", error));
        } else {
            chrome.windows.getLastFocused().then((window) => {
                if (window && window.id) {
                    chrome.sidePanel.open({ windowId: window.id })
                        .catch((error) => console.error("Error opening side panel:", error));
                }
            });
        }
    }
});
