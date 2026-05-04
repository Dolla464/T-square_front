import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import "./AdminContentPage.css";
// افترض وجود Hook للتاجز هنا كخيار
import { useTags } from "../../../hooks/useTags";
import { Col, Container, Row } from "react-bootstrap";

// تعليق: هذا المكون يتعامل مع الإدخال والتعديل.
// يظهر تبويبات (Tabs) لكورسات بدونها للحلول إلا إذا تطلب الأمر.
function AdminContentForm({
  type,
  item,
  onBack,
  onSubmit,
  isReadOnly = false,
}) {
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
    is_published: false,
    is_featured: false,
    enable_comments: true,
    has_certificate: true,
    curriculum: [
      {
        id: "section-1",
        title: "",
        lessons: [{ id: "lesson-1", title: "", duration: "", video: "" }],
      },
    ],
  });
  const [file, setFile] = useState(null);
  // const [loading, setLoading] = useState(false);
  const { tags: availableTags, getTags } = useTags();

  const createLesson = () => ({
    id: `lesson-${Date.now()}-${Math.random()}`,
    title: "",
    duration: "",
    video: "",
  });

  const createSection = () => ({
    id: `section-${Date.now()}-${Math.random()}`,
    title: "",
    lessons: [createLesson()],
  });

  const normalizeCurriculum = (rawCurriculum) => {
    if (!Array.isArray(rawCurriculum) || rawCurriculum.length === 0) {
      return [createSection()];
    }

    return rawCurriculum.map((section) => ({
      id: section.id || `section-${Date.now()}-${Math.random()}`,
      title: section.title || "",
      lessons:
        Array.isArray(section.lessons) && section.lessons.length > 0
          ? section.lessons.map((lesson) => ({
            id: lesson.id || `lesson-${Date.now()}-${Math.random()}`,
            title: lesson.title || "",
            duration: lesson.duration || lesson.length || "",
            video: lesson.video || lesson.video_url || "",
          }))
          : [createLesson()],
    }));
  };

  useEffect(() => {
    getTags();
    if (item) {
      setFormData({
        title: item.title || item.name || "",
        description: item.description || "",
        tags: item.tags?.map((tObj) => tObj.tag_id || tObj.id || tObj) || [],
        // Course specific fields
        price: item.price || "",
        discount: item.discount || "",
        is_free: item.is_free || false,
        is_published: item.is_published || false,
        is_featured: item.is_featured || false,
        enable_comments: item.enable_comments !== undefined ? item.enable_comments : true,
        has_certificate: item.has_certificate !== undefined ? item.has_certificate : true,
        category: item.category || "",
        difficulty: item.difficulty || "",
        instructor: item.instructor_id || item.instructor?.id || "",
        image: item.image || "",
        curriculum: normalizeCurriculum(item.curriculum || item.sections || []),
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
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    // validation بسيط
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type");
      return;
    }

    setFile(selectedFile);
  };
  // const uploadHandler = async () => {
  //   if (!file) {
  //     alert("Choose a file first");
  //     return;
  //   }

  //   try {
  //     setLoading(true);

  //     const formData = new FormData();
  //     formData.append("file", file);

  //     const response = await fetch("YOUR_API_ENDPOINT", {
  //       method: "POST",
  //       body: formData,
  //     });

  //     if (!response.ok) {
  //       throw new Error("Upload failed");
  //     }

  //     const data = await response.json();

  //     console.log("Uploaded:", data);

  //   } catch (error) {
  //     console.error(error);
  //     alert("Error uploading file");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleTagsChange = (e) => {
  //   const options = e.target.options;
  //   const selectedTags = [];
  //   for (let i = 0; i < options.length; i++) {
  //     if (options[i].selected) {
  //       // Parse the value to integer if it's a number, as Laravel API might expect numeric IDs
  //       const val = options[i].value;
  //       selectedTags.push(!isNaN(val) ? parseInt(val, 10) : val);
  //     }
  //   }
  //   setFormData((prev) => ({ ...prev, tags: selectedTags }));
  // };

  const updateCurriculum = (updater) => {
    setFormData((prev) => ({
      ...prev,
      curriculum: updater(prev.curriculum),
    }));
  };

  const handleSectionTitleChange = (sectionId, title) => {
    updateCurriculum((curriculum) =>
      curriculum.map((section) =>
        section.id === sectionId ? { ...section, title } : section,
      ),
    );
  };

  const handleLessonChange = (sectionId, lessonId, field, value) => {
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        return {
          ...section,
          lessons: section.lessons.map((lesson) =>
            lesson.id === lessonId ? { ...lesson, [field]: value } : lesson,
          ),
        };
      }),
    );
  };

  const handleVideoUpload = (sectionId, lessonId, file) => {
    if (!file) return;
    handleLessonChange(sectionId, lessonId, "video", file.name);
  };

  const addLesson = (sectionId) => {
    updateCurriculum((curriculum) =>
      curriculum.map((section) =>
        section.id === sectionId
          ? { ...section, lessons: [...section.lessons, createLesson()] }
          : section,
      ),
    );
  };

  const removeLesson = (sectionId, lessonId) => {
    updateCurriculum((curriculum) =>
      curriculum.map((section) => {
        if (section.id !== sectionId) return section;
        const lessons = section.lessons.filter(
          (lesson) => lesson.id !== lessonId,
        );
        return {
          ...section,
          lessons: lessons.length ? lessons : [createLesson()],
        };
      }),
    );
  };

  const addSection = () => {
    updateCurriculum((curriculum) => [...curriculum, createSection()]);
  };

  const removeSection = (sectionId) => {
    updateCurriculum((curriculum) => {
      const updated = curriculum.filter((section) => section.id !== sectionId);
      return updated.length ? updated : [createSection()];
    });
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
      delete payload.curriculum;
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
          <i
            className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
          ></i>
          <span className="ms-2 me-2 fs-5 fw-bold text-dark">
            {isReadOnly
              ? isCourse
                ? t("content.view_course")
                : t("content.view_solution")
              : item
                ? isCourse
                  ? t("content.edit_course")
                  : t("content.edit_solution")
                : isCourse
                  ? t("content.add_new_course")
                  : t("content.add_new_solution")}
          </span>
        </button>
        {!isReadOnly && (
          <div className="ac-form-actions d-flex gap-2">
            {isCourse && (
              <button
                className="btn bg-light px-4 ac-publish-btn"
                onClick={(e) => handleSubmitWrapper(e, true)}
              >
                {isArabic ? "حفظ ك مسوده" : "Save as a draft"}
              </button>)}
            <button
              className="btn btn-danger px-4 ac-publish-btn"
              onClick={(e) => handleSubmitWrapper(e, false)}
            >
              {isCourse
                ? `${t("content.form.publish")} ${t("content.table.course")}`
                : item
                  ? t("content.update_solution")
                  : t("content.add_solution")}
            </button>

          </div>
        )}
      </div>

      {/* Form Content Area */}
      <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
        <Container>
          <Row>
            <Col className="mb-3 m-0 p-0 ">
              <div className="ac-tabs-menu">
                <button
                  className={`ac-tab-btn ${activeTab === "basic" ? "active" : ""}`}
                  onClick={() => setActiveTab("basic")}
                >
                  {t("content.form.tabs.basic")}
                </button>

                <button
                  className={`ac-tab-btn ${activeTab === "curriculum" ? "active" : ""}`}
                  onClick={() => setActiveTab("curriculum")}
                >
                  {t("content.form.tabs.curriculum")}
                </button>

                <button
                  className={`ac-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  {t("content.form.tabs.settings")}
                </button>

                <button
                  className={`ac-tab-btn ${activeTab === "blank" ? "active" : ""}`}
                  onClick={() => setActiveTab("blank")}
                >
                  {t("content.form.tabs.blank")}
                </button>
              </div>
            </Col>
          </Row>
        </Container>
        {activeTab === "basic" && (
          <div className="ac-tab-content basic-info">
            {isCourse && isReadOnly && (
              <div className="mb-4 text-center">
                <div
                  className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
                  style={{ maxWidth: "100%", width: "600px" }}
                >
                  <img
                    src={
                      item.image ||
                      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                    }
                    alt={formData.title}
                    className="img-fluid w-100"
                    style={{ height: "300px", objectFit: "cover" }}
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="form-label fw-bold text-dark">
                {isCourse ? t("content.form.fields.course_title") : t("content.form.fields.title")}
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

            {isCourse && (
              <>
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {t("content.form.fields.category")}
                    </label>
                    <select
                      name="category"
                      className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                      value={formData.category}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="">
                        {t("content.form.fields.category_placeholder")}
                      </option>
                      <option value="1">Web Development</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("content.form.fields.difficulty")}
                    </label>
                    <select
                      name="difficulty"
                      className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                      value={formData.difficulty}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="">
                        {t("content.form.fields.difficulty_placeholder")}
                      </option>
                      <option value="beginner">Beginner</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("content.form.fields.instructor")}
                  </label>
                  <select
                    name="instructor"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.instructor}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  >
                    <option value="">
                      {t("content.form.fields.instructor_placeholder")}
                    </option>
                    <option value="1">Ahmed Hatem</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("content.form.fields.course_price")}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      $
                    </span>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleChange}
                      name="price"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("content.form.fields.discount_price")}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      $
                    </span>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3"
                      placeholder="0.00"
                      value={formData.discount}
                      onChange={handleChange}
                      name="discount"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>

                <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="d-block mb-1">Free Course</strong>
                    <small className="text-muted">
                      Make this course available for free
                    </small>
                  </div>
                  <div className="form-check form-switch m-0">
                    <input
                      className=" form-check-input form-check-inputS"
                      type="checkbox"
                      role="switch"
                      checked={formData.is_free}
                      onChange={handleChange}
                      name="is_free"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </>
            )}

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

            {isCourse && !isReadOnly && (
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {t("content.form.fields.course_thumbnail")}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  id="thumbnailUpload"
                  hidden
                />

                {!file ? (
                  <label
                    htmlFor="thumbnailUpload"
                    className="ac-thumbnail-upload w-100 mt-1 d-flex flex-column align-items-center justify-content-center p-5 text-center text-muted border-2 border-dashed rounded-3 bg-light"
                    style={{ borderStyle: "dashed", borderColor: "#d1d5db", cursor: "pointer" }}
                  >
                    <i className="bi bi-cloud-arrow-up fs-1 mb-2 text-secondary"></i>
                    <p className="mb-1">
                      {t("content.form.fields.thumbnail_hint")}
                    </p>
                    <small>{t("content.form.fields.thumbnail_sub_hint")}</small>
                  </label>
                ) : (
                  <div className="mt-2">
                    <div
                      className="ac-thumbnail-preview border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                      style={{ height: "200px", maxWidth: "100%" }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt="thumbnail preview"
                        className="img-fluid"
                        style={{ maxHeight: "100%", objectFit: "contain" }}
                      />
                    </div>
                    <div className="d-flex gap-2 mt-2">
                      <label
                        htmlFor="thumbnailUpload"
                        className="btn btn-outline-danger btn-sm rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-pencil-square"></i> {t("content.form.fields.change_photo")}
                      </label>
                      <button
                        type="button"
                        className="btn btn-light btn-sm rounded-3 px-3 py-2 text-secondary border"
                        onClick={() => setFile(null)}
                      >
                        <i className="bi bi-x-lg me-1"></i> {t("content.form.fields.remove")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {isCourse && activeTab === "curriculum" && (
          <div className="ac-tab-content curriculum-info">
            <h5 className="fw-bold mb-4">{t("content.form.curriculum_part")}</h5>
            <div className="d-flex flex-column gap-4">
              {formData.curriculum.map((section) => (
                <div key={section.id} className="curriculum-section">
                  {/* Section Header */}
                  <div className="d-flex align-items-center gap-2 gap-md-3 bg-light rounded-3 p-2 mb-3">
                    <i className="bi bi-grid-3x2-gap text-muted ms-2 opacity-50 fs-5 d-none rotate-90 d-md-block" style={{ transform: "rotate(90deg)" }}
                    ></i>
                    <input
                      type="text"
                      className="form-control p-3 bg-white border-0 rounded-3 flex-grow-1 fw-medium text-dark"
                      placeholder={t("content.form.curriculum.section_placeholder")}
                      value={section.title}
                      onChange={(e) => handleSectionTitleChange(section.id, e.target.value)}
                      disabled={isReadOnly}
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        className="btn bg-white text-danger border-0 rounded-3 p-3 me-0 me-md-2 d-flex align-items-center justify-content-center"
                        style={{ width: "54px", height: "54px", flexShrink: 0 }}
                        onClick={() => removeSection(section.id)}
                      >
                        <i className="bi bi-trash fs-5"></i>
                      </button>
                    )}
                  </div>

                  {/* Lessons List */}
                  <div className="d-flex flex-column gap-3 ms-md-5 ms-3">
                    {section.lessons.map((lesson) => (
                      <div key={lesson.id} className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-3 border rounded-3 p-2 bg-white">
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <i className="bi bi-grid-3x2-gap text-muted ms-2 opacity-50 fs-5 d-none d-md-block"></i>
                          <input
                            type="text"
                            className="form-control p-3 bg-light border-0 rounded-3 flex-grow-1 fw-medium text-dark"
                            placeholder={t("content.form.curriculum.lesson_placeholder")}
                            value={lesson.title}
                            onChange={(e) => handleLessonChange(section.id, lesson.id, "title", e.target.value)}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <input
                            type="text"
                            className="form-control p-3 bg-light border-0 rounded-3 text-center fw-medium text-dark"
                            placeholder={t("content.form.curriculum.duration_placeholder")}
                            style={{ width: "100px" }}
                            value={lesson.duration}
                            onChange={(e) => handleLessonChange(section.id, lesson.id, "duration", e.target.value)}
                            disabled={isReadOnly}
                          />
                          <label
                            className={`btn ${lesson.video ? 'bg-danger-subtle text-danger' : 'bg-light text-secondary'} border-0 rounded-3 p-3 mb-0 d-flex align-items-center justify-content-center gap-2 flex-grow-1 flex-md-grow-0`}
                            style={{ minWidth: "160px", cursor: isReadOnly ? "default" : "pointer", height: "54px" }}
                          >
                            <i className={`bi ${lesson.video ? 'bi-camera-video-fill' : 'bi-camera-video'} fs-5`}></i>
                            <span className="text-truncate fw-medium" style={{ maxWidth: "120px" }}>
                              {lesson.video ? (lesson.video.name || lesson.video || t("content.form.curriculum.video_uploaded")) : t("content.form.curriculum.upload_video")}
                            </span>
                            {!isReadOnly && (
                              <input
                                type="file"
                                accept="video/*"
                                hidden
                                onChange={(e) => handleVideoUpload(section.id, lesson.id, e.target.files?.[0])}
                              />
                            )}
                          </label>
                          {!isReadOnly && (
                            <button
                              type="button"
                              className="btn bg-white text-danger border-0 rounded-3 p-3 d-flex align-items-center justify-content-center"
                              style={{ width: "54px", height: "54px", flexShrink: 0 }}
                              onClick={() => removeLesson(section.id, lesson.id)}
                            >
                              <i className="bi bi-trash fs-5"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* Add Lesson Button */}
                    {!isReadOnly && (
                      <div className="mt-1">
                        <button
                          type="button"
                          className="btn btn-light ac-add-lesson-btn w-100 p-3 rounded-3 fw-bold border-0 shadow-sm"
                          onClick={() => addLesson(section.id)}
                          disabled={isReadOnly}
                        >
                          <i className="bi bi-plus-lg me-2"></i> {t("content.form.curriculum.add_lesson")}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Add Section Button */}
              {!isReadOnly && (
                <button
                  type="button"
                  className="btn btn-light ac-add-section-btn w-100 p-3 rounded-3 fw-bold border-0 shadow-sm mt-3"
                  onClick={addSection}
                  disabled={isReadOnly}
                >
                  <i className="bi bi-plus-lg me-2"></i> {t("content.form.curriculum.add_section")}
                </button>
              )}
            </div>
          </div>
        )}

        {isCourse && activeTab === "settings" && (
          <div className="ac-tab-content settings-info">
            <h5 className="fw-bold mb-4">{t("content.form.settings_part")}</h5>
            <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <strong className="d-block mb-1">{t("content.form.settings.publish_title")}</strong>
                <small className="text-muted">
                  {t("content.form.settings.publish_desc")}
                </small>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input form-check-inputS"
                  type="checkbox"
                  role="switch"
                  checked={formData.is_published}
                  onChange={handleChange}
                  name="is_published"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <strong className="d-block mb-1">{t("content.form.settings.featured_title")}</strong>
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

            <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <strong className="d-block mb-1">{t("content.form.settings.comments_title")}</strong>
                <small className="text-muted">
                  {t("content.form.settings.comments_desc")}
                </small>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input form-check-inputS"
                  type="checkbox"
                  role="switch"
                  checked={formData.enable_comments}
                  onChange={handleChange}
                  name="enable_comments"
                  disabled={isReadOnly}
                />
              </div>
            </div>

            <div className="p-3 mb-4 bg-light rounded-3 d-flex justify-content-between align-items-center">
              <div>
                <strong className="d-block mb-1">{t("content.form.settings.certificate_title")}</strong>
                <small className="text-muted">
                  {t("content.form.settings.certificate_desc")}
                </small>
              </div>
              <div className="form-check form-switch m-0">
                <input
                  className="form-check-input form-check-inputS"
                  type="checkbox"
                  role="switch"
                  checked={formData.has_certificate}
                  onChange={handleChange}
                  name="has_certificate"
                  disabled={isReadOnly}
                />
              </div>
            </div>
          </div>
        )}


        {/* صفحة فاضيه لم نحدد وظيفتها  */}
        {isCourse && activeTab === "blank" && (
          <>
            <div className="">
              <div className="coming-soon-page">
                <div className="coming-soon-card" style={{ border: 0, boxShadow: "0 0 0 0" }}>
                  <div className="coming-soon-icon-wrap ">
                    <i className="bi bi-globe fs-2"></i>
                  </div>
                  <h5 className="coming-soon-title">Comming Soon</h5>
                  <p className="coming-soon-subtitle">Comming Soon</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Bottom Actions for specific types (like Solutions) */}
        {!isCourse && !isReadOnly && (
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
    </div >
  );
}

export default AdminContentForm;
