const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const RTSP_URL = process.env.RTSP_URL || path.join(__dirname, '../demoVideo.mp4');
const HLS_ROOT = path.join(__dirname, '..', 'public', 'hls');
const STREAM_COUNT = 2;
const processes = [];

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function startStream(streamIndex) {
  const streamName = `stream${streamIndex}`;
  const outDir = path.join(HLS_ROOT, streamName);

  ensureDirSync(outDir);

  const outputPath = path.join(outDir, 'index.m3u8');

  const ffmpegCmd = 'ffmpeg';
// this is RTSP Video
  // const args = [
  //   '-rtsp_transport',
  //   'tcp',
  //   '-i',
  //   RTSP_URL,
  //   '-c:v',
  //   'copy',
  //   '-c:a',
  //   'aac',
  //   '-f',
  //   'hls',
  //   '-hls_time',
  //   '2',
  //   '-hls_list_size',
  //   '10',
  //   '-hls_flags',
  //   'delete_segments',
  //   outputPath
  // ];
const args = [
  '-stream_loop', '-1',  
  '-re',
  '-i', RTSP_URL,
  '-c:v', 'copy',
  '-c:a', 'aac',
  '-f', 'hls',
  '-hls_time', '5',
  '-hls_list_size', '10',
  '-hls_flags', 'delete_segments',
  outputPath
];
  const proc = spawn(ffmpegCmd, args);

  proc.on('close', (code) => {
    console.log(`[${streamName}] ffmpeg exited with code ${code}`);
  });

  processes.push(proc);
}
async function startAllStreams() {
  ensureDirSync(HLS_ROOT);
  for (let i = 1; i <= STREAM_COUNT; i++) {
    startStream(i);
  }
}
function stopAllStreams() {
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill('SIGINT');
    }
  });
}
module.exports = {
  startAllStreams,
  stopAllStreams
};
