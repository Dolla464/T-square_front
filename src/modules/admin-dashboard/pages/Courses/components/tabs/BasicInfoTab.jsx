import React from "react";

function BasicInfoTab({
  formData,
  setFormData,
  handleChange,
  handleLearningChange,
  addLearning,
  removeLearning,
  handleFileChange,
  thumbnailFile,
  setThumbnailFile,
  coverFile,
  setCoverFile,
  treeCategories,
  instructors,
  availableTags,
  viewingItem,
  isReadOnly,
  isArabic,
  t,
}) {
  return (
    <div className="ac-tab-content basic-info">
      {/* Cover image preview in read-only mode */}
      {isReadOnly && (
        <div className="mb-4 text-center">
          <div
            className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
            style={{ maxWidth: "100%", width: "800px" }}
          >
            <img
              src={
                formData.cover_image ||
                "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
              }
              loading="lazy"
              alt={formData.title}
              className="img-fluid w-100"
              style={{ height: "350px", objectFit: "cover" }}
            />
          </div>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {t("content.form.fields.course_title")}
        </label>
        {isReadOnly ? (
          <p
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3 fw-bold text-dark mb-0 text-truncate"
            title={formData.title || ""}
          >
            {formData.title || (
              <span className="text-muted">
                {isArabic ? "بدون عنوان" : "No title"}
              </span>
            )}
          </p>
        ) : (
          <input
            type="text"
            name="title"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
            placeholder={t("content.form.fields.title_placeholder")}
            value={formData.title || ""}
            onChange={handleChange}
          />
        )}
      </div>

      {/* Short description */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {isArabic ? "وصف قصير" : "Short Description"}
        </label>
        <textarea
          name="short_description"
          className="form-control ac-form-textarea p-3 bg-light border-0 rounded-3"
          rows="2"
          placeholder={
            isArabic ? "وصف مختصر للكورس" : "Brief course description"
          }
          value={formData.short_description || ""}
          onChange={handleChange}
          disabled={isReadOnly}
        ></textarea>
      </div>

      {/* Full description */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {t("content.form.fields.description")}
        </label>
        <textarea
          name="description"
          className="form-control ac-form-textarea p-3 bg-light border-0 rounded-3"
          rows="4"
          placeholder={t("content.form.fields.description_placeholder")}
          value={formData.description || ""}
          onChange={handleChange}
          disabled={isReadOnly}
        ></textarea>
      </div>

      {/* Category + Level */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <label className="form-label fw-bold text-dark">
            {t("content.form.fields.category")}
          </label>
          <select
            name="category_id"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3 text-muted"
            value={formData.category_id ? String(formData.category_id) : ""}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">
              {t("content.form.fields.category_placeholder")}
            </option>
            {treeCategories &&
              treeCategories.map((cat) => {
                // إذا كان القسم الرئيسي يحتوي على أقسام فرعية، نعرضه كـ optgroup
                if (cat.children && cat.children.length > 0) {
                  return (
                    <optgroup key={cat.id} label={cat.name}>
                      {cat.children.map((child) => (
                        <option key={child.id} value={String(child.id)}>
                          {child.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                }
                // إذا كان القسم الرئيسي لا يحتوي على فروع، يعرض كخيار عادي مباشر وقابل للاختيار
                return (
                  <option key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </option>
                );
              })}
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label fw-bold text-dark">
            {t("content.form.fields.difficulty")}
          </label>
          <select
            name="level"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3 text-muted"
            value={formData.level || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">
              {t("content.form.fields.difficulty_placeholder")}
            </option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Instructor + Attendance Type */}
      <div className="row mb-4">
        <div className="col-md-6 mb-3 mb-md-0">
          <label className="form-label fw-bold text-dark">
            {t("content.form.fields.instructor")}
          </label>
          <select
            name="instructor_id"
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3 text-muted"
            value={formData.instructor_id || ""}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="">
              {t("content.form.fields.instructor_placeholder")}
            </option>
            {instructors && instructors.length > 0 ? (
              instructors.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.full_name || inst.name}
                </option>
              ))
            ) : (
              <option value="1">Ahmed Hatem</option>
            )}
          </select>
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "نوع الحضور" : "Attendance Type"}
          </label>
          <select
            className="form-control ac-form-input p-3 bg-light border-0 rounded-3 text-muted"
            name="attendance_type"
            value={formData.attendance_type || "online"}
            onChange={handleChange}
            disabled={isReadOnly}
          >
            <option value="online">{isArabic ? "أونلاين" : "Online"}</option>
            <option value="offline">{isArabic ? "أوفلاين" : "Offline"}</option>
            <option value="hybrid">
              {isArabic ? "هجين (Hybrid)" : "Hybrid"}
            </option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-4">
        <label className="form-label fw-bold text-dark">
          {t("content.form.fields.tags")}
        </label>

        {isReadOnly ? (
          <div className="d-flex flex-wrap gap-2 pt-2">
            {viewingItem && viewingItem.tags && viewingItem.tags.length > 0 ? (
              viewingItem.tags.map((tag) => (
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
                    formData.tags?.includes(parseInt(tagId, 10)) ||
                    formData.tags?.includes(tagId.toString());
                  return (
                    <div key={tagId} className="col-md-4 col-6">
                      <div
                        className={`ac-tag-option p-2 rounded-3 border bg-white cursor-pointer d-flex align-items-center gap-2 ${isChecked ? "checked" : ""}`}
                        onClick={() => {
                          const numericId = parseInt(tagId, 10);
                          const currentTags = formData.tags || [];
                          const newTags = isChecked
                            ? currentTags.filter((id) => id !== numericId)
                            : [...currentTags, numericId];
                          setFormData((prev) => ({ ...prev, tags: newTags }));
                        }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input mt-0 cursor-pointer"
                          checked={isChecked || false}
                          onChange={() => {}}
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

      {/* What students will learn */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <label className="form-label fw-bold text-dark mb-0">
            {isArabic ? "ماذا سيتعلم الطالب؟" : "What student will learn"}
          </label>
          {!isReadOnly && (
            <button
              type="button"
              className="btn btn-sm ac-btn-deleteTable border-0 rounded-circle p-0 d-flex align-items-center justify-content-center"
              style={{ width: "24px", height: "24px" }}
              onClick={addLearning}
            >
              <i className="bi bi-plus"></i>
            </button>
          )}
        </div>

        <div className="d-flex flex-column gap-2">
          {formData.learnings &&
            formData.learnings.map((learning, index) => (
              <div key={index} className="d-flex gap-2 align-items-center">
                <div className="flex-grow-1 position-relative">
                  <input
                    type="text"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    placeholder={
                      isArabic
                        ? "مثال: تعلم أساسيات البرمجة"
                        : "e.g. Learn the basics of programming"
                    }
                    value={learning || ""}
                    onChange={(e) =>
                      handleLearningChange(index, e.target.value)
                    }
                    disabled={isReadOnly}
                  />
                </div>
                {!isReadOnly && formData.learnings.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-light text-danger border-0 rounded-3 p-2"
                    onClick={() => removeLearning(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Thumbnail upload */}
      {!isReadOnly && (
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            {t("content.form.fields.course_thumbnail")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "thumbnail")}
            id="thumbnailUpload"
            hidden
          />

          {!thumbnailFile && !formData.thumbnail ? (
            <label
              htmlFor="thumbnailUpload"
              className="ac-thumbnail-upload w-100 mt-1 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted border-2 border-dashed rounded-3 bg-light"
              style={{
                borderStyle: "dashed",
                borderColor: "#d1d5db",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-cloud-arrow-up fs-1 mb-2 text-secondary"></i>
              <p className="mb-1">{t("content.form.fields.thumbnail_hint")}</p>
              <small>{t("content.form.fields.thumbnail_sub_hint")}</small>
            </label>
          ) : (
            <div className="mt-2">
              <div
                className="ac-thumbnail-preview border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                style={{ height: "200px", maxWidth: "100%" }}
              >
                <img
                  src={
                    thumbnailFile
                      ? URL.createObjectURL(thumbnailFile)
                      : formData.thumbnail
                  }
                  alt="thumbnail preview"
                  className="img-fluid"
                  style={{ maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                <label
                  htmlFor="thumbnailUpload"
                  className="btn btn-sm ac-btn-deleteTable border-0 rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-pencil-square"></i>{" "}
                  {t("content.form.fields.change_photo")}
                </label>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-3 px-3 py-2 text-secondary border"
                  onClick={() => {
                    setThumbnailFile(null);
                    setFormData((prev) => ({ ...prev, thumbnail: null }));
                  }}
                >
                  <i className="bi bi-x-lg me-1"></i>{" "}
                  {t("content.form.fields.remove")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cover image upload */}
      {!isReadOnly && (
        <div className="mb-4">
          <label className="form-label fw-bold text-dark">
            {isArabic ? "صورة الغلاف (Cover Image)" : "Cover Image"}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, "cover")}
            id="coverUpload"
            hidden
          />

          {!coverFile && !formData.cover_image ? (
            <label
              htmlFor="coverUpload"
              className="ac-thumbnail-upload w-100 mt-1 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted border-2 border-dashed rounded-3 bg-light"
              style={{
                borderStyle: "dashed",
                borderColor: "#d1d5db",
                cursor: "pointer",
              }}
            >
              <i className="bi bi-cloud-arrow-up fs-1 mb-2 text-secondary"></i>
              <p className="mb-1">
                {isArabic
                  ? "اضغط لرفع صورة الغلاف"
                  : "Click to upload cover image"}
              </p>
              <small>
                {isArabic
                  ? "PNG, JPG أو WEBP (يفضل مقاس كبير)"
                  : "PNG, JPG or WEBP (Large size recommended)"}
              </small>
            </label>
          ) : (
            <div className="mt-2">
              <div
                className="ac-thumbnail-preview border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                style={{ height: "200px", maxWidth: "100%" }}
              >
                <img
                  src={
                    coverFile
                      ? URL.createObjectURL(coverFile)
                      : formData.cover_image
                  }
                  alt="cover preview"
                  className="img-fluid"
                  style={{ maxHeight: "100%", objectFit: "contain" }}
                />
              </div>
              <div className="d-flex gap-2 mt-2">
                <label
                  htmlFor="coverUpload"
                  className="btn btn-sm ac-btn-deleteTable border-0 rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                  style={{ cursor: "pointer" }}
                >
                  <i className="bi bi-pencil-square"></i>{" "}
                  {t("content.form.fields.change_photo")}
                </label>
                <button
                  type="button"
                  className="btn btn-light btn-sm rounded-3 px-3 py-2 text-secondary border"
                  onClick={() => {
                    setCoverFile(null);
                    setFormData((prev) => ({ ...prev, cover_image: null }));
                  }}
                >
                  <i className="bi bi-x-lg me-1"></i>{" "}
                  {t("content.form.fields.remove")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BasicInfoTab;
