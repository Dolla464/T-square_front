function SettingsTab({
  formData,
  handleChange,
  isReadOnly,
  t,
  storageAccounts = [],
}) {
  return (
    <div className="ac-tab-content">
      <h5 className="fw-bold mb-4">{t("courses_page.settings_title")}</h5>

      <div className="row">
        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.course_language")}
          </label>
          <select
            name="language"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            value={formData.language || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">{t("courses_page.select_language")}</option>
            <option value="ar">{t("courses_page.language_ar")}</option>
            <option value="en">{t("courses_page.language_en")}</option>
          </select>
        </div>

        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.google_drive_link")}
          </label>
          <input
            type="text"
            name="google_drive_link"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            value={formData.google_drive_link || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>

        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.google_storage_account")}
          </label>
          <select
            name="google_storage_account_id"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            value={formData.google_storage_account_id || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">{t("courses_page.none")}</option>
            {storageAccounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.google_drive_folder_id")}
          </label>
          <input
            type="text"
            name="google_drive_folder_id"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            placeholder={t("courses_page.folder_id_placeholder")}
            value={formData.google_drive_folder_id || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>

        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.duration_weeks")}
          </label>
          <input
            type="number"
            name="duration_weeks"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            value={formData.duration_weeks || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>

        <div className="col-md-6 mb-4">
          <label className="form-label fw-bold text-dark">
            {t("courses_page.duration_hours")}
          </label>
          <input
            type="number"
            name="duration_hours"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            value={formData.duration_hours || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
        <div>
          <strong className="d-block mb-1">{t("courses_page.free_course")}</strong>
          <small className="text-muted">{t("courses_page.free_course_hint")}</small>
        </div>
        <div className="form-check form-switch m-0">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            name="is_free"
            checked={!!formData.is_free}
            onChange={(e) =>
              handleChange({
                target: { name: "is_free", value: e.target.checked, type: "checkbox" },
              })
            }
            disabled={isReadOnly}
          />
        </div>
      </div>
    </div>
  );
}

export default SettingsTab;
