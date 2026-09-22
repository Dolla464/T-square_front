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

function SecureVideoPlayer({
  lessonId,
  courseTitle,
  isArabic = false,
  onUnauthorized,
  onUnavailable,
}) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const hasAutoRetriedRef = useRef(false);
  const retryInFlightRef = useRef(false);
  const onUnauthorizedRef = useRef(onUnauthorized);
  const onUnavailableRef = useRef(onUnavailable);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [streamUrl, setStreamUrl] = useState(null);
  const [contentType, setContentType] = useState(null);
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    onUnauthorizedRef.current = onUnauthorized;
  }, [onUnauthorized]);

  useEffect(() => {
    onUnavailableRef.current = onUnavailable;
  }, [onUnavailable]);

  useEffect(() => {
    let cancelled = false;
    hasAutoRetriedRef.current = false;
    retryInFlightRef.current = false;

    const authorize = async () => {
      setStatus("loading");
      setError(null);
      setStreamUrl(null);
      setContentType(null);

      try {
        const axiosClient = (await import("../../../api/axios")).default;
        const response = await axiosClient.post(`/student/lessons/${lessonId}/playback`);
        const payload = response.data?.data;

        if (cancelled) return;

        if (!payload?.stream_url) {
          onUnavailableRef.current?.();
          setError(
            isArabic
              ? "لم يُرجع الخادم رابط تشغيل للفيديو."
              : "The server did not return a playback URL.",
          );
          setStatus("error");
          return;
        }

        if (payload.content_type !== "video/mp4") {
          onUnavailableRef.current?.();
          setError(
            isArabic
              ? "صيغة الفيديو غير مدعومة للتشغيل."
              : "This video format is not supported for playback.",
          );
          setStatus("error");
          return;
        }

        setStreamUrl(normalizeStorageUrl(payload.stream_url));
        setContentType(payload.content_type);
        setStatus("ready");
      } catch (requestError) {
        if (cancelled) return;

        const httpStatus = requestError?.response?.status;
        if (httpStatus === 403) {
          onUnauthorizedRef.current?.();
        } else if (httpStatus === 422) {
          onUnavailableRef.current?.();
        }

        setError(resolvePlaybackError(httpStatus, isArabic));
        setStatus("error");
      }
    };

    authorize();

    return () => {
      cancelled = true;
    };
  }, [lessonId, retryKey, isArabic]);

  useEffect(() => {
    if (status !== "ready" || !streamUrl || !contentType || !videoRef.current) {
      return undefined;
    }

    if (!playerRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "auto",
        fluid: true,
        aspectRatio: "16:9",
        controlBar: {
          pictureInPictureToggle: false,
        },
      });

      playerRef.current.on("contextmenu", (event) => event.preventDefault());
    }

    playerRef.current.src({
      src: streamUrl,
      type: contentType,
    });

    const handleError = async () => {
      if (hasAutoRetriedRef.current) {
        setError(resolvePlaybackError(undefined, isArabic));
        setStatus("error");
        return;
      }

      if (retryInFlightRef.current) {
        return;
      }

      hasAutoRetriedRef.current = true;
      retryInFlightRef.current = true;

      try {
        const axiosClient = (await import("../../../api/axios")).default;
        const retryResponse = await axiosClient.post(`/student/lessons/${lessonId}/playback`);
        const retryPayload = retryResponse.data?.data;
        const retryStreamUrl = normalizeStorageUrl(retryPayload?.stream_url);
        const retryContentType = retryPayload?.content_type;

        if (!retryStreamUrl || retryContentType !== "video/mp4") {
          throw new Error("Missing or invalid playback data");
        }

        playerRef.current?.src({
          src: retryStreamUrl,
          type: retryContentType,
        });
      } catch (retryError) {
        const httpStatus = retryError?.response?.status;
        if (httpStatus === 403) {
          onUnauthorizedRef.current?.();
        } else if (httpStatus === 422) {
          onUnavailableRef.current?.();
        }
        setError(resolvePlaybackError(httpStatus, isArabic));
        setStatus("error");
      } finally {
        retryInFlightRef.current = false;
      }
    };

    playerRef.current.on("error", handleError);

    return () => {
      playerRef.current?.off("error", handleError);
    };
  }, [status, streamUrl, contentType, lessonId, isArabic]);

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

      {status === "ready" && <WatermarkOverlay courseName={courseTitle} />}
    </div>
  );
}

export default SecureVideoPlayer;
