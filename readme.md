# README.md

# 🎥 Video Streaming Dashboard (React + FFmpeg)

## ⚠️ Important Note
The RTSP URL provided in the assignment is **not working**, so I used **static video files** instead of a live RTSP stream.


Backend uses FFmpeg, so **no public deployment URL** is possible because free hosting platforms do not allow FFmpeg, RTSP ingest, or background streaming services.

# 🛠️ Backend Setup (FFmpeg)

# Make sure STREAM_COUNT is set up to 6 in src/streamManager.js:
#   const STREAM_COUNT = 6;
#
# Also note:
# - This project uses a static local video file (demoVideo.mp4)
# - Original RTSP URLs are NOT used because they are unreliable /
#   blocked by many networks and free providers do not support this.

# Start backend (serves HLS on http://localhost:4000)
cd /root/
npm i
npm run dev

# 🖥️ Frontend Setup (React Dashboard)
cd /root/frontend
npm i
npm start

The frontend runs at:
http://localhost:3000/

# 🧩 Stream Simulation Details
Since the provided RTSP URL was unreachable, the project uses:

- Local static `.mp4` files  
- HLS/stream simulation logic inside `streamManager.js`  
- STREAM_COUNT = 6  

This preserves the multi-stream layout + synchronization logic for demonstration.

# 🖼️ Dashboard Features
- Built using React (Functional Components + Hooks)
- HLS playback via hls.js
- 6-stream grid layout (2×3)
- Basic synchronization logic (play/pause alignment, reload)

# 🧪 Running Both Services
# Terminal 1
cd /root/
npm run dev

# Terminal 2
cd /root/frontend
npm start

# ❗ Why No Live URL?
Because the backend requires:
- FFmpeg running continuously  
- HLS playlist generation  
- No free host supports RTSP → HLS processing  

Therefore deployment to Vercel/Netlify is not possible.

# 📦 What This README Covers
- Project explanation  
- Backend + frontend setup  
- Stream simulation  
- Synchronization logic overview  