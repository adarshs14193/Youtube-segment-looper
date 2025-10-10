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
            alert('No video element found on this page.');
            return;
        }

        const start = timeToSeconds(message.start);
        const end = timeToSeconds(message.end);

        if (isNaN(start) || isNaN(end) || start >= end) {
            alert('Invalid start or end time.');
            return;
        }

        clearInterval(window.loopInterval);
        video.currentTime = start;
        window.loopInterval = setInterval(() => {
            if (video.currentTime >= end) {
                video.currentTime = start;
            } }, 500);
        alert(`Looping from ${message.start} to ${message.end}`);
    } else if (message.action === 'stopLoop') {
        clearInterval(window.loopInterval);
        alert('Looping stopped.');
    }   });

// Initialize loopInterval to avoid undefined errors
window.loopInterval = null; 