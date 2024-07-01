let passwordCheckQueue = [];
let isCheckingPassword = new Map();

async function processPasswordCheckQueue() {
  console.log("Processing password check queue");
  while (passwordCheckQueue.length > 0) {
    let nextCheck = passwordCheckQueue.shift();
    if (!isCheckingPassword.get(nextCheck.tabId)) {
      isCheckingPassword.set(nextCheck.tabId, true);
      try {
        const response = await sendMessageToTab(nextCheck.tabId, { action: "checkPassword" });
        console.log("Password check response:", response);
        handlePasswordCheckResponse(nextCheck.tabId, response);
      } catch (error) {
        console.error(`Error checking password for tab ${nextCheck.tabId}:`, error);
        isCheckingPassword.set(nextCheck.tabId, false);
      }
    } else {
      passwordCheckQueue.push(nextCheck);
    }
  }
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(response);
      }
    });
  });
}

function handlePasswordCheckResponse(tabId, response) {
  if (response && response.status === "success") {
    isCheckingPassword.set(tabId, false);
  } else if (response && response.status === "prompt_shown") {
    isCheckingPassword.set(tabId, false);
  }
  processPasswordCheckQueue();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);
  const tabId = sender.tab ? sender.tab.id : null;
  if (request.action === "processNextInQueue") {
    if (tabId !== null) {
      isCheckingPassword.set(tabId, false);
    }
    processPasswordCheckQueue();
  } else if (["devtoolsOpened", "devtoolsClosed"].includes(request.action)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "checkDevTools", devToolsStatus: request.action }, (response) => {
          console.log("DevTools check response:", response);
          sendResponse(response); 
        });
      }
    });
  } else if (["passwordPromptOpened", "passwordPromptClosed"].includes(request.action)) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, request, (response) => {
          sendResponse(response); 
        });
      }
    });
  }
  return true; 
});

chrome.webNavigation.onCompleted.addListener((details) => {
  console.log("Navigation completed:", details);
  if (details.frameId === 0) {
    chrome.storage.local.get({ protectedSites: [] }, (data) => {
      const protectedSites = data.protectedSites;
      console.log("Protected sites:", protectedSites);
      if (protectedSites.some(site => details.url.startsWith(site))) {
        passwordCheckQueue.push({ tabId: details.tabId });
        processPasswordCheckQueue();
      }
    });
  }
});
