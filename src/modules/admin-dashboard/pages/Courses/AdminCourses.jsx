import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pagination, Container, Row, Col } from "react-bootstrap";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { useInstructors } from "../../hooks/useInstractor";
import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

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

/**
 * Helper to dynamically build FormData from a payload object.
 * Ignores null, undefined, and empty strings automatically.
 * Supports handling arrays (e.g., tag_ids[]) and File uploads.
 */
const buildFormData = (payload) => {
  const fd = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    // Ignore invalid/empty values but allow false or 0
    if (value === null || value === undefined || value === "") {
      return;
    }

    // Handle File objects directly
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
    }
    // Handle Arrays (e.g., tags)
    else if (Array.isArray(value)) {
      value.forEach((item) => {
        fd.append(`${key}[]`, item);
      });
    }
    // Handle Booleans (Laravel usually expects 1/0 for boolean fields in multipart)
    else if (typeof value === 'boolean') {
      fd.append(key, value ? "1" : "0");
    }
    // Handle everything else
    else {
      fd.append(key, value);
    }
  });

  return fd;
};

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

const defaultFormData = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  category_id: "",
  instructor_id: "",
  level: "beginner",
  language: "Arabic",
  attendance_type: "online",
  price: "",
  price_before: "",
  discount_price: "",
  duration_weeks: "",
  duration_hours: "",
  status: "draft",
  is_featured: false,
  is_free: false,
  preview_video: "",
  google_drive_link: "",
  published_at: "",
  tags: [],
  curriculum: [createSection()],
};

function AdminCourses() {
  const {
    courses,
    pagination: apiPagination,
    loading,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
  } = useAdminCourses();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [activeTab, setActiveTab] = useState("basic");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { tags: availableTags, getTags } = useTags();
  const { instructors, getInstructors } = useInstructors();
  const { categories, getCategories } = useCategories();

  useEffect(() => {
    const params = {
      page: currentPage,
      search: searchTerm || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
    };
    getCourses(params);
  }, [currentPage, getCourses, searchTerm, selectedStatus, selectedCategory]);

  // We keep frontend filtering as a second layer to ensure immediate UI response 
  // and handle any cases where the API might return unfiltered data.
  const filteredCourses = (courses || []).filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      course.title?.toLowerCase().includes(searchLower) ||
      course.short_description?.toLowerCase().includes(searchLower) ||
      course.instructor?.full_name?.toLowerCase().includes(searchLower) ||
      course.instructor?.name?.toLowerCase().includes(searchLower);

    const matchesStatus =
      selectedStatus === "all" || course.status === selectedStatus;

    const matchesCategory =
      selectedCategory === "all" ||
      String(course.category_id) === String(selectedCategory) ||
      String(course.category?.id) === String(selectedCategory);

    return matchesSearch && matchesStatus && matchesCategory;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, selectedCategory]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  useEffect(() => {
    if (showForm) {
      getTags();
      getInstructors();
    }
  }, [showForm, getTags, getInstructors]);

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setThumbnailFile(null);
    setCoverFile(null);
    setActiveTab("basic");
    setShowForm(true);
  };

  const mapItemToFormData = (item) => {
    return {
      title: item.title || "",
      slug: item.slug || "",
      short_description: item.short_description || "",
      description: item.description || "",
      category_id: item.category_id || item.category?.id || "",
      instructor_id: item.instructor_id || item.instructor?.id || "",
      level: item.level || "beginner",
      language: item.language || "Arabic",
      attendance_type: item.attendance_type || "online",
      price: item.price || "",
      price_before: item.price_before || "",
      discount_price: item.discount_price || "",
      duration_weeks: item.duration_weeks || "",
      duration_hours: item.duration_hours || "",
      status: item.status || "draft",
      is_featured: item.is_featured || false,
      is_free: item.is_free || false,
      preview_video: item.preview_video || "",
      google_drive_link: item.google_drive_link || "",
      published_at: item.published_at ? new Date(item.published_at).toISOString().split('T')[0] : "",
      tags: item.tags?.map((tObj) => tObj.tag_id || tObj.id || tObj) || [],
      curriculum: normalizeCurriculum(item.curriculum || item.sections || []),
      thumbnail: item.thumbnail || null,
      cover_image: item.cover_image || null,
    };
  };

  const handleEdit = async (course) => {
    const fullCourse = await getCourseById(course.id);
    if (!fullCourse) return;

    setViewingItem(null);
    setEditingItem(fullCourse);
    setFormData(mapItemToFormData(fullCourse));
    setThumbnailFile(null);
    setCoverFile(null);
    setActiveTab("basic");
    setShowForm(true);
  };

  const handleView = async (course) => {
    const fullCourse = await getCourseById(course.id);
    if (!fullCourse) return;

    setEditingItem(null);
    setViewingItem(fullCourse);
    setFormData(mapItemToFormData(fullCourse));
    setThumbnailFile(null);
    setCoverFile(null);
    setActiveTab("basic");
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setActiveTab("view");
  };

  const handleDelete = async (id) => {
    const course = courses.find((item) => item.id === id);
    const ok = await showDeleteConfirm(course?.title || course?.name || "");
    if (ok) {
      await deleteCourse(id);
      getCourses({
        page: currentPage,
        search: searchTerm || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
      });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const fd = new FormData();
      fd.append("status", newStatus);

      await updateCourse(id, fd);

      getCourses({
        page: currentPage,
        search: searchTerm || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
      });
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, type = "thumbnail") => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Invalid file type. Please use PNG, JPEG or WEBP.");
      return;
    }
    if (type === "thumbnail") {
      setThumbnailFile(selectedFile);
    } else {
      setCoverFile(selectedFile);
    }
  };

  // Curriculum Handlers
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

  const handleVideoUpload = (sectionId, lessonId, uploadedFile) => {
    if (!uploadedFile) return;
    handleLessonChange(sectionId, lessonId, "video", uploadedFile.name);
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
        const lessons = section.lessons.filter((lesson) => lesson.id !== lessonId);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSubmitWrapper = async (e, forceStatus = null) => {
    if (e) e.preventDefault();

    // 1. Prepare base data payload matching backend schema
    const payload = {
      title: formData.title,
      slug: formData.slug,
      short_description: formData.short_description,
      description: formData.description,
      category_id: formData.category_id,
      instructor_id: formData.instructor_id,
      level: formData.level,
      language: formData.language,
      price: formData.price,
      price_before: formData.price_before,
      discount_price: formData.discount_price,
      duration_weeks: formData.duration_weeks,
      duration_hours: formData.duration_hours,
      attendance_type: formData.attendance_type?.toLowerCase(),
      status: forceStatus || formData.status || "draft",
      is_featured: formData.is_featured,
      is_free: formData.is_free,
      preview_video: formData.preview_video,
      google_drive_link: formData.google_drive_link,
      published_at: formData.published_at,
      tag_ids: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
    };

    // Add files if selected
    if (thumbnailFile) payload.thumbnail = thumbnailFile;
    if (coverFile) payload.cover_image = coverFile;

    // 2. Build FormData dynamically using the helper
    const fd = buildFormData(payload);

    // [DEBUG]: Print formData to console
    console.log("Course Payload:", payload);

    // 3. Execute the request
    try {
      if (editingItem) {
        await updateCourse(editingItem.id, fd);
      } else {
        await createCourse(fd);
      }

      handleBack();
      getCourses({
        page: currentPage,
        search: searchTerm || undefined,
        status: selectedStatus === "all" ? undefined : selectedStatus,
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
      });
    } catch (err) {
      console.error("Submission failed:", err);
    }
  };

  const isReadOnly = !!viewingItem;

  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">{t("courses_page.title", "Courses")}</h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("courses_page.subtitle", "Manage all courses")}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              + {t("courses_page.add_course", "Add Course")}
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="table-responsive ac-rounded-table" dir="ltr">
                <div className="ac-filters-bar d-flex justify-content-between align-items-center mb-3">
                  <div className="ac-search-input-wrapper">
                    <i className="bi bi-search ac-search-icon"></i>
                    <input
                      type="text"
                      className="form-control ac-search-input"
                      placeholder={t("content.search_courses")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-md-3">
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                    <select
                      className="form-select ac-form-select pt-2 pb-2 py-3 bg-light border-0 rounded-3 text-muted"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">{t("courses_page.all_categories", "All Categories")}</option>
                      {categories.map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name} (All)</option>
                          {cat.children?.map((child) => (
                            <option key={child.id} value={child.id}>
                              &nbsp;&nbsp;&nbsp;{child.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>
                <table className="table ac-table mb-0 align-middle">
                  <thead>
                    <tr>
                      <th>{t("content.table.course")}</th>
                      <th>{t("content.table.instructor")}</th>
                      <th className="text-center">{t("content.table.revenue")}</th>
                      <th className="text-center">{t("content.table.students")}</th>
                      <th className="text-center">{isArabic ? "الحالة" : "Status"}</th>

                      <th className="text-center">{t("content.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredCourses.length > 0 ? (
                      filteredCourses.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="fw-medium text-dark">
                            {item.name || item.title || "Untitled"}
                          </td>
                          <td className="text-secondary">
                            {item.instructor?.full_name || item.instructor?.name || "N/A"}
                          </td>
                          <td className="text-secondary text-center">
                            {item.total_revenue || item.revenue || "0.00"}
                          </td>
                          <td className="text-secondary text-center">
                            {item.total_students ?? item.students_count ?? 0}
                          </td>
                          <td className="text-center">
                            <select
                              className={`px-3   status-select ${item.status === "published"
                                ? "bg-success-subtle text-success border-success"
                                : "bg-danger-subtle text-danger border-danger"
                                }`}
                              value={item.status}
                              onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            >
                              <option value="published">
                                &#x2B9B; {isArabic ? "منشور" : "Published"}
                              </option>
                              <option value="draft">
                                &#x2B9B; {isArabic ? "مسودة" : "Draft"}
                              </option>
                            </select>
                          </td>
                          <td className="text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <button
                                className="btn btn-sm ac-btn-view border-0"
                                title="View"
                                onClick={() => handleView(item)}
                              >
                                <i className="bi bi-eye fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm ac-btn-edit border-0"
                                title="Edit"
                                onClick={() => handleEdit(item)}
                              >
                                <i className="bi bi-pencil-square fs-6"></i>
                              </button>
                              <button
                                className="btn btn-sm ac-btn-deleteTable border-0"
                                title="Delete"
                                onClick={() => handleDelete(item.id)}
                              >
                                <i className="bi bi-trash fs-6"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-muted">
                          No data available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination - Always visible if data exists */}
            {apiPagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">

                  <Pagination.Prev

                    disabled={apiPagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(apiPagination.current_page - 1)
                    }
                  />

                  {[...Array(apiPagination.last_page)].map((_, index) => (
                    <Pagination.Item
                      style={{ margin: "0 3px " }}

                      key={index + 1}
                      active={apiPagination.current_page === index + 1}
                      onClick={() => handlePageChange(index + 1)}
                    >
                      {index + 1}
                    </Pagination.Item>
                  ))}

                  <Pagination.Next
                    style={{ margin: "0 6px 0" }}

                    disabled={
                      apiPagination.current_page === apiPagination.last_page
                    }
                    onClick={() =>
                      handlePageChange(apiPagination.current_page + 1)
                    }
                  />

                </Pagination>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {isReadOnly
                  ? t("content.view_course")
                  : editingItem
                    ? t("content.edit_course")
                    : t("content.add_new_course")}
              </span>
            </button>
            {!viewingItem && (
              <div className="ac-form-actions d-flex gap-2">
                <button
                  className="btn btn-outline-danger px-4"
                  onClick={(e) => handleSubmitWrapper(e, "draft")}
                >
                  {isArabic ? "حفظ كمسودة" : "Save as Draft"}
                </button>
                <button
                  className="btn btn-danger px-4 ac-publish-btn"
                  onClick={(e) => handleSubmitWrapper(e, "published")}
                >
                  {isArabic ? "نشر الكورس" : "Publish Course"}
                </button>
              </div>
            )}
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <Container>
              <Row>
                <Col className="mb-3 m-0 p-0">
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
                      className={`ac-tab-btn ${activeTab === "pricing" ? "active" : ""}`}
                      onClick={() => setActiveTab("pricing")}
                    >
                      {isArabic ? "التسعير" : "Pricing"}
                    </button>
                    <button
                      className={`ac-tab-btn ${activeTab === "settings" ? "active" : ""}`}
                      onClick={() => setActiveTab("settings")}
                    >
                      {t("content.form.tabs.settings")}
                    </button>

                  </div>
                </Col>
              </Row>
            </Container>

            {activeTab === "basic" && (
              <div className="ac-tab-content basic-info">
                {isReadOnly && (
                  <div className="mb-4 text-center">
                    <div
                      className="ac-thumbnail-view border rounded-4 overflow-hidden shadow-sm d-inline-block"
                      style={{ maxWidth: "100%", width: "600px" }}
                    >
                      <img
                        src={
                          formData.thumbnail ||
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
                    {t("content.form.fields.course_title")}
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
                    {isArabic ? "وصف قصير" : "Short Description"}
                  </label>
                  <textarea
                    name="short_description"
                    className="form-control ac-form-textarea p-3 bg-light border-0 rounded-3"
                    rows="2"
                    placeholder={isArabic ? "وصف مختصر للكورس" : "Brief course description"}
                    value={formData.short_description}
                    onChange={handleChange}
                    disabled={isReadOnly}
                  ></textarea>
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
                <div className="row mb-4">
                  <div className="col-md-6 mb-3 mb-md-0">
                    <label className="form-label fw-bold text-dark">
                      {t("content.form.fields.category")}
                    </label>
                    <select
                      name="category_id"
                      className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                      value={formData.category_id}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="">
                        {t("content.form.fields.category_placeholder")}
                      </option>
                      {categories.map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name}</option>
                          {cat.children?.map((child) => (
                            <option key={child.id} value={child.id}>
                              &nbsp;&nbsp;&nbsp;{child.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold text-dark">
                      {t("content.form.fields.difficulty")}
                    </label>
                    <select
                      name="level"
                      className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                      value={formData.level}
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

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("content.form.fields.instructor")}
                  </label>
                  <select
                    name="instructor_id"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                    value={formData.instructor_id}
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

                <div className="mb-4">
                  <label className="form-label fw-bold text-dark">
                    {t("content.form.fields.course_price")}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0  text-muted">
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
                    {isArabic ? "السعر قبل الخصم" : "Price Before Discount"}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      $
                    </span>
                    <input
                      type="text"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-end-3"
                      placeholder="0.00"
                      value={formData.price_before}
                      onChange={handleChange}
                      name="price_before"
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
                      value={formData.discount_price}
                      onChange={handleChange}
                      name="discount_price"
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
                                    onChange={() => { }}
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
                            src={thumbnailFile ? URL.createObjectURL(thumbnailFile) : formData.thumbnail}
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
                            onClick={() => {
                              setThumbnailFile(null);
                              setFormData(prev => ({ ...prev, thumbnail: null }));
                            }}
                          >
                            <i className="bi bi-x-lg me-1"></i> {t("content.form.fields.remove")}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

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
                        style={{ borderStyle: "dashed", borderColor: "#d1d5db", cursor: "pointer" }}
                      >
                        <i className="bi bi-cloud-arrow-up fs-1 mb-2 text-secondary"></i>
                        <p className="mb-1">
                          {isArabic ? "اضغط لرفع صورة الغلاف" : "Click to upload cover image"}
                        </p>
                        <small>{isArabic ? "PNG, JPG أو WEBP (يفضل مقاس كبير)" : "PNG, JPG or WEBP (Large size recommended)"}</small>
                      </label>
                    ) : (
                      <div className="mt-2">
                        <div
                          className="ac-thumbnail-preview border rounded-3 overflow-hidden bg-light d-flex align-items-center justify-content-center"
                          style={{ height: "200px", maxWidth: "100%" }}
                        >
                          <img
                            src={coverFile ? URL.createObjectURL(coverFile) : formData.cover_image}
                            alt="cover preview"
                            className="img-fluid"
                            style={{ maxHeight: "100%", objectFit: "contain" }}
                          />
                        </div>
                        <div className="d-flex gap-2 mt-2">
                          <label
                            htmlFor="coverUpload"
                            className="btn btn-outline-danger btn-sm rounded-3 px-3 py-2 d-flex align-items-center gap-2"
                            style={{ cursor: "pointer" }}
                          >
                            <i className="bi bi-pencil-square"></i> {t("content.form.fields.change_photo")}
                          </label>
                          <button
                            type="button"
                            className="btn btn-light btn-sm rounded-3 px-3 py-2 text-secondary border"
                            onClick={() => {
                              setCoverFile(null);
                              setFormData(prev => ({ ...prev, cover_image: null }));
                            }}
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

            {activeTab === "curriculum" && (
              <div className="ac-tab-content curriculum-info">
                <h5 className="fw-bold mb-4">{t("content.form.curriculum_part")}</h5>
                <div className="d-flex flex-column gap-4">
                  {formData.curriculum.map((section) => (
                    <div key={section.id} className="curriculum-section">
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

            {activeTab === "settings" && (
              <div className="ac-tab-content settings-info">
                <h5 className="fw-bold mb-4">{isArabic ? "الإعدادات" : "Settings"}</h5>

                <div className="row mb-4">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "نوع الحضور" : "Attendance Type"} <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select ac-form-select p-3 bg-light border-0 rounded-3 text-muted"
                      name="attendance_type"
                      value={formData.attendance_type}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    >
                      <option value="online">{isArabic ? "أونلاين" : "Online"}</option>
                      <option value="offline">{isArabic ? "أوفلاين" : "Offline"}</option>
                      <option value="hybrid">{isArabic ? "هجين (Hybrid)" : "Hybrid"}</option>
                    </select>
                  </div>

                  <div className="col-md-6 mb-3">
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
                      <option value="">
                        {isArabic ? "اختر اللغة" : "Select language"}
                      </option>

                      <option value="ar">
                        {isArabic ? "العربية" : "Arabic"}
                      </option>

                      <option value="en">
                        {isArabic ? "الإنجليزية" : "English"}
                      </option>
                    </select>
                  </div>

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

                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold text-dark">
                      {isArabic ? "رابط فيديو المعاينة (Youtube/Vimeo)" : "Preview Video URL"}
                    </label>
                    <input
                      type="text"
                      className="form-control p-3 bg-light border-0 rounded-3"
                      name="preview_video"
                      placeholder="https://..."
                      value={formData.preview_video}
                      onChange={handleChange}
                      disabled={isReadOnly}
                    />
                  </div>

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

          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCourses;
