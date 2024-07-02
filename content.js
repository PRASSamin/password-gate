let isPromptShown = false;
let passwordPrompt = null;
const lockedPageUrl = chrome.runtime.getURL("locked.html");


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "checkPassword" && !isPromptShown) {
    isPromptShown = true;
    chrome.runtime.sendMessage({ action: "passwordPromptOpened" });
    handlePasswordCheck(sendResponse);
    sendResponse({status: "received"});
    return true;
  }
});

function handlePasswordCheck(sendResponse) {
  clearFailedAttempts().then(getIncorrectHistory)
    .then((result) => {
      if (result && result.incorrectAttempts === 3) {
        document.body.innerHTML = "Too many incorrect attempts, please try again later.";
        const lockedPageUrl = chrome.runtime.getURL("locked.html");
        const lockedsiteUrl = encodeURIComponent(window.location.href);
      const urlWithParams = `${lockedPageUrl}?attempts=${result.incorrectAttempts}&cooldown=${result.cooldownEnd}&url=${lockedsiteUrl}`;
      window.location.href = urlWithParams;
        return;
      }
      return getRecentPassword();
    })
    .then((result) => {
      if (result && result.password) {
        sendResponse({ status: "already_saved" });
        return;
      } else {
        showPasswordPrompt(sendResponse);
      }
    });
}




function showPasswordPrompt(callback) {
  passwordPrompt = document.createElement("div");
  passwordPrompt.id = "password-prompt";
  passwordPrompt.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    border: none;
  `;
  passwordPrompt.innerHTML = `
    <style>
        button {
          -webkit-user-select: none;
             -moz-user-select: none;
              -ms-user-select: none;
                  user-select: none;
          outline: none;
          border: none;
        }
  
        * {
          margin: 0;
          padding: 0;
          -webkit-box-sizing: border-box;
                  box-sizing: border-box;
          font-family: "Poppins", sans-serif;
        }
  
        body {
          height: 100vh;
          position: fixed;
          width: 100%;
          overflow: hidden;
        }
        input {
          outline: none;
          border: none;
        }
  
        .background {
          background-color: rgba(0, 0, 0, 0.441);
          width: 100%;
          height: 100%;        
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 10;
        }
  
        .content {
          position: absolute;
          top: 50%;
          left: 50%;
          -webkit-transform: translate(-50%, -50%);
              -ms-transform: translate(-50%, -50%);
                  transform: translate(-50%, -50%);
          z-index: 11;
          text-align: center;
        }
  
        .form {
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -ms-flex-wrap: wrap;
              flex-wrap: wrap;
          max-width: 500px;
          width: 100%;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
              -ms-flex-direction: column;
                  flex-direction: column;
          -webkit-box-align: center;
              -ms-flex-align: center;
                  align-items: center;
          background: white;
          border-radius: 10px;
        }
  
        .form-title {
          font-size: 22px;
          font-weight: 600;
          color: rgb(78, 77, 77);
          margin-bottom: 20px;
          max-width: 70%;
        }
  
        .top {
          width: 100%;
          height: 150px;
          background-color: purple;
          border-radius: 10px 10px 0 0;
          position: relative;
        }
  
        .top img {
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 100%;
          left: 50%;
          -webkit-transform: translate(-50%, -50%);
              -ms-transform: translate(-50%, -50%);
                  transform: translate(-50%, -50%);
        }
  
        .img-border {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          border: 3px solid white;
          border-bottom: none;
          border-left: none;
          border-right: none;
          position: absolute;
          top: 100%;
          left: 50%;
          -webkit-transform: translate(-50%, -50%);
              -ms-transform: translate(-50%, -50%);
                  transform: translate(-50%, -50%);
        }
  
        .star-1 {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          position: absolute;
          top: 60%;
          left: 40%;
          -webkit-transform: translate(-100%, -50%);
              -ms-transform: translate(-100%, -50%);
                  transform: translate(-100%, -50%);
        }
  
        .star-1 svg {
          color: white;
          width: 25px;
          height: 25px;
          rotate: 45deg;
        }
  
        .star-2 {
          width: 50px;
          height: 50%;
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 55%;
          -webkit-transform: translate(-100%, -50%);
              -ms-transform: translate(-100%, -50%);
                  transform: translate(-100%, -50%);
        }
  
        .star-2 svg {
          color: white;
          width: 10px;
          height: 10px;
        }
  
        .form-content {
          padding: 20px;
          margin-top: 40px;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
              -ms-flex-direction: column;
                  flex-direction: column;
          -webkit-box-pack: center;
              -ms-flex-pack: center;
                  justify-content: center;
          -webkit-box-align: center;
              -ms-flex-align: center;
                  align-items: center;
        }
  
        .pass-input {
          width: 100%;
          display: -webkit-box;
          display: -ms-flexbox;
          display: flex;
          margin-top: 30px;
          -webkit-box-orient: vertical;
          -webkit-box-direction: normal;
              -ms-flex-direction: column;
                  flex-direction: column;
          -webkit-box-pack: start;
              -ms-flex-pack: start;
                  justify-content: start;
          -webkit-box-align: start;
              -ms-flex-align: start;
                  align-items: start;
        }
  
        .pass-input label {
          border-radius: 5px;
          z-index: 10;
          text-align: start;
          margin-left: 10px;
          padding: 0px 5px;
          color: #424242;
          background: white;
          font-size: 15px;
          font-weight: 400;
        }
  
        .pass-input input {
          border: 1.5px solid #000000;
          padding: 10px 10px;
                    background-color: transparent;
          border-radius: 5px;
          color: #000;
          width: 100%;
          margin-top: -10px;
          -webkit-transition: 0.3s all ease-in-out;
          -o-transition: 0.3s all ease-in-out;
          transition: 0.3s all ease-in-out;
        }
  
  
        .submit-btn {
          width: 50%;
          margin-top: 20px;
          padding: 10px 10px;
          border-radius: 5px;
          background: #000000;
          color: white;
          font-weight: 500;
          font-size: 15px;
          -webkit-transition: 0.3s all ease-in-out;
          -o-transition: 0.3s all ease-in-out;
          transition: 0.3s all ease-in-out;
        }
  
        .submit-btn:hover {
          background: #424242;
          cursor: pointer;
        }
  
        @media (max-width: 768px) {
          .content {
            width: 90%;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            -webkit-box-pack: center;
                -ms-flex-pack: center;
                    justify-content: center;
          }
          .form {
            width: 90%;
          }
  
          .form-title {
            font-size: 18px;
          }
  
          .submit-btn {
            width: 70%;
          }
  
          .top {
            height: 120px;
          }
  
          .top img {
            width: 80px;
            height: 80px;
          }
  
          .img-border {
            width: 100px;
            height: 100px;
          }
  
          .star-1 svg {
            width: 20px;
            height: 20px;
          }
  
          .star-2 svg {
            width: 8px;
            height: 8px;
          }
        }
  
        @media (max-width: 480px) {
          .form-title {
            font-size: 16px;
          }
  
          .submit-btn {
            width: 80%;
          }
  
          .pass-input input {
            padding: 8px 8px;
          }
  
          .submit-btn {
            font-size: 14px;
            padding: 8px 8px;
          }
        }
    </style>
    <body>
      <div class="background"></div>
      <div class="content">
        <div class="form">
          <div class="top">
            <div class="star-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                class="bi bi-stars"
                viewBox="0 0 16 16"
              >
                <path
                  d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"
                />
              </svg>
            </div>
            <div class="star-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-star-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
                />
              </svg>
            </div>
            <div class="img-border"></div>
            <img src="https://i.ibb.co/RpGy0nB/lock.png" alt="lock" border="0">
          </div>
          <div class="form-content">
            <h1 class="form-title">Enter The Password To Access This Site</h1>
            <div class="pass-input">
              <label for="password">Password</label>
              <input type="password" id="password" />
            </div>
            <button class="submit-btn">Submit</button>
          </div>
        </div>
      </div>
    </body>
  `;
  document.body.appendChild(passwordPrompt);

  let passwordInput = document.getElementById("password");
  let attemptMessage = document.getElementById("attempt-message");
  passwordInput.focus();

  getStoredPassword()
  .then((storedPassword) => {
    document.querySelector(".submit-btn").addEventListener("click", function() {
      const password = document.getElementById("password").value;
      checkAttempts(storedPassword, password, handleAttemptResult(callback));
    });
  })
    .catch((error) => {
      console.error("Error retrieving stored password:", error);
    });
}

function handleAttemptResult(callback) {
  return function(response) {
    if (response.status === "success") {
      callback(response);
    } else if (response.status === "locked") {
      const lockedPageUrl = chrome.runtime.getURL("locked.html");
      const lockedsiteUrl = encodeURIComponent(window.location.href);
    const urlWithParams = `${lockedPageUrl}?attempts=${siteData.incorrectAttempts}&cooldown=${siteData.cooldownEnd}&url=${lockedsiteUrl}`;
    window.location.href = urlWithParams;
    } else {
      displayAttemptMessage(response.message);
    }
  };
}

function getStoredPassword() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get("sitePassword", function (result) {
      chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve(result.sitePassword);
    });
  });
}

function getRecentPassword() {
  return getStorageData('recentPasswords', location.hostname);
}

function getIncorrectHistory() {
  return getStorageData('failedAttemptsData', location.hostname);
}

function getStorageData(key, hostname) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError.message);
      } else {
        const data = result.failedAttemptsData || {};
        resolve(data[hostname]);
      }
    });
  });
}

function storeRecentPassword(password) {
  const data = {
    [location.hostname]: {
      password: password,
      addedTime: Date.now()
    }
  };
  return updateStorageData('recentPasswords', data);
}

function updateStorageData(key, newData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function(result) {
      let existingData = result[key] || {};
      let updatedData = { ...existingData, ...newData };
      chrome.storage.local.set({ [key]: updatedData }, function() {
        chrome.runtime.lastError ? reject(chrome.runtime.lastError.message) : resolve();
      });
    });
  });
}

function checkAttempts(storedPassword, inputPassword, callback) {
  const maxAttempts = 3;
  const cooldownTime = 600000;
  const hostname = location.hostname;

  chrome.storage.local.get(["failedAttemptsData"], function(result) {
    let failedAttemptsData = result.failedAttemptsData || {};
    let siteData = failedAttemptsData[hostname] || { incorrectAttempts: 0, cooldownEnd: 0 };
    const currentTime = Date.now();

    if (currentTime < siteData.cooldownEnd) {
      callback({ status: "locked", message: "Too many incorrect attempts. You are locked out. Redirecting..." });
      const lockedPageUrl = chrome.runtime.getURL("locked.html");
      const lockedsiteUrl = encodeURIComponent(window.location.href);
    const urlWithParams = `${lockedPageUrl}?attempts=${siteData.incorrectAttempts}&cooldown=${siteData.cooldownEnd}&url=${lockedsiteUrl}`;
    window.location.href = urlWithParams;

      return;
    }

    if (inputPassword === storedPassword) {
      storeRecentPassword(inputPassword);
      callback({ status: "success" });
      isPromptShown = false;
      chrome.runtime.sendMessage({ action: "passwordPromptClosed" });
      document.body.removeChild(passwordPrompt);
      resetAttempts(failedAttemptsData, hostname, callback);
    } else {
      handleFailedAttempt(failedAttemptsData, hostname, siteData, maxAttempts, cooldownTime, currentTime, callback);
    }
  });
}

function resetAttempts(failedAttemptsData, hostname, callback) {
  failedAttemptsData[hostname] = { incorrectAttempts: 0, cooldownEnd: 0 };
  chrome.storage.local.set({ failedAttemptsData }, () => callback({ status: "success" }));
}

function handleFailedAttempt(failedAttemptsData, hostname, siteData, maxAttempts, cooldownTime, currentTime, callback) {
  siteData.incorrectAttempts++;
  if (siteData.incorrectAttempts >= maxAttempts) {
    siteData.cooldownEnd = currentTime + cooldownTime;
    failedAttemptsData[hostname] = siteData;
    chrome.storage.local.set({ failedAttemptsData }, () => {
      callback({ status: "locked", message: "Too many incorrect attempts. You are locked out. Redirecting..." });
      const lockedPageUrl = chrome.runtime.getURL("locked.html");
      const lockedsiteUrl = encodeURIComponent(window.location.href);
    const urlWithParams = `${lockedPageUrl}?attempts=${siteData.incorrectAttempts}&cooldown=${siteData.cooldownEnd}&url=${lockedsiteUrl}`;
    window.location.href = urlWithParams;
    });
  } else {
    failedAttemptsData[hostname] = siteData;
    chrome.storage.local.set({ failedAttemptsData }, () => {
      displayAlert(`Incorrect password. You have ${maxAttempts - siteData.incorrectAttempts} attempt(s) left.`);
      callback({ status: "failure", message: `Incorrect password. You have ${maxAttempts - siteData.incorrectAttempts} attempt(s) left.` });
    });
  }
}

function displayAlert(message) {
  const pushAlert = createAlertElement(message);
  document.body.appendChild(pushAlert);
  animateAlert(pushAlert);
}

function createAlertElement(message) {
  const pushAlert = document.createElement("div");
  pushAlert.classList.add("incorrect-alert");
  pushAlert.style.cssText = `
    transition: all 0.3s ease-in-out;
    position: fixed;
    top: 5px;
    right: 5px;
    z-index: 10000;
  `;
  pushAlert.innerHTML = `
    <style>
      .incorrect-alert {
        border: 1px solid #a31c1c;
        font-weight: 800;
        font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
        text-transform: uppercase;
        font-size: 14px;
        border-radius: 50px;
        color: #9e1f1f;
        background: #fee2e2;
        padding: 0px 15px !important;
        z-index: 10000;
      }
      @keyframes incorrect-alert {
        0%, 100% { transform: translateX(120%); }
        50%, 90% { transform: translateX(0); }
      }
    </style>
    <p>${message}</p>
  `;
  return pushAlert;
}

function animateAlert(alertElement) {
  alertElement.style.animation = "incorrect-alert 3000ms infinite";
  setTimeout(() => {
    alertElement.style.animation = "none";
    setTimeout(() => alertElement.remove(), 0);
  }, 3000);
}

function clearFailedAttempts() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["failedAttemptsData"], function(result) {
      let failedAttemptsData = result.failedAttemptsData || {};
      let hasChanges = false;
      const currentTime = Date.now();

      Object.keys(failedAttemptsData).forEach(hostname => {
        if (currentTime >= failedAttemptsData[hostname].cooldownEnd) {
          delete failedAttemptsData[hostname];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        chrome.storage.local.set({ failedAttemptsData }, () => resolve(true));
      } else {
        resolve(false);
      }
    });
  });
}

function createPasswordPromptElement() {
  const promptElement = document.createElement("div");
  promptElement.id = "password-prompt";
  promptElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 10000;
    border: none;
  `;
  promptElement.innerHTML = `
            <style>
              .incorrect-alert {
                border: 1px solid #a31c1c;
                font-weight: 800;
                font-family: 'Franklin Gothic Medium', 'Arial Narrow', Arial, sans-serif;
                text-transform: uppercase;
                font-size: 14px;
                border-radius: 50px;
                color: #9e1f1f;
                background: #fee2e2;
                padding: 0px 15px;
                z-index: 10000;
              }
              @keyframes incorrect-alert {
                0%, 100% {
                  transform: translateX(120%);
                }
                50% {
                  transform: translateX(0);
                }
                90% {
                  transform: translateX(0);
                }
              }
            </style>
            <p>Incorrect password. You have ${maxAttempts - siteData.incorrectAttempts} attempt(s) left.</p>  `;
  return promptElement;
}
