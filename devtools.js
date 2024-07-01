let isPasswordPromptOpen = false;
let devToolsOpened = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "passwordPromptOpened") {
        isPasswordPromptOpen = true;
        checkDevToolsStatus();
    } else if (request.action === "passwordPromptClosed") {
        isPasswordPromptOpen = false;
        checkDevToolsStatus();
    }
    sendResponse({status: "received"});
});

function checkDevToolsStatus() {
  const devToolsOpen = isDevToolsOpen();

  if (devToolsOpen && !devToolsOpened) {
    devToolsOpened = true;
    chrome.runtime.sendMessage({ action: "devtoolsOpened" }, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError.message);
      } else {
        return null
      }
    });
  }

  if (isPasswordPromptOpen) {
    setTimeout(checkDevToolsStatus, 100);
  } else {
    setTimeout(checkDevToolsStatus, 1000);
  }
}

function isDevToolsOpen() {
  const widthThreshold = window.outerWidth - window.innerWidth > 160;
  const heightThreshold = window.outerHeight - window.innerHeight > 160;
  
  let debuggerOpen = false;
  const startTime = new Date().getTime();
  if (!isPasswordPromptOpen) {
    return null;
  } else {
    debugger;
  }
  const endTime = new Date().getTime();
  const timeDiff = endTime - startTime;
  if (timeDiff > 100) {
    debuggerOpen = true;
  }

  return widthThreshold || heightThreshold || debuggerOpen;
}
