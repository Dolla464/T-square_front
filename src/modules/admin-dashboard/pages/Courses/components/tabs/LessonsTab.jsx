function LessonsTab({
  courseId,
  isReadOnly,
  t,
  lessons,
  loading,
  saving,
  onAddLesson,
  onSaveLesson,
  onRemoveLesson,
  onUpdateLesson,
}) {
  if (!courseId) {
    return (
      <div className="ac-tab-content">
        <div className="alert alert-info">
          {t("courses_page.save_course_first_lessons")}
        </div>
      </div>
    );
  }

  return (
    <div className="ac-tab-content">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h5 className="fw-bold mb-1">{t("courses_page.course_lessons")}</h5>
          <p className="text-muted mb-0">{t("courses_page.course_lessons_hint")}</p>
        </div>
        {!isReadOnly && (
          <button type="button" className="btn btn-danger" onClick={onAddLesson}>
            {t("courses_page.add_lesson")}
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-4 text-muted">{t("courses_page.loading")}</div>
      ) : lessons.length === 0 ? (
        <div className="alert alert-light border">{t("courses_page.no_lessons_yet")}</div>
      ) : (
        lessons.map((lesson, index) => (
          <div key={lesson.id || `draft-${index}`} className="border rounded-4 p-4 mb-4 bg-light">
            <div className="row g-3">
              <div className="col-md-8">
                <label className="form-label fw-bold">{t("courses_page.lesson_title")}</label>
                <input
                  type="text"
                  className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                  value={lesson.title || ""}
                  onChange={(e) => onUpdateLesson(index, "title", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label fw-bold">{t("courses_page.sort_order")}</label>
                <input
                  type="number"
                  min="0"
                  className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                  value={lesson.sort_order ?? index}
                  onChange={(e) => onUpdateLesson(index, "sort_order", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="col-12">
                <label className="form-label fw-bold">{t("courses_page.description")}</label>
                <textarea
                  className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                  rows={3}
                  value={lesson.description || ""}
                  onChange={(e) => onUpdateLesson(index, "description", e.target.value)}
                  disabled={isReadOnly}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">{t("courses_page.video_source")}</label>
                <div className="d-flex gap-3">
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name={`video_source_${index}`}
                      checked={(lesson.video_source_type || "none") === "none"}
                      onChange={() => onUpdateLesson(index, "video_source_type", "none")}
                      disabled={isReadOnly}
                    />
                    {t("courses_page.video_source_none")}
                  </label>
                  <label className="d-flex align-items-center gap-2">
                    <input
                      type="radio"
                      name={`video_source_${index}`}
                      checked={lesson.video_source_type === "google_drive"}
                      onChange={() => onUpdateLesson(index, "video_source_type", "google_drive")}
                      disabled={isReadOnly}
                    />
                    Google Drive
                  </label>
                </div>
              </div>
              <div className="col-md-6 d-flex align-items-end">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean(lesson.is_active)}
                    onChange={(e) => onUpdateLesson(index, "is_active", e.target.checked)}
                    disabled={isReadOnly}
                  />
                  <label className="form-check-label">{t("courses_page.active")}</label>
                </div>
              </div>
              {lesson.video_source_type === "google_drive" && (
                <div className="col-12">
                  <label className="form-label fw-bold">
                    {t("courses_page.google_drive_video_url")}
                  </label>
                  <input
                    type="url"
                    className="form-control ac-form-input p-3 bg-white border-0 rounded-3"
                    placeholder="https://drive.google.com/file/d/FILE_ID/view"
                    value={lesson.google_drive_url || ""}
                    onChange={(e) => onUpdateLesson(index, "google_drive_url", e.target.value)}
                    disabled={isReadOnly}
                  />
                  {lesson.drive_validation_message && (
                    <small
                      className={`d-block mt-2 ${
                        lesson.drive_validation_status === "valid" ? "text-success" : "text-warning"
                      }`}
                    >
                      {lesson.drive_validation_message}
                    </small>
                  )}
                </div>
              )}
            </div>

            {!isReadOnly && (
              <div className="d-flex gap-2 mt-4">
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={saving}
                  onClick={() => onSaveLesson(lesson, index)}
                >
                  {saving ? t("courses_page.saving") : t("courses_page.save_lesson")}
                </button>
                {lesson.id && (
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    disabled={saving}
                    onClick={() => onRemoveLesson(lesson.id)}
                  >
                    {t("courses_page.delete")}
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default LessonsTab;
