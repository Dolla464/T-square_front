import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import WatermarkOverlay from "./WatermarkOverlay";
import "./SecureVideoPlayer.css";

function SecureVideoPlayer({ lessonId, onUnauthorized, onUnavailable }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      setLoading(true);
      setError(null);

      try {
        const axiosClient = (await import("../../../api/axios")).default;
        const response = await axiosClient.post(`/student/lessons/${lessonId}/playback`);
        const payload = response.data?.data;

        if (cancelled) return;

        setWatermark(payload?.watermark || null);

        if (!playerRef.current) {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            preload: "auto",
            fluid: true,
            controlBar: {
              pictureInPictureToggle: false,
            },
          });

          playerRef.current.on("contextmenu", (event) => event.preventDefault());
        }

        playerRef.current.src({
          src: payload.stream_url,
          type: "video/mp4",
        });

        playerRef.current.one("error", async () => {
          try {
            const retryResponse = await axiosClient.post(`/student/lessons/${lessonId}/playback`);
            const retryPayload = retryResponse.data?.data;
            playerRef.current?.src({
              src: retryPayload.stream_url,
              type: "video/mp4",
            });
          } catch (retryError) {
            const status = retryError?.response?.status;
            if (status === 403) {
              onUnauthorized?.();
              setError("You are not allowed to watch this lesson.");
            } else {
              onUnavailable?.();
              setError("Video is unavailable right now.");
            }
          }
        });
      } catch (requestError) {
        if (cancelled) return;
        const status = requestError?.response?.status;
        if (status === 403) {
          onUnauthorized?.();
          setError("You are not allowed to watch this lesson.");
        } else if (status === 422) {
          onUnavailable?.();
          setError("Video is unavailable right now.");
        } else {
          setError("Unable to load video. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    setup();

    return () => {
      cancelled = true;
    };
  }, [lessonId, retryKey, onUnauthorized, onUnavailable]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  if (loading) {
    return (
      <div className="secure-video-player secure-video-player--loading">
        <div className="spinner-border text-danger" role="status" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="secure-video-player secure-video-player--error">
        <div className="alert alert-danger mb-3">{error}</div>
        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setRetryKey((k) => k + 1)}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="secure-video-player">
      <div data-vjs-player>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
        />
      </div>
      <WatermarkOverlay watermark={watermark} />
    </div>
  );
}

export default SecureVideoPlayer;
