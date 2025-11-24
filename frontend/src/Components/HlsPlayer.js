import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  useState
} from "react";
import Hls from "hls.js";

const HlsPlayer = forwardRef(({ src, title, muted = true, onReady }, ref) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const notifiedRef = useRef(false);

  const [levels, setLevels] = useState([]);          // Hls levels (indices 0..n-1)
  const [currentLevel, setCurrentLevel] = useState(-1); // -1 = Auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);

  useImperativeHandle(
    ref,
    () => ({
      play() {
        const video = videoRef.current;
        if (video) video.play();
      },
      pause() {
        const video = videoRef.current;
        if (video) video.pause();
      },
      getCurrentTime() {
        const video = videoRef.current;
        return video ? video.currentTime : 0;
      },
      seekTo(time) {
        const video = videoRef.current;
        if (video && typeof time === "number") {
          video.currentTime = time;
        }
      }
    }),
    []
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;

    let hlsInstance = null;
    let handleLoadedMetadata = null;

    if (Hls.isSupported()) {
      hlsInstance = new Hls();
      hlsRef.current = hlsInstance;

      hlsInstance.loadSource(src);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        const allLevels = hlsInstance.levels || [];

        // hls.js usually gives levels in ascending bitrate order already
        setLevels(allLevels);
        setCurrentLevel(-1); // start in Auto (currentLevel = -1)

        if (!notifiedRef.current) {
          notifiedRef.current = true;
          onReady && onReady();
        }
      });

      hlsInstance.on(Hls.Events.ERROR, (event, data) => {
        console.error(`HLS error for ${title}`, data);
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      handleLoadedMetadata = () => {
        if (!notifiedRef.current) {
          notifiedRef.current = true;
          onReady && onReady();
        }
      };
      video.src = src;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
    }

    return () => {
      if (handleLoadedMetadata && video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (hlsInstance) {
        hlsInstance.destroy();
      }

      notifiedRef.current = false;
      setLevels([]);
      setCurrentLevel(-1);
      setShowQualityMenu(false);
    };
  }, [src, title, onReady]);

  // When user picks a quality
  const selectQuality = (levelIndex) => {
    setCurrentLevel(levelIndex);

    const hls = hlsRef.current;
    if (!hls) return;

    if (levelIndex === -1) {
      // Auto: let hls.js pick quality
      hls.currentLevel = -1; // this is the official way
    } else {
      // Manual: lock to this quality
      hls.currentLevel = levelIndex; // levelIndex matches hls.levels index
    }

    setShowQualityMenu(false);
  };

  const currentLabel =
    currentLevel === -1
      ? "Auto"
      : levels[currentLevel]
      ? `${levels[currentLevel].height || ""}p`
      : "Auto";

  return (
    <div className="video-container">
      <h3>{title}</h3>

      <div className="video-wrapper" style={{ position: "relative" }}>
        <video
          ref={videoRef}
          muted={muted}
          controls={false}
          width="100%"
          style={{ display: "block" }}
        />

        {/* Bottom-right controls bar */}
        <div
          className="controls-bar"
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}
        >
          {levels.length > 1 && (
            <div className="quality-control" style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setShowQualityMenu((v) => !v)}
                style={{
                  background: "rgba(0,0,0,0.6)",
                  color: "white",
                  border: "none",
                  borderRadius: 4,
                  padding: "4px 8px",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer"
                }}
              >
                <span>⚙</span>
                <span>{currentLabel}</span>
              </button>

              {showQualityMenu && (
                <div
                  className="quality-menu"
                  style={{
                    position: "absolute",
                    bottom: "110%",
                    right: 0,
                    background: "rgba(0,0,0,0.9)",
                    color: "white",
                    borderRadius: 4,
                    padding: "6px 0",
                    minWidth: 120,
                    zIndex: 10
                  }}
                >
                  <div
                    onClick={() => selectQuality(-1)}
                    style={{
                      padding: "4px 12px",
                      fontSize: 12,
                      cursor: "pointer",
                      background:
                        currentLevel === -1 ? "rgba(255,255,255,0.15)" : "none"
                    }}
                  >
                    Auto
                    {currentLevel === -1 && (
                      <span style={{ float: "right" }}>✓</span>
                    )}
                  </div>

                  {levels.map((lvl, index) => (
                    <div
                      key={index}
                      onClick={() => selectQuality(index)}
                      style={{
                        padding: "4px 12px",
                        fontSize: 12,
                        cursor: "pointer",
                        background:
                          currentLevel === index
                            ? "rgba(255,255,255,0.15)"
                            : "none"
                      }}
                    >
                      {lvl.height ? `${lvl.height}p` : `Level ${index}`}{" "}
                      <span style={{ opacity: 0.7 }}>
                        ({Math.round((lvl.bitrate || 0) / 1000)} kbps)
                      </span>
                      {currentLevel === index && (
                        <span style={{ float: "right" }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default HlsPlayer;
