function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(part => {
        const parsed = parseInt(part, 10);
        return isNaN(parsed) ? NaN : parsed;
    });

    if (parts.some(isNaN)) {
        return NaN;
    }

    if (parts.length === 3) {
        // Check for negative hours, minutes, or seconds
        if (parts[0] < 0 || parts[1] < 0 || parts[2] < 0) return NaN;
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // Check for negative minutes or seconds
        if (parts[0] < 0 || parts[1] < 0) return NaN;
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // Check for negative seconds
        if (parts[0] < 0) return NaN;
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

    // Consolidate negative time checks with timeToSeconds validation
    if (start < 0 || end < 0) {
        console.error('Time values cannot be negative.');
        chrome.runtime.sendMessage({ action: 'loopError', message: 'Time values cannot be negative.' });
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
        // Optionally, you might want to retry finding the video element if it's not immediately available.
        // For simplicity here, we just log an error and send a message.
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
            // Small delay to ensure video element is stable after DOM load if needed.
            // In many cases, this might not be strictly necessary but adds robustness.
            setTimeout(() => initializeLoop(message.start, message.end), 100);
        } else if (message.action === 'stopLoop') {
            stopLoop();
        }
    });
});
