import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdminContentPage.css";
import { useTags } from "../../../hooks/useTags";

function AdminContentForm({
  type,
  item,
  onBack,
  onSubmit,
  isReadOnly = false,
}) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: [],
  });

  const { tags: availableTags, getTags } = useTags();

  useEffect(() => {
    getTags();
    if (item) {
      setFormData({
        title: item.title || item.name || "",
        description: item.description || "",
        tags: item.tags?.map((tObj) => tObj.tag_id || tObj.id || tObj) || [],
      });
    }
  }, [item, getTags]);

  const handleChange = (e) => {
    const { name, value, type: fieldType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: fieldType === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitWrapper = async (e, isDraft = false) => {
    e.preventDefault();

    let payload = { ...formData, is_published: !isDraft };
    payload.tag_ids = formData.tags;
    delete payload.tags;

    try {
      if (item) {
        await onSubmit(item.id, payload);
      } else {
        await onSubmit(payload);
      }
    } catch (err) {
      // errors are handled in hook
    }
  };

  return (
    <div className="ac-form-container">
      {/* Header Area */}
      <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
        <button className="ac-back-btn" onClick={onBack}>
          <i
            className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
          ></i>
          <span className="ms-2 me-2 fs-5 fw-bold text-dark">
            {isReadOnly
              ? t("content.view_solution")
              : item
                ? t("content.edit_solution")
                : t("content.add_new_solution")}
          </span>
        </button>
        {!isReadOnly && (
          <div className="ac-form-actions d-flex gap-2">
            <button
              className="btn btn-danger px-4 ac-publish-btn"
              onClick={(e) => handleSubmitWrapper(e, false)}
            >
              {item ? t("content.update_solution") : t("content.add_solution")}
            </button>
          </div>
        )}
      </div>

      {/* Form Content Area */}
      <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
        <div className="ac-tab-content basic-info">
          <div className="mb-4">
            <label className="form-label fw-bold text-dark">
              {t("content.form.fields.title")}
            </label>
            <input
              type="text"
              name="title"
              className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
              placeholder={t("content.form.fields.title_placeholder")}
              value={formData.title}
              onChange={handleChange}
              disabled={isReadOnly}
            />
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-dark">
              {t("content.form.fields.description")}
            </label>
            <textarea
              name="description"
              className="form-control ac-form-textarea p-3 bg-light border-0 rounded-3"
              rows="4"
              placeholder={t("content.form.fields.description_placeholder")}
              value={formData.description}
              onChange={handleChange}
              disabled={isReadOnly}
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold text-dark">
              {t("content.form.fields.tags")}
            </label>

            {isReadOnly ? (
              <div className="d-flex flex-wrap gap-2 pt-2">
                {item && item.tags && item.tags.length > 0 ? (
                  item.tags.map((tag) => (
                    <span
                      key={tag.tag_id || tag.id}
                      className="badge bg-danger text-white px-3 py-2 rounded-pill fw-medium"
                    >
                      {tag.tag_name || tag.name}
                    </span>
                  ))
                ) : (
                  <span className="text-muted small">No tags assigned</span>
                )}
              </div>
            ) : (
              <div
                className="ac-tags-selection-box p-3 bg-light border rounded-3"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                <div className="row g-2">
                  {availableTags &&
                    availableTags.map((tag) => {
                      const tagId = tag.tag_id || tag.id;
                      const isChecked =
                        formData.tags.includes(parseInt(tagId, 10)) ||
                        formData.tags.includes(tagId.toString());

                      return (
                        <div key={tagId} className="col-md-4 col-6">
                          <div
                            className={`ac-tag-option p-2 rounded-3 border bg-white cursor-pointer d-flex align-items-center gap-2 ${isChecked ? "checked" : ""}`}
                            onClick={() => {
                              const numericId = parseInt(tagId, 10);
                              const newTags = isChecked
                                ? formData.tags.filter(
                                  (id) => id !== numericId,
                                )
                                : [...formData.tags, numericId];
                              setFormData((prev) => ({
                                ...prev,
                                tags: newTags,
                              }));
                            }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-0 cursor-pointer"
                              checked={isChecked}
                              onChange={() => { }} // handled by div click
                            />
                            <span
                              className={`small fw-medium ${isChecked ? "text-light" : "text-dark"}`}
                            >
                              {tag.tag_name || tag.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>

        {!isReadOnly && (
          <div className="d-flex justify-content-end mt-4 pt-4 border-top">
            <button
              className="btn btn-danger px-5 py-2 fw-medium rounded-3"
              onClick={(e) => handleSubmitWrapper(e, false)}
            >
              {item ? t("content.update_solution") : t("content.add_solution")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminContentForm;
