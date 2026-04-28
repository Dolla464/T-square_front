import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdminContentPage.css";
// افترض وجود Hook للتاجز هنا كخيار
import { useTags } from "../../../hooks/useTags";

// تعليق: هذا المكون يتعامل مع الإدخال والتعديل.
// يظهر تبويبات (Tabs) لكورسات بدونها للحلول إلا إذا تطلب الأمر.
function AdminContentForm({ type, item, onBack, onSubmit, isReadOnly = false }) {
  const { t, i18n } = useTranslation("adminDashboard");
  const isCourse = type === "course";
  const isArabic = i18n.language === "ar";

  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    difficulty: "",
    instructor: "",
    tags: [],
    price: "",
    discount: "",
    is_free: false,
  });

  const { tags: availableTags, getTags } = useTags();

  useEffect(() => {
    getTags();
    if (item) {
      setFormData({
        title: item.title || item.name || "",
        description: item.description || "",
        tags: item.tags?.map(tObj => tObj.tag_id || tObj.id || tObj) || [],
        // Course specific fields
        price: item.price || "",
        discount: item.discount || "",
        is_free: item.is_free || false,
        category: item.category || "",
        difficulty: item.difficulty || "",
        instructor: item.instructor_id || (item.instructor?.id) || "",
        image: item.image || ""
      });
    }
  }, [item, isCourse]);

  const handleChange = (e) => {
    const { name, value, type: fieldType, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: fieldType === "checkbox" ? checked : value,
    }));
  };

  const handleTagsChange = (e) => {
    const options = e.target.options;
    const selectedTags = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        // Parse the value to integer if it's a number, as Laravel API might expect numeric IDs
        const val = options[i].value;
        selectedTags.push(!isNaN(val) ? parseInt(val, 10) : val);
      }
    }
    setFormData((prev) => ({ ...prev, tags: selectedTags }));
  };

  const handleSubmitWrapper = async (e, isDraft = false) => {
    e.preventDefault();

    // Transform payload based on type
    let payload = { ...formData, is_published: !isDraft };

    if (!isCourse) {
      // API expects tag_ids for solutions
      payload.tag_ids = formData.tags;
      // Remove fields that are only for courses to keep payload clean
      delete payload.tags;
      delete payload.price;
      delete payload.discount;
      delete payload.difficulty;
      delete payload.category;
      delete payload.instructor;
    }

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
          <i className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}></i>
          <span className="ms-2 me-2 fs-5 fw-bold text-dark">
            {isReadOnly
              ? (isCourse ? t("content.view_course") : t("content.view_solution"))
              : item
                ? (isCourse ? t("content.edit_course") : t("content.edit_solution"))
                : (isCourse ? t("content.add_new_course") : t("content.add_new_solution"))
            }
          </span>
        </button>
        {!isReadOnly && (
          <div className="ac-form-actions d-flex gap-2">

            <button className="btn btn-danger px-4 ac-publish-btn" onClick={(e) => handleSubmitWrapper(e, false)}>
              {isCourse
                ? `${t("content.form.publish")} ${t("content.table.course")}`
                : (item ? t("content.update_solution") : t("content.add_solution"))
              }
            </button>
          </div>
        )}
      </div>



      {/* Form Content Area */}
      <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
        {activeTab === "basic" && (
          <div className="ac-tab-content basic-info">
            {isCourse && isReadOnly && (
              <div className="mb-4 text-center">
                <div className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block" style={{ maxWidth: '100%', width: '600px' }}>
                  <img
                    src={item.image || "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"}
                    alt={formData.title}
                    className="img-fluid w-100"
                    style={{ height: '300px', objectFit: 'cover' }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-bold text-dark">{isCourse ? "Course Title" : t("content.form.fields.title")}</label>
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
              <label className="form-label fw-bold text-dark">{t("content.form.fields.description")}</label>
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



            {isCourse && (
              <>
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">{t("content.form.fields.category")}</label>
                    <select name="category" className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted" value={formData.category} onChange={handleChange} disabled={isReadOnly}>
                      <option value="">{t("content.form.fields.category_placeholder")}</option>
                      <option value="1">Web Development</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">{t("content.form.fields.difficulty")}</label>
                    <select name="difficulty" className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted" value={formData.difficulty} onChange={handleChange} disabled={isReadOnly}>
                      <option value="">{t("content.form.fields.difficulty_placeholder")}</option>
                      <option value="beginner">Beginner</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">{t("content.form.fields.instructor")}</label>
                  <select name="instructor" className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted" value={formData.instructor} onChange={handleChange} disabled={isReadOnly}>
                    <option value="">{t("content.form.fields.instructor_placeholder")}</option>
                    <option value="1">Ahmed Hatem</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Course Price</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">$</span>
                    <input type="text" className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3" placeholder="0.00" value={formData.price} onChange={handleChange} name="price" disabled={isReadOnly} />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">Discount Price (Optional)</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">$</span>
                    <input type="text" className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3" placeholder="0.00" value={formData.discount} onChange={handleChange} name="discount" disabled={isReadOnly} />
                  </div>
                </div>

                <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block mb-1">Free Course</strong>
                    <small className="text-muted">Make this course available for free</small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input className="form-check-input" type="checkbox" role="switch" style={{ width: '40px', height: '20px' }} checked={formData.is_free} onChange={handleChange} name="is_free" disabled={isReadOnly} />
                  </div>
                </div>
              </>
            )}



            <div className="mb-4">
              <label className="form-label fw-bold text-dark">{t("content.form.fields.tags")}</label>

              {isReadOnly ? (
                <div className="d-flex flex-wrap gap-2 pt-2">
                  {item && item.tags && item.tags.length > 0 ? (
                    item.tags.map(tag => (
                      <span key={tag.tag_id || tag.id} className="badge bg-danger text-white px-3 py-2 rounded-pill fw-medium">
                        {tag.tag_name || tag.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-muted small">No tags assigned</span>
                  )}
                </div>
              ) : (
                <div className="ac-tags-selection-box p-3 bg-light border rounded-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                  <div className="row g-2">
                    {availableTags && availableTags.map(tag => {
                      const tagId = tag.tag_id || tag.id;
                      const isChecked = formData.tags.includes(parseInt(tagId, 10)) || formData.tags.includes(tagId.toString());

                      return (
                        <div key={tagId} className="col-md-4 col-6">
                          <div className={`ac-tag-option p-2 rounded-3 border bg-white cursor-pointer d-flex align-items-center gap-2 ${isChecked ? "border-danger bg-danger-subtle" : ""}`}
                            onClick={() => {
                              const numericId = parseInt(tagId, 10);
                              const newTags = isChecked
                                ? formData.tags.filter(id => id !== numericId)
                                : [...formData.tags, numericId];
                              setFormData(prev => ({ ...prev, tags: newTags }));
                            }}>
                            <input
                              type="checkbox"
                              className="form-check-input mt-0 cursor-pointer"
                              checked={isChecked}
                              onChange={() => { }} // handled by div click
                            />
                            <span className={`small fw-medium ${isChecked ? "text-danger" : "text-dark"}`}>
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

            {isCourse && !isReadOnly && (
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">Course Thumbnail</label>
                <div className="ac-thumbnail-upload d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted border-2 border-dashed rounded-3 bg-light" style={{ borderStyle: 'dashed', borderColor: '#d1d5db' }}>
                  <p className="mb-1">{t("content.form.fields.thumbnail_hint")}</p>
                  <small>{t("content.form.fields.thumbnail_sub_hint")}</small>
                </div>
              </div>
            )}
          </div>
        )}



        {isCourse && activeTab === "pricing" && (
          <div className="ac-tab-content pricing">

          </div>
        )}



        {/* Bottom Actions for specific types (like Solutions) */}
        {!isCourse && !isReadOnly && (
          <div className="d-flex justify-content-end mt-4 pt-4 border-top">
            <button className="btn btn-danger px-5 py-2 fw-medium rounded-3" onClick={(e) => handleSubmitWrapper(e, false)}>
              {item ? t("content.update_solution") : t("content.add_solution")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminContentForm;
