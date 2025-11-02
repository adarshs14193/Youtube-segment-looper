function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(part => {
        const parsed = parseInt(part, 10);
        return isNaN(parsed) || parsed < 0 ? NaN : parsed;
    });

    if (parts.some(isNaN)) {
        return NaN;
    }

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        return parts[0];
    } else {
        return NaN;
    }
}

function initializeLoop(startStr, endStr) {
    const video = document.querySelector('video');
    if (!video) {
        console.error('No video element found on this page.');
        chrome.runtime.sendMessage({ action: 'loopError', message: 'No video element found on this page.' });
        return;
    }

    const start = timeToSeconds(startStr);
    const end = timeToSeconds(endStr);

    if (isNaN(start) || isNaN(end)) {
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
        if (!video.paused && video.currentTime >= end) {
            video.currentTime = start;
        }
    }, 500);
    console.log(`Looping from ${startStr} to ${endStr}`);
    chrome.runtime.sendMessage({ action: 'loopStarted', start: startStr, end: endStr });
}

function stopLoop() {
    clearInterval(window.loopInterval);
    window.loopInterval = null;
    console.log('Looping stopped.');
    chrome.runtime.sendMessage({ action: 'loopStopped' });
}

function handleVideoError(e) {
    console.error('Video playback error:', e);
    if (window.loopInterval) {
        stopLoop();
        chrome.runtime.sendMessage({ action: 'loopError', message: 'A video playback error occurred.' });
    }
}

function setupVideoListeners() {
    const videoElement = document.querySelector('video');
    if (videoElement) {
        videoElement.addEventListener('error', handleVideoError);
    } else {
        console.error('No video element found on this page for listeners.');
        chrome.runtime.sendMessage({ action: 'loopError', message: 'No video element found on this page on initial load for listeners.' });
    }
}

// Initialize loopInterval to avoid undefined errors
window.loopInterval = null;

// Use DOMContentLoaded to ensure the DOM is ready before setting up listeners
document.addEventListener('DOMContentLoaded', () => {
    setupVideoListeners();

    // Listen for messages from the background script
    chrome.runtime.onMessage.addListener((message) => {
        if (message.action === 'startLoop') {
            setTimeout(() => initializeLoop(message.start, message.end), 100);
        } else if (message.action === 'stopLoop') {
            stopLoop();
        }
    });
});