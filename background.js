chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
      chrome.tabs.get(tabId, (currentTab) => {
        if (chrome.runtime.lastError) {
          console.log(chrome.runtime.lastError.message);
          return;
        }
  
        // Check if the tab still exists and is not a restricted page
        if (currentTab && !currentTab.url.startsWith('chrome://') && !currentTab.url.startsWith('chrome-extension://')) {
          chrome.scripting.executeScript({
            target: { tabId: tabId },
            files: ['content.js']
          }).catch(error => {
            console.log('Script injection failed:', error.message);
          });
        }
      });
    }
  });