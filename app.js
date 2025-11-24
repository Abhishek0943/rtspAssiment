const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const { startAllStreams } = require('./src/streamManager');

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Serve HLS segments & playlists from /public/hls
const hlsPath = path.join(__dirname, 'public', 'hls');
app.use('/hls', express.static(hlsPath));

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is up' });
});

// Optional: List the stream URLs your frontend can use
app.get('/streams', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const streams = [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `stream${i}`,
    url: `${baseUrl}/hls/stream${i}/index.m3u8`
  }));

  res.json({ streams });
});

// Start ffmpeg processes to generate HLS when server starts
startAllStreams().catch((err) => {
  console.error('Error starting streams:', err);
});

module.exports = app;
