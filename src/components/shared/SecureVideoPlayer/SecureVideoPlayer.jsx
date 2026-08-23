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
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [watermark, setWatermark] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const authorize = async () => {
      setStatus("loading");
      setError(null);
      setStreamUrl(null);

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
          setStatus("error");
          return;
        }

        setWatermark(payload?.watermark || null);
        setStreamUrl(normalizeStorageUrl(payload.stream_url));
        setStatus("ready");
      } catch (requestError) {
        if (cancelled) return;

        const httpStatus = requestError?.response?.status;
        if (httpStatus === 403) {
          onUnauthorized?.();
        } else if (httpStatus === 422) {
          onUnavailable?.();
        }

        setError(resolvePlaybackError(httpStatus, isArabic));
        setStatus("error");
      }
    };

    authorize();

    return () => {
      cancelled = true;
    };
  }, [lessonId, retryKey, isArabic, onUnauthorized, onUnavailable]);

  useEffect(() => {
    if (status !== "ready" || !streamUrl || !videoRef.current) {
      return undefined;
    }

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
      src: streamUrl,
      type: "video/mp4",
    });

    const handleError = async () => {
      try {
        const axiosClient = (await import("../../../api/axios")).default;
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
        const httpStatus = retryError?.response?.status;
        if (httpStatus === 403) {
          onUnauthorized?.();
        } else if (httpStatus === 422) {
          onUnavailable?.();
        }
        setError(resolvePlaybackError(httpStatus, isArabic));
        setStatus("error");
      }
    };

    playerRef.current.one("error", handleError);

    return () => {
      playerRef.current?.off("error", handleError);
    };
  }, [status, streamUrl, lessonId, isArabic, onUnauthorized, onUnavailable]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <div className="secure-video-player">
      {status === "loading" && (
        <div className="secure-video-player__overlay secure-video-player--loading">
          <div className="spinner-border text-danger" role="status" />
        </div>
      )}

      {status === "error" && (
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
      )}

      <div data-vjs-player className={status === "error" ? "d-none" : undefined}>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered"
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
        />
      </div>

      {status === "ready" && <WatermarkOverlay watermark={watermark} />}
    </div>
  );
}

export default SecureVideoPlayer;
