function clearExpiredPasswords() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['recentPasswords'], function(result) {
        let recentPasswords = result.recentPasswords || {};
        const currentTime = Date.now();
        let hasChanges = false;
        
        Object.keys(recentPasswords).forEach(hostname => {
          console.log('Recent passwords:', recentPasswords[hostname].addedTime);
          if (currentTime > recentPasswords[hostname].addedTime + 600000) {
            delete recentPasswords[hostname];
            hasChanges = true;
          }
        });
  
        if (hasChanges) {
          chrome.storage.local.set({ recentPasswords }, () => resolve(true));
        } else {
          resolve(false);
        }
      });
    });
  }

  

clearExpiredPasswords()