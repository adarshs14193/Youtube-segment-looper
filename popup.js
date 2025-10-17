document.getElementById('loopBtn').addEventListener('click', async () => {
    const start = document.getElementById('startTime').value.trim();
    const end = document.getElementById('endTime').value.trim();
    const messageElement = document.getElementById('message'); // Assuming a message element exists
    if (!start || !end) {
        messageElement.textContent = 'Please enter both start and end times.';
        messageElement.style.color = 'red'; // Optional: style for errors
        return;
    }
    messageElement.textContent = ''; // Clear any previous messages
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id, {action: 'startLoop', start, end});
});

document.getElementById('stopBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    chrome.tabs.sendMessage(tab.id, {action: 'stopLoop'});
});