function SettingsTab({ formData, handleChange, isReadOnly, isArabic, t }) {
  return (
    <div className="ac-tab-content settings-info">
      <h5 className="fw-bold mb-4">{isArabic ? "الإعدادات" : "Settings"}</h5>

      <div className="row mb-4">
        {/* Course language */}
        <div className="col-12 mb-3">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "لغة الكورس" : "Course Language"}
          </label>
          <select
            className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
            name="language"
            value={formData.language}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">{isArabic ? "اختر اللغة" : "Select language"}</option>
            <option value="ar">{isArabic ? "العربية" : "Arabic"}</option>
            <option value="en">{isArabic ? "الإنجليزية" : "English"}</option>
          </select>
        </div>

        {/* Duration – weeks */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "المدة (بالأسابيع)" : "Duration (Weeks)"}
          </label>
          <input
            type="number"
            className="form-control p-3 bg-light border-0 rounded-3"
            name="duration_weeks"
            value={formData.duration_weeks}
            onChange={handleChange}
            min="0"
            disabled={isReadOnly}
          />
        </div>

        {/* Duration – hours */}
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "المدة (بالساعات)" : "Duration (Hours)"}
          </label>
          <input
            type="number"
            className="form-control p-3 bg-light border-0 rounded-3"
            name="duration_hours"
            value={formData.duration_hours}
            onChange={handleChange}
            min="0"
            disabled={isReadOnly}
          />
        </div>

        {/* Google Drive link */}
        <div className="col-md-12 mb-3">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "رابط جوجل درايف" : "Google Drive Link"}
          </label>
          <input
            type="url"
            className="form-control p-3 bg-light border-0 rounded-3"
            name="google_drive_link"
            placeholder="https://drive.google.com/..."
            value={formData.google_drive_link}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Free course toggle */}
      <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
        <div>
          <strong className="d-block mb-1">{isArabic ? "كورس مجاني" : "Free Course"}</strong>
          <small className="text-muted">{isArabic ? "اجعل هذا الكورس متاحًا مجانًا" : "Make this course available for free"}</small>
        </div>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input form-check-inputS"
            type="checkbox"
            role="switch"
            checked={formData.is_free}
            onChange={handleChange}
            name="is_free"
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Featured course toggle */}
      <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
        <div>
          <strong className="d-block mb-1">
            {t("content.form.settings.featured_title")}
          </strong>
          <small className="text-muted">
            {t("content.form.settings.featured_desc")}
          </small>
        </div>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input form-check-inputS"
            type="checkbox"
            role="switch"
            checked={formData.is_featured}
            onChange={handleChange}
            name="is_featured"
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;
