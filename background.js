// To be injected to the active tab
// Allows for copy without extension having its own tab
function contentCopy(text) {
    if (window.isSecureContext && navigator.clipboard) {
        navigator.clipboard.writeText(text);
        alert("\".AspNet.Cookies\" copied to clipboard");
        // navigator.clipboard only works on HTTPS websites, so alert the user
    } else {
        alert("Have focus on an HTTPS website to allow for copying");
    }
}

// If no cookie is available, alert the user
function noCookie() {
    alert("No cookie available. Please go to https://myred.unl.edu and once authenticated, visit https://unl.collegescheduler.com to retrieve the cookie");
}

// Warn the user that they need to enable permissions
function permissionWarn() {
    alert("You need to allow access to *://unl.collegescheduler.com/* in order to use the extension");
}

// When the extension is clicked
chrome.action.onClicked.addListener(async () => {
    // Request the "host_permissions" to access all URLs
    chrome.permissions.request({ origins: ['*://unl.collegescheduler.com/*'] }, (granted) => {
        if (granted) {
            // Permission granted, you can now access *://unl.collegescheduler.com/* URLs
            console.log('Permission granted for *://unl.collegescheduler.com/*');
            // Find the tab id of the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                // Get the cookie
                chrome.cookies.get({ url: "https://unl.collegescheduler.com", name: ".AspNet.Cookies" })
                    .then((cookie) => {
                        // If the cookie exists, copy it to the clipboard
                        if (cookie && cookie.value) {
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: contentCopy,
                                args: [cookie.value]
                            });
                        } else {
                            // Else, tell the user to get the cookie
                            chrome.scripting.executeScript({
                                target: { tabId: tabs[0].id },
                                func: noCookie
                            });
                        }
                    })
                    .catch(function (error) {
                        // An error occurred while retrieving the cookie
                        console.error('Error retrieving cookie:', error);
                        chrome.scripting.executeScript({
                            target: { tabId: tabs[0].id },
                            func: noCookie
                        });
                    });
            });
        } else {
            // Permission denied or not granted
            console.log('Permission denied for *://unl.collegescheduler.com/*');
            // Find the tab id of the active tab
            chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                // Alert user of permissions needed
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: permissionWarn
                });
            });
        }
    });
});
