import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { normalizeStorageUrl } from "../../../utils/resolveApiOrigin";
import WatermarkOverlay from "./WatermarkOverlay";
import "./SecureVideoPlayer.css";

function resolvePlaybackError(status, isArabic) {
  if (status === 403) {
    return isArabic
      ? "غير مسموح لك بمشاهدة هذا الدرس."
      : "You are not allowed to watch this lesson.";
  }

  if (status === 422) {
    return isArabic
      ? "الفيديو غير متاح حالياً. تأكد من ربط حساب Google Drive بالكورس."
      : "Video is unavailable right now. Check that Google Drive is linked to the course.";
  }

  if (status === 401) {
    return isArabic
      ? "انتهت جلستك. سجّل الدخول ثم حاول مرة أخرى."
      : "Your session expired. Please sign in and try again.";
  }

  return isArabic
    ? "تعذّر تحميل الفيديو. حاول مرة أخرى."
    : "Unable to load video. Please try again.";
}

function SecureVideoPlayer({ lessonId, isArabic = false, onUnauthorized, onUnavailable }) {
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

        if (!payload?.stream_url) {
          onUnavailable?.();
          setError(
            isArabic
              ? "لم يُرجع الخادم رابط تشغيل للفيديو."
              : "The server did not return a playback URL.",
          );
          return;
        }

        setWatermark(payload?.watermark || null);

        const streamUrl = normalizeStorageUrl(payload.stream_url);

        if (!playerRef.current) {
          playerRef.current = videojs(videoRef.current, {
            controls: true,
            preload: "auto",
            fluid: true,
            html5: {
              vhs: {
                withCredentials: true,
              },
            },
            controlBar: {
              pictureInPictureToggle: false,
            },
          });

          playerRef.current.on("contextmenu", (event) => event.preventDefault());
        }

        if (videoRef.current) {
          videoRef.current.crossOrigin = "use-credentials";
        }

        playerRef.current.src({
          src: streamUrl,
          type: "video/mp4",
        });

        playerRef.current.one("error", async () => {
          try {
            const retryResponse = await axiosClient.post(`/student/lessons/${lessonId}/playback`);
            const retryPayload = retryResponse.data?.data;
            const retryStreamUrl = normalizeStorageUrl(retryPayload?.stream_url);

            if (!retryStreamUrl) {
              throw new Error("Missing stream URL");
            }

            playerRef.current?.src({
              src: retryStreamUrl,
              type: "video/mp4",
            });
          } catch (retryError) {
            const status = retryError?.response?.status;
            if (status === 403) {
              onUnauthorized?.();
            } else if (status === 422) {
              onUnavailable?.();
            }
            setError(resolvePlaybackError(status, isArabic));
          }
        });
      } catch (requestError) {
        if (cancelled) return;
        const status = requestError?.response?.status;
        if (status === 403) {
          onUnauthorized?.();
        } else if (status === 422) {
          onUnavailable?.();
        }
        setError(resolvePlaybackError(status, isArabic));
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
  }, [lessonId, retryKey, isArabic, onUnauthorized, onUnavailable]);

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
        <button
          type="button"
          className="btn btn-outline-danger btn-sm"
          onClick={() => setRetryKey((k) => k + 1)}
        >
          {isArabic ? "إعادة المحاولة" : "Retry"}
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
          crossOrigin="use-credentials"
          disablePictureInPicture
          playsInline
        />
      </div>
      <WatermarkOverlay watermark={watermark} />
    </div>
  );
}

export default SecureVideoPlayer;
