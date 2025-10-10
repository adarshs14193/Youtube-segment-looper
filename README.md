# YouTube Segment Looper

YouTube Segment Looper is a Chrome extension that allows you to loop a specific portion of any YouTube video. Simply set the start and end times in `hh:mm:ss` format, and the extension will continuously loop that segment — perfect for music practice, study clips, or tutorials.

---

## Features

- Loop any part of a YouTube video by specifying start and end times.
- Input times in `hh:mm:ss`, `mm:ss`, or `ss` format.
- Lightweight and responsive — all processing happens locally.
- No data collection — fully privacy-friendly.
- Clean UI with popup interface for ease of use.

---

## Tech Stack

- JavaScript (ES6+)
- Chrome Extension APIs (`chrome.tabs`, `chrome.runtime`)
- HTML5 video manipulation (`video.currentTime`)

---

## Installation (Developer Mode)

1. **Clone the repository**:


git clone https://github.com/yourusername/youtube-segment-looper.git
cd youtube-segment-looper

 2)Open Chrome extensions page:

 Go to chrome://extensions/

 Enable Developer Mode (top right)

 Load the extension:

 Click Load unpacked

 Select the cloned folder

 3)Use the extension:

 Open any YouTube video

 Click the YouTube Segment Looper icon in the Chrome toolbar

 Enter start and end times in hh:mm:ss format

 Click Loop Segment to start looping

 Click Stop Loop to end looping
