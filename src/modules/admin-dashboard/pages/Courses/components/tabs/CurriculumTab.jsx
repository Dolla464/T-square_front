import VideoUppyUploader from "../VideoUppyUploader";

function CurriculumTab({
  curriculum,
  handleSectionTitleChange,
  handleLessonChange,
  handleVideoFileReady,
  handleVideoUploadComplete,
  handleVideoUploadError,
  handleVideoUploadStateChange,
  handleCancelUpload,
  removeLesson,
  addSection,
  removeSection,
  handlePlayVideo,
  chunkUploads,
  courseId,
  formData,
  ensureCourseDraft,
  getAbortController,
  onDraftCreated,
  isReadOnly,
  isArabic,
  t,
}) {
  /**
   * Calculate the flat preview index for a lesson across all sections.
   * This is what the backend uses to isolate temp chunk folders.
   */
  const getPreviewIndex = (targetSectionId, targetLessonId) => {
    let index = 0;
    for (const section of curriculum) {
      for (const lesson of section.lessons) {
        if (
          section.id === targetSectionId &&
          lesson.id === targetLessonId
        ) {
          return index;
        }
        index++;
      }
    }
    return index;
  };

  const isPersistedUploadVideo = (lesson) =>
    !!lesson.uploadedVideoUrl ||
    (typeof lesson.video === "string" &&
      lesson.video.trim() !== "" &&
      (lesson.video.startsWith("http") ||
        lesson.video.startsWith("/") ||
        lesson.video.includes("courses/") ||
        lesson.video.includes("storage/")));

  const getYoutubeId = (url) => {
    if (!url || typeof url !== "string") return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?\s*v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const getVideoSrc = (video) => {
    if (!video) return "";
    if (typeof video !== "string") {
      // Check if it's a File object with a preview URL
      if (video && typeof video === "object" && video.preview) {
        return video.preview;
      }
      return "";
    }

    // Normalize absolute URLs that match backend domain to avoid CORS issues
    let normalized = video;
    let apiURL = import.meta.env.VITE_API_URL || "";
    apiURL = apiURL.replace(/\/api\/?$/, "");
    const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;

    if (normalized.startsWith("http://127.0.0.1:8000") && cleanBase.includes("localhost:8000")) {
      normalized = normalized.replace("http://127.0.0.1:8000", cleanBase);
    } else if (normalized.startsWith("http://localhost:8000") && cleanBase.includes("127.0.0.1:8000")) {
      normalized = normalized.replace("http://localhost:8000", cleanBase);
    }

    if (
      normalized.startsWith("http://") ||
      normalized.startsWith("https://") ||
      normalized.startsWith("blob:") ||
      normalized.startsWith("data:")
    ) {
      return normalized;
    }
    const cleanPath = normalized.startsWith("/") ? normalized : `/${normalized}`;
    if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
      return `${cleanBase}/storage${cleanPath}`;
    }
    return `${cleanBase}${cleanPath}`;
  };

  return (
    <div className="ac-tab-content curriculum-info">
      <style>{`
        .video-preview-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 16/9;
          min-height: 150px;
          border: 2px solid #eaeaea;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          background: #0f172a;
        }
        .video-preview-card:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 20px rgba(190, 21, 34, 0.2);
          border-color: #be1522;
        }
        .video-preview-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(190, 21, 34, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease;
          cursor: pointer;
          z-index: 5;
        }
        .video-preview-card:hover .video-preview-overlay {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="fw-bold mb-0">{t("content.form.curriculum_part")}</h5>
      </div>

      <div className="d-flex flex-column gap-4">
        {curriculum.map((section) => (
          <div
            key={section.id}
            className="curriculum-section border rounded-4 p-3 bg-white shadow-sm"
          >
            {/* Section title row – only shown when section has a title */}
            {section.title && section.title.trim() !== "" && (
              <div className="d-flex align-items-center gap-2 bg-light rounded-3 p-2 mb-3">
                <i
                  className="bi bi-grid-3x2-gap text-muted ms-2 opacity-50 fs-5"
                  style={{ transform: "rotate(90deg)" }}
                ></i>
                <input
                  type="text"
                  className="form-control p-3 bg-white border-0 rounded-3 flex-grow-1 fw-bold text-dark"
                  placeholder={t("content.form.curriculum.section_placeholder")}
                  value={section.title}
                  onChange={(e) =>
                    handleSectionTitleChange(section.id, e.target.value)
                  }
                  disabled={isReadOnly}
                />
                {!isReadOnly && (
                  <button
                    type="button"
                    className="btn bg-white text-danger border-0 rounded-3 p-3 d-flex align-items-center justify-content-center"
                    style={{ width: "54px", height: "54px" }}
                    onClick={() => removeSection(section.id)}
                  >
                    <i className="bi bi-trash fs-5"></i>
                  </button>
                )}
              </div>
            )}

            {/* Lessons list */}
            <div className="d-flex flex-column gap-3 ms-md-4">
              {section.lessons.map((lesson) => {
                const uploadState = chunkUploads?.[lesson.id] ?? {};
                const isUploading =
                  lesson.isUploading ||
                  uploadState.status === "uploading" ||
                  uploadState.status === "hashing";
                const uploadProgress = uploadState.progress ?? 0;
                const uploadError = lesson.uploadError || uploadState.error;
                const isComplete =
                  uploadState.status === "complete" || !!lesson.uploadedVideoUrl;
                const previewIndex = getPreviewIndex(section.id, lesson.id);

                const isYoutube = lesson.provider?.toLowerCase() === "youtube";
                const isVimeo = lesson.provider?.toLowerCase() === "vimeo";
                const isExternal = lesson.provider?.toLowerCase() === "external";
                const isUpload = lesson.provider?.toLowerCase() === "upload" || lesson.provider?.toLowerCase() === "html5" || (!lesson.provider);
                const isLinkProvider = isYoutube || isVimeo || isExternal;
                const hasPersistedVideo = isUpload
                  ? isPersistedUploadVideo(lesson)
                  : !!lesson.video;

                return (
                  <div
                    key={lesson.id}
                    className="border rounded-4 p-3 bg-light-subtle mb-3"
                  >
                    <div className="row g-3">
                      {/* Left – text inputs */}
                      <div className="col-lg-8">
                        <div className="row g-2">
                          {/* Lesson title */}
                          <div className="col-12">
                            {isReadOnly ? (
                              <p
                                className="form-control p-3 bg-white border-0 rounded-3 fw-bold text-dark mb-0"
                                style={{ minHeight: "48px" }}
                              >
                                {lesson.title || (
                                  <span className="text-muted">
                                    {isArabic ? "بدون عنوان" : "No title"}
                                  </span>
                                )}
                              </p>
                            ) : (
                              <input
                                type="text"
                                className="form-control p-3 bg-white border-0 rounded-3 fw-bold text-dark"
                                placeholder={isArabic ? "عنوان الدرس" : "Lesson Title"}
                                value={lesson.title}
                                onChange={(e) =>
                                  handleLessonChange(
                                    section.id,
                                    lesson.id,
                                    "title",
                                    e.target.value,
                                  )
                                }
                              />
                            )}
                          </div>

                          {/* Lesson description */}
                          <div className="col-12">
                            {isReadOnly ? (
                              lesson.description ? (
                                <p
                                  className="form-control p-3 bg-white border-0 rounded-3 text-secondary mb-0"
                                  style={{
                                    minHeight: "60px",
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {lesson.description}
                                </p>
                              ) : null
                            ) : (
                              <textarea
                                className="form-control p-3 bg-white border-0 rounded-3 text-dark"
                                rows="2"
                                placeholder={
                                  isArabic
                                    ? "وصف الدرس (اختياري)"
                                    : "Lesson description (optional)"
                                }
                                value={lesson.description}
                                onChange={(e) =>
                                  handleLessonChange(
                                    section.id,
                                    lesson.id,
                                    "description",
                                    e.target.value,
                                  )
                                }
                              ></textarea>
                            )}
                          </div>

                          {/* Sort order */}
                          <div className="col-md-4">
                            <div className="input-group">
                              <span className="input-group-text bg-white border-0 text-muted small">
                                {isArabic ? "الترتيب" : "Sort"}
                              </span>
                              <input
                                type="number"
                                className="form-control p-3 bg-white border-0 rounded-end-3 fw-medium text-dark"
                                placeholder="0"
                                value={lesson.sort_order}
                                onChange={(e) =>
                                  handleLessonChange(
                                    section.id,
                                    lesson.id,
                                    "sort_order",
                                    e.target.value,
                                  )
                                }
                                disabled={isReadOnly}
                              />
                            </div>
                          </div>

                          {/* Provider */}
                          <div className="col-md-8">
                            <div className="input-group">
                              <span className="input-group-text bg-white border-0 text-muted small">
                                {isArabic ? "المصدر" : "Provider"}
                              </span>
                              <select
                                className="form-select ac-form-select p-3 bg-white border-0 rounded-end-3 fw-medium text-dark"
                                value={
                                  lesson.provider?.toLowerCase() === "youtube"
                                    ? "youtube"
                                    : lesson.provider?.toLowerCase() === "vimeo"
                                      ? "vimeo"
                                      : lesson.provider?.toLowerCase() === "external"
                                        ? "external"
                                        : "upload"
                                }
                                onChange={(e) =>
                                  handleLessonChange(
                                    section.id,
                                    lesson.id,
                                    "provider",
                                    e.target.value,
                                  )
                                }
                                disabled={isReadOnly}
                              >
                                            {/* 'previews.*.video_provider'     => ['nullable', 'string', 'in:youtube,vimeo,upload,external'], */}

                                <option value="upload">Upload</option>
                                <option value="youtube">YouTube</option>
                                <option value="vimeo">Vimeo</option>
                                <option value="external">External Link</option>
                              </select>
                            </div>
                          </div>

                          {/* Video Link Input for non-upload providers */}
                          {isLinkProvider && (
                            <div className="col-12">
                              <input
                                type="url"
                                className="form-control p-3 bg-white border-0 rounded-3"
                                placeholder={isArabic ? "رابط الفيديو" : "Video URL"}
                                value={lesson.video || ""}
                                onChange={(e) =>
                                  handleLessonChange(
                                    section.id,
                                    lesson.id,
                                    "video",
                                    e.target.value,
                                  )
                                }
                                disabled={isReadOnly}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right – video preview card */}
                      <div className="col-lg-4">
                        <div className="d-flex flex-column gap-2 h-100 justify-content-center">
                          <div className="video-preview-card position-relative">
                            {/* Hashing overlay (before Uppy progress bar dominates) */}
                            {!isReadOnly && uploadState.status === "hashing" && (
                              <div className="video-uppy-overlay d-flex flex-column align-items-center justify-content-center px-4">
                                <div className="spinner-border text-danger spinner-border-sm mb-2" role="status" />
                                <span className="small fw-bold text-white">
                                  {isArabic ? "جاري حساب التحقق..." : "Computing checksum..."}
                                </span>
                                <span className="small text-white-50">{uploadProgress}%</span>
                              </div>
                            )}

                            {/* Retry notice */}
                            {!isReadOnly && uploadState.retryMessage && (
                              <div
                                className="position-absolute top-0 start-0 w-100 px-2 py-1 small text-warning text-center"
                                style={{ zIndex: 7, background: "rgba(0,0,0,0.6)", fontSize: "0.7rem" }}
                              >
                                {uploadState.retryMessage}
                              </div>
                            )}

                            {/* PREVIEW / UPLOADER CONTENT */}
                            {(() => {
                              const showUppyUploader =
                                isUpload && !isReadOnly && !hasPersistedVideo;

                              if (showUppyUploader) {
                                return (
                                  <VideoUppyUploader
                                    key={`uppy-${lesson.id}`}
                                    lessonKey={lesson.id}
                                    courseId={courseId}
                                    previewIndex={previewIndex}
                                    formData={formData}
                                    isArabic={isArabic}
                                    ensureCourseDraft={ensureCourseDraft}
                                    onDraftCreated={onDraftCreated}
                                    getAbortController={getAbortController}
                                    onFileReady={(data) =>
                                      handleVideoFileReady(section.id, lesson.id, data)
                                    }
                                    onUploadComplete={(response) =>
                                      handleVideoUploadComplete(section.id, lesson.id, response)
                                    }
                                    onUploadError={(msg) =>
                                      handleVideoUploadError(section.id, lesson.id, msg)
                                    }
                                    onUploadStateChange={(state) =>
                                      handleVideoUploadStateChange(lesson.id, state)
                                    }
                                  />
                                );
                              }

                              if (!hasPersistedVideo) {
                                return (
                                  <div
                                    className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center px-3"
                                    style={{
                                      background: "linear-gradient(135deg, #1e293b, #0f172a)",
                                    }}
                                  >
                                    <span className="small text-white-50">
                                      {isArabic ? "لا يوجد فيديو" : "No video"}
                                    </span>
                                  </div>
                                );
                              }

                              // VIDEO POPULATED STATE
                              const ytId = getYoutubeId(lesson.video);
                              const rawSrc = lesson.uploadedVideoUrl || lesson.blobUrl || lesson.video;
                              const vSrc = getVideoSrc(rawSrc);

                              // Only allow play/preview if uploaded successfully, local blobUrl is ready, or external link is valid, or previously saved
                              const canPlay = isUpload
                                ? (hasPersistedVideo && !isUploading)
                                : isLinkProvider
                                  ? (typeof lesson.video === "string" && lesson.video.startsWith("http"))
                                  : false;

                              return (
                                <div className="w-100 h-100 position-relative d-flex align-items-center justify-content-center">
                                  {/* Always-visible change video button (edit mode) */}
                                  {!isReadOnly && !isUploading && (
                                    <button
                                      type="button"
                                      className="video-change-btn"
                                      title={isArabic ? "تغيير الفيديو" : "Change video"}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelUpload(section.id, lesson.id);
                                      }}
                                    >
                                      <i className="bi bi-cloud-arrow-up-fill" />
                                      {isArabic ? "تغيير" : "Change"}
                                    </button>
                                  )}

                                  {/* Red Hover Overlay (play + delete) */}
                                  <div className="video-preview-overlay">
                                    {/* Play preview button */}
                                    {canPlay && (
                                      <button
                                        type="button"
                                        className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                                        style={{ width: "42px", height: "42px", transition: "transform 0.2s ease" }}
                                        title={isArabic ? "معاينة الفيديو" : "Preview video"}
                                        onClick={() => {
                                          if (isLinkProvider) {
                                            if (lesson.video && typeof lesson.video === "string" && lesson.video.startsWith("http")) {
                                              window.open(lesson.video, '_blank');
                                            }
                                          } else {
                                            handlePlayVideo(vSrc, lesson.title);
                                          }
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                                        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                      >
                                        <i className="bi bi-eye-fill text-danger fs-5"></i>
                                      </button>
                                    )}

                                    {/* Delete/clear/remove button */}
                                    {!isReadOnly && (
                                      <button
                                        type="button"
                                        className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                                        style={{ width: "42px", height: "42px", transition: "transform 0.2s ease" }}
                                        title={isArabic ? "مسح بيانات الدرس" : "Clear Lesson Data"}
                                        onClick={() => removeLesson(section.id, lesson.id)}
                                        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.15)"}
                                        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                      >
                                        <i className="bi bi-trash-fill text-danger fs-5"></i>
                                      </button>
                                    )}
                                  </div>

                                  {/* Visual background preview */}
                                  {(() => {
                                    // For YouTube: try to get ytId from the stored URL (vSrc fallback)
                                    const effectiveYtId = ytId || (isYoutube && vSrc ? getYoutubeId(vSrc) : null);
                                    if (isYoutube && effectiveYtId) {
                                      return (
                                        <img
                                          src={`https://img.youtube.com/vi/${effectiveYtId}/mqdefault.jpg`}
                                          className="w-100 h-100 object-fit-cover"
                                          alt="YouTube Thumbnail"
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                      );
                                    }
                                    if (vSrc) {
                                      const cleanSrc = vSrc.includes('#t=') ? vSrc : `${vSrc}#t=0.1`;
                                      return (
                                        <video
                                          src={cleanSrc}
                                          className="w-100 h-100 object-fit-cover"
                                          preload="metadata"
                                          muted
                                          playsInline
                                          style={{ pointerEvents: "none" }}
                                          onLoadedMetadata={(e) => { e.target.currentTime = 0.1; }}
                                          onLoadedData={(e) => { e.target.currentTime = 0.1; }}
                                        />
                                      );
                                    }
                                    return (
                                      <div
                                        className="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-center p-3"
                                        style={{
                                          background: isYoutube
                                            ? "linear-gradient(135deg, #f87171, #991b1b)"
                                            : isVimeo
                                              ? "linear-gradient(135deg, #86efac, #166534)"
                                              : isExternal
                                                ? "linear-gradient(135deg, #a78bfa, #4c1d95)"
                                                : "linear-gradient(135deg, #60a5fa, #1e3a8a)"
                                        }}
                                      >
                                        <i
                                          className={`bi ${isYoutube ? "bi-youtube" : isVimeo ? "bi-camera-video-fill" : isExternal ? "bi-link-45deg" : "bi-file-earmark-play"} text-white mb-2`}
                                          style={{ fontSize: "2.5rem" }}
                                        ></i>
                                      </div>
                                    );
                                  })()}

                                  {/* Provider badge */}
                                  <span
                                    className="position-absolute top-2 start-2 badge rounded-pill fw-semibold shadow-sm py-1 px-2"
                                    style={{
                                      zIndex: 1,
                                      fontSize: "0.68rem",
                                      background:
                                        isYoutube
                                          ? "#ef4444"
                                          : isVimeo
                                            ? "#22c55e"
                                            : isExternal
                                              ? "#8b5cf6"
                                              : "#3b82f6"
                                    }}
                                  >
                                    {isYoutube ? "YouTube" : isVimeo ? "Vimeo" : isExternal ? "External" : "Upload"}
                                  </span>
                                </div>
                              );
                            })()}
                          </div>

                          {/* Metadata row below the video card */}
                          {(hasPersistedVideo && !isUploading) && (
                            <div className="d-flex align-items-center justify-content-between mt-1 px-1 text-muted" style={{ fontSize: "0.75rem" }}>
                              <span className="fw-semibold text-secondary">
                                {isYoutube ? (isArabic ? "يوتيوب" : "YouTube") : isVimeo ? "Vimeo" : isExternal ? (isArabic ? "رابط خارجي" : "External") : (isArabic ? "مرفوع" : "Uploaded")}
                              </span>
                              {(lesson.durationFormatted || lesson.duration) && (
                                <span className="fw-semibold text-dark-emphasis">
                                  {lesson.durationFormatted || lesson.duration}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Upload error notice */}
                          {!isReadOnly && uploadError && (
                            <div className="alert alert-danger py-1 px-2 mb-0 small rounded-3">
                              <i className="bi bi-exclamation-triangle me-1"></i>
                              {uploadError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Add section button */}
        {!isReadOnly && (
          <button
            type="button"
            className="btn btn-light ac-add-section-btn w-100 p-3 rounded-3 fw-bold border-0 shadow-sm mt-3"
            onClick={addSection}
          >
            <i className="bi bi-plus-lg me-2"></i>
            {t("content.form.curriculum.add_section")}
          </button>
        )}
      </div>
    </div>
  );
}

export default CurriculumTab;
