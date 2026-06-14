function CurriculumTab({
  curriculum,
  handleSectionTitleChange,
  handleLessonChange,
  handleVideoUpload,
  removeLesson,
  addSection,
  removeSection,
  handlePlayVideo,
  isReadOnly,
  isArabic,
  t,
}) {
  return (
    <div className="ac-tab-content curriculum-info">
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
              {section.lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="border rounded-4 p-3 bg-light-subtle"
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
                                <span className="text-muted ">
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
                                style={{ minHeight: "60px", whiteSpace: "pre-wrap" }}
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
                              value={lesson.provider}
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
                              <option value="Upload"> Upload</option>
                              <option value="YouTube">YouTube</option>
                              <option value="GoogleDrive">Google Drive</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right – video upload / play */}
                    <div className="col-lg-4 d-flex flex-column justify-content-between">
                      <div className="d-flex flex-column gap-2 h-100">
                        <label
                          className={`btn ${lesson.video ? "bg-danger text-light" : "bg-white text-secondary"} border-0 rounded-3 p-3 mb-0 d-flex align-items-center justify-content-center gap-2 flex-grow-1`}
                          style={{
                            cursor: lesson.video ? "pointer" : "default",
                            minHeight: "54px",
                          }}
                          onClick={() => {
                            if (isReadOnly && lesson.video) {
                              handlePlayVideo(lesson.video, lesson.title);
                            }
                          }}
                        >
                          <i
                            className={`bi ${
                              isReadOnly && lesson.video
                                ? "bi-play-circle-fill"
                                : lesson.video
                                  ? "bi-camera-video-fill"
                                  : "bi-camera-video"
                            } fs-5`}
                          ></i>
                          <span
                            className="text-truncate fw-medium"
                            style={{ maxWidth: "150px" }}
                          >
                            {lesson.video
                              ? isReadOnly
                                ? isArabic
                                  ? "تشغيل الفيديو"
                                  : "Play Video"
                                : lesson.video.name || "Video Uploaded"
                              : t("content.form.curriculum.upload_video")}
                          </span>
                          {!isReadOnly && (
                            <input
                              type="file"
                              accept="video/*"
                              hidden
                              onChange={(e) =>
                                handleVideoUpload(
                                  section.id,
                                  lesson.id,
                                  e.target.files?.[0],
                                )
                              }
                            />
                          )}
                        </label>

                        {/* Duration + delete */}
                        <div className="d-flex align-items-center justify-content-between px-2">
                          <div className="small text-muted d-flex align-items-center gap-1">
                            <i className="bi bi-clock"></i>
                            <span>{lesson.duration || "0:00"}</span>
                          </div>
                          {!isReadOnly && lesson.video && (
                            <button
                              type="button"
                              className="btn btn-sm p-0 border-0 text-danger"
                              title={isArabic ? "مسح بيانات الدرس" : "Clear Lesson Data"}
                              onClick={() => removeLesson(section.id, lesson.id)}
                            >
                              <i className="bi bi-trash fs-5"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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
