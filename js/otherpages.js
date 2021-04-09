chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "ResendDOM") {
        sendResponse(null);
    }
});