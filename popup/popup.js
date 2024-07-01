document.addEventListener('DOMContentLoaded', () => {
    checkCurrentSite();
    checkIsPasswordAlreadySet();
  });
  
  function checkIsPasswordAlreadySet() {
    const inputContainer = document.querySelector('.password-input-container');
    const resetContainer = document.querySelector('.reset-container');
    chrome.storage.sync.get("sitePassword", (data) => {
      if (!data.sitePassword) {
        inputContainer.innerHTML = `
          <label>Password</label>
          <input class="password-input" type="password" id="password">
          <button id="save">Save</button>
        `;
        setupSaveButton();
      } else {
        resetContainer.innerHTML = `<button id="reset">Reset Password</button>`;
        setupResetButton();
      }
    });
  }
  
  function setupSaveButton() {
    const saveButton = document.getElementById('save');
    if (saveButton) {
      saveButton.addEventListener('click', () => {
        const password = document.getElementById('password').value;
        if (password) {
          chrome.storage.sync.set({ sitePassword: password }, () => {
            alert('Password saved successfully!');
          });
        } else {
          alert('Please enter a password.');
        }
      });
    }
  }
  
  function setupResetButton() {
    const resetButton = document.getElementById('reset');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        const resetContainer = document.querySelector('.reset-container');
        resetContainer.innerHTML = `
          <div class="input-one">
            <label>Old Password</label>
            <input class="password-input" type="password" id="old-password">
          </div>
          <div class="input-two">
            <label>New Password</label>
            <input class="password-input" type="password" id="new-password">
          </div>
          <button id="savenewpass">Reset</button>
        `;
        setupSaveNewPasswordButton();
      });
    }
  }
  
  function setupSaveNewPasswordButton() {
    const saveNewPassButton = document.getElementById('savenewpass');
    if (saveNewPassButton) {
      saveNewPassButton.addEventListener('click', () => {
        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;
        chrome.storage.sync.get("sitePassword", (data) => {
          if (data.sitePassword !== oldPassword) {
            alert('Incorrect old password!');
          } else {
            chrome.storage.sync.set({ sitePassword: newPassword }, () => {
              alert('Password reset successfully!');
            });
          }
        });
      });
    }
  }
  
  function checkCurrentSite() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentUrl = new URL(tabs[0].url).origin;
      chrome.storage.local.get({ protectedSites: [] }, (data) => {
        const protectedSites = data.protectedSites;
        const addRemoveDiv = document.getElementById('add-remove');
        if (protectedSites.includes(currentUrl)) {
          addRemoveDiv.innerHTML = `<button id="remove-site">Remove This Site from Protect</button>`;
          document.getElementById('remove-site').addEventListener('click', () => removeSite(currentUrl));
        } else {
          addRemoveDiv.innerHTML = `<button id="add-site">Add This Site to Protect</button>`;
          document.getElementById('add-site').addEventListener('click', () => addSite(currentUrl));
        }
      });
    });
  }
  
  function addSite(currentUrl) {
    chrome.storage.local.get({ protectedSites: [] }, (data) => {
      const protectedSites = data.protectedSites;
      if (!protectedSites.includes(currentUrl)) {
        protectedSites.push(currentUrl);
        chrome.storage.local.set({ protectedSites: protectedSites }, () => {
          alert(`${currentUrl} has been added to the protected sites list.`);
          checkCurrentSite();
        });
      } else {
        alert(`${currentUrl} is already in the protected sites list.`);
      }
    });
  }
  
  function removeSite(currentUrl) {
    const password = prompt('Please enter the password to remove this site from protection:');
    chrome.storage.sync.get("sitePassword", (data) => {
      if (password === data.sitePassword) {
        chrome.storage.local.get({ protectedSites: [] }, (data) => {
          const protectedSites = data.protectedSites;
          protectedSites.splice(protectedSites.indexOf(currentUrl), 1);
          chrome.storage.local.set({ protectedSites: protectedSites }, () => {
            alert(`${currentUrl} has been removed from the protected sites list.`);
            checkCurrentSite();
          });
        });
      } else {
        alert('Incorrect password.');
      }
    });
  }
  