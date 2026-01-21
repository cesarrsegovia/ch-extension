chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openGamblorNotification") {
    // guardar el tipo de vista que queremos mostrar antes de abrir el popup
    const viewType = message.type || "default";
    chrome.storage.local.set({ currentView: viewType }, () => {
      // abrir el side panel
      if (sender.tab && sender.tab.windowId) {
        chrome.sidePanel
          .open({ windowId: sender.tab.windowId })
          .catch((error) => console.error("Error opening side panel:", error));
      } else {
        chrome.windows.getLastFocused().then((window) => {
          if (window && window.id) {
            chrome.sidePanel
              .open({ windowId: window.id })
              .catch((error) =>
                console.error("Error opening side panel:", error),
              );
          }
        });
      }
    });
  }

  if (message.action === "openSidePanel") {
    // priorizar la ventana del sender para no perder el contexto del user gesture
    if (sender.tab && sender.tab.windowId) {
      chrome.sidePanel
        .open({ windowId: sender.tab.windowId })
        .catch((error) => console.error("Error opening side panel:", error));
    } else {
      chrome.windows.getLastFocused().then((window) => {
        if (window && window.id) {
          chrome.sidePanel
            .open({ windowId: window.id })
            .catch((error) =>
              console.error("Error opening side panel:", error),
            );
        }
      });
    }
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Background received:", msg);

  if (msg.type === "OPEN_LOGIN") {
    chrome.windows.create(
      {
        url: "https://login.gamblor.io?provider=extension",
        type: "popup",
        width: 420,
        height: 640,
      },
      () => {
        console.log("Login window opened");
        sendResponse({ ok: true });
      },
    );

    return true; // REQUIRED for async response
  }
});

chrome.runtime.onMessageExternal.addListener((msg) => {
  console.log("Background received external message:", msg);
  if (msg.type === "EXTENSION_AUTH_SUCCESS") {
    chrome.storage.local.set({ authToken: msg.token });
  }
});
