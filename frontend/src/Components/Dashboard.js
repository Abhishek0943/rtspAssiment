import React, { useRef, useState, useEffect, useCallback } from "react";
import { STREAMS } from "../config/streams";
import HlsPlayer from "./HlsPlayer";

export default function Dashboard() {
  const playersRef = useRef([]);
  const [readyCount, setReadyCount] = useState(0);
  const [canPlayAll, setCanPlayAll] = useState(false);

  const handleReady = useCallback(() => {
    console.log("hii");
    setReadyCount((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!canPlayAll) return;
    if (readyCount !== STREAMS.length) return;

    const master = playersRef.current[0];
    if (!master) return;

    const masterTime = master.getCurrentTime();

    playersRef.current.forEach((player) => {
      if (!player) return;
      player.seekTo(masterTime);
      player.play();
    });
  }, [canPlayAll, readyCount]);
  return (
    <div>
      <h2>Video Monitoring Dashboard</h2>

      <button
        type="button"
        onClick={() => setCanPlayAll(true)}
        disabled={readyCount !== STREAMS.length}
      >
        {readyCount === STREAMS.length
          ? "Start All in Sync"
          : `Preparing ...(${readyCount}/${STREAMS.length})`}
      </button>

      <div className="grid">
        {STREAMS.map((stream, index) => (
          <HlsPlayer
            key={stream.id}
            title={`Stream ${index+1}`}
            src={stream.url}
            onReady={handleReady}
            ref={(el) => {
              playersRef.current[index] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}