function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;

    if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        seconds = parts[0];
    }
    return seconds;
}

chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'startLoop') {
        const video = document.querySelector('video');
        if (!video) {
            console.error('No video element found on this page.');
            chrome.runtime.sendMessage({ action: 'loopError', message: 'No video element found on this page.' });
            return;
        }

        const start = timeToSeconds(message.start);
        const end = timeToSeconds(message.end);

        if (isNaN(start) || isNaN(end) || start < 0 || end < 0) {
            console.error('Invalid time format provided.');
            chrome.runtime.sendMessage({ action: 'loopError', message: 'Invalid time format provided. Please use HH:MM:SS or MM:SS or SS.' });
            return;
        }
        if (start >= end) {
            console.error('Start time must be before end time.');
            chrome.runtime.sendMessage({ action: 'loopError', message: 'Start time must be before end time.' });
            return;
        }

        clearInterval(window.loopInterval);
        video.currentTime = start;
        window.loopInterval = setInterval(() => {
            // Add a small delay to ensure the video has updated its currentTime after potential reset
            // Also, check if the video is actually playing to avoid unnecessary resets
            if (video.currentTime >= end && !video.paused) {
                video.currentTime = start;
            }
        }, 500);
        console.log(`Looping from ${message.start} to ${message.end}`);
        chrome.runtime.sendMessage({ action: 'loopStarted', start: message.start, end: message.end });
    } else if (message.action === 'stopLoop') {
        clearInterval(window.loopInterval);
        window.loopInterval = null;
        console.log('Looping stopped.');
        chrome.runtime.sendMessage({ action: 'loopStopped' });
    }
});

// Initialize loopInterval to avoid undefined errors
window.loopInterval = null;

// Add a listener for potential video errors
const videoElement = document.querySelector('video');
if (videoElement) {
    videoElement.addEventListener('error', (e) => {
        console.error('Video playback error:', e);
        if (window.loopInterval) {
            clearInterval(window.loopInterval);
            window.loopInterval = null;
            chrome.runtime.sendMessage({ action: 'loopError', message: 'A video playback error occurred.' });
        }
    });
}
