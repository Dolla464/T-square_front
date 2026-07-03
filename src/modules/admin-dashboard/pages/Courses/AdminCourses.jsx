import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { useInstructors } from "../../hooks/useInstractor";
import { useCategories } from "../../hooks/useCategories";
import { useTags } from "../../hooks/useTags";
import {
  showConfirmCustom,
  showDeleteConfirm,
} from "../../../../components/shared/ConfirmDialog/confirmDialog";
import VideoPreviewModal from "../../../../components/layout/VideoPreviewModal";
import { useCourseFormLogic } from "./hooks/useCourseFormLogic";
import {
  mapItemToFormData,
  buildFormData,
  formatDateForMySQL,
} from "./utils/courseHelpers";
import CourseFilters from "./components/CourseFilters";
import CourseTable from "./components/CourseTable";
import CourseForm from "./components/CourseForm";
import AdminPagination from "../../components/shared/AdminPagination";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

function AdminCourses() {
  // ─── API hooks ─────────────────────────────────────────────────────────────
  const {
    courses,
    pagination: apiPagination,
    loading,
    getCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    getTrashedCourses,
    restoreCourse,
    forceDeleteCourse,
  } = useAdminCourses();

  const { tags: availableTags, getTags } = useTags();
  const { instructors, getInstructors } = useInstructors();
  const { categories, treeCategories, getCategoriesTree } = useCategories();

  // ─── i18n ──────────────────────────────────────────────────────────────────
  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");
  const [searchParams, setSearchParams] = useSearchParams();

  // ─── View state ────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── List / filter state ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTrash, setShowTrash] = useState(false);
  const [trashPeriod, setTrashPeriod] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ─── Video modal state ─────────────────────────────────────────────────────
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState("");

  // ─── Form logic hook ───────────────────────────────────────────────────────
  const formLogic = useCourseFormLogic();

  // ─── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    const params = {
      page: currentPage,
      search: debouncedSearch || undefined,
      status: selectedStatus === "all" ? undefined : selectedStatus,
      category_id: selectedCategory === "all" ? undefined : selectedCategory,
    };
    if (showTrash) {
      if (trashPeriod) params.period = trashPeriod;
      getTrashedCourses(params);
    } else {
      getCourses(params);
    }
  }, [
    currentPage,
    getCourses,
    getTrashedCourses,
    debouncedSearch,
    selectedStatus,
    selectedCategory,
    showTrash,
    trashPeriod,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    debouncedSearch,
    selectedStatus,
    selectedCategory,
    showTrash,
    trashPeriod,
  ]);

  useEffect(() => {
    getCategoriesTree();
  }, [getCategoriesTree]);

  useEffect(() => {
    if (showForm) {
      getTags();
      getInstructors();
    }
  }, [showForm, getTags, getInstructors]);

  useEffect(() => {
    const courseId = searchParams.get("course");
    if (!courseId || showForm) return;

    let cancelled = false;

    (async () => {
      const fullCourse = await getCourseById(courseId);
      if (cancelled || !fullCourse) return;

      setViewingItem(null);
      setEditingItem(fullCourse);
      formLogic.setFormData(mapItemToFormData(fullCourse));
      formLogic.setThumbnailFile(null);
      formLogic.setCoverFile(null);
      formLogic.setActiveTab("basic");
      setShowForm(true);
      setSearchParams({}, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, showForm, getCourseById, formLogic, setSearchParams]);

  // ─── Client-side filter (second layer over API results) ───────────────────
  const filteredCourses = React.useMemo(() => {
    return (courses || []).filter((course) => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch =
        !debouncedSearch ||
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
  }, [courses, debouncedSearch, selectedStatus, selectedCategory]);

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const buildFetchParams = () => ({
    page: currentPage,
    search: debouncedSearch || undefined,
    status: selectedStatus === "all" ? undefined : selectedStatus,
    category_id: selectedCategory === "all" ? undefined : selectedCategory,
  });

  const refreshList = () => {
    const params = buildFetchParams();
    if (showTrash) {
      if (trashPeriod) params.period = trashPeriod;
      getTrashedCourses(params);
    } else {
      getCourses(params);
    }
  };

  // ─── View handlers ─────────────────────────────────────────────────────────
  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    formLogic.resetForm();
    setShowForm(true);
  };

  const handleEdit = async (course) => {
    const fullCourse = await getCourseById(course.id);
    if (!fullCourse) return;
    setViewingItem(null);
    setEditingItem(fullCourse);
    formLogic.setFormData(mapItemToFormData(fullCourse));
    formLogic.setThumbnailFile(null);
    formLogic.setCoverFile(null);
    formLogic.setActiveTab("basic");
    setShowForm(true);
  };

  const handleView = async (course) => {
    const fullCourse = await getCourseById(course.id);
    if (!fullCourse) return;
    setEditingItem(null);
    setViewingItem(fullCourse);
    formLogic.setFormData(mapItemToFormData(fullCourse));
    formLogic.setThumbnailFile(null);
    formLogic.setCoverFile(null);
    formLogic.setActiveTab("basic");
    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    formLogic.setActiveTab("view");
  };

  // ─── CRUD handlers ─────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const course = courses.find((item) => item.id === id);
    const ok = await showDeleteConfirm(course?.title || course?.name || "");
    if (ok) {
      await deleteCourse(id);
      refreshList();
    }
  };

  const handleRestore = async (id) => {
    const ok = await restoreCourse(id);
    if (ok) refreshList();
  };

  const handleForceDelete = async (id) => {
    const course = courses.find((item) => item.id === id);
    const ok = await showDeleteConfirm(course?.title || course?.name || "");
    if (ok) {
      const success = await forceDeleteCourse(id);
      if (success) refreshList();
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    const ok = await showConfirmCustom({
      title:
        newStatus === "published"
          ? isArabic
            ? "نشر الكورس"
            : "Publish Course"
          : isArabic
            ? "تحويل الكورس إلى مسودة"
            : "Move Course to Draft",

      message:
        newStatus === "draft"
          ? isArabic
            ? "هل تريد تحويل هذا الكورس إلى مسودة وإخفاءه عن المستخدمين؟"
            : "Do you want to move this course to draft and hide it from users?"
          : isArabic
            ? "سيتم نشر الكورس وسيصبح متاحاً للمستخدمين."
            : "The course will be published and visible to users.",

      icon: newStatus === "draft" ? "warning" : "info",
      variant: newStatus === "draft" ? "danger" : "primary",
      confirmText: isArabic ? "استمرار" : "Proceed",
    });

    if (!ok) return;

    try {
      const fd = new FormData();
      fd.append("status", newStatus);

      await updateCourse(id, fd);
      refreshList();
    } catch (err) {
      console.error("Status update failed:", err);
    }
  };

  // ─── Form submission ───────────────────────────────────────────────────────
  const handleSubmitWrapper = async (e, forceStatus = null) => {
    if (e) e.preventDefault();

    const { formData, thumbnailFile, coverFile } = formLogic;

    // Build the previews array from the curriculum, then filter out incomplete entries
    const previews = formData.curriculum
      .flatMap((section) =>
        section.lessons.map((lesson) => {
          // Normalize provider to backend-accepted values: youtube | vimeo | upload | external
          const rawProvider = lesson.provider?.toLowerCase() || "upload";
          let normalizedProvider;
          if (rawProvider === "youtube") normalizedProvider = "youtube";
          else if (rawProvider === "vimeo") normalizedProvider = "vimeo";
          else if (rawProvider === "upload" || rawProvider === "html5") normalizedProvider = "upload";
          else normalizedProvider = "external"; // google_drive and any unknown → external

          const isUploadProvider = normalizedProvider === "upload";

          // Priority for video value:
          //   Upload provider → send uploaded server path OR raw File (binary)
          //   Link providers  → send URL string only
          let videoValue = null;
          if (isUploadProvider) {
            // Upload: prefer server-returned path, then raw File (create mode)
            if (lesson.uploadedVideoUrl) {
              videoValue = lesson.uploadedVideoUrl;
            } else if (lesson.videoFile instanceof File) {
              videoValue = lesson.videoFile;
            } else if (
              lesson.video &&
              typeof lesson.video === "string" &&
              lesson.video.trim() &&
              // Only include if it looks like a storage path (not a youtube/external URL)
              !lesson.video.includes("youtu") &&
              !lesson.video.includes("drive.google")
            ) {
              videoValue = lesson.video.trim();
            }
          } else {
            // Link providers (youtube, vimeo, external): send the raw URL string
            if (lesson.video && typeof lesson.video === "string" && lesson.video.trim()) {
              videoValue = lesson.video.trim();
            }
          }

          return {
            id: String(lesson.id).includes("lesson-") ? null : lesson.id,
            title: lesson.title?.trim() ?? "",
            description: lesson.description?.trim() ?? "",
            video_url: videoValue,
            video_provider: normalizedProvider,
            sort_order: lesson.sort_order ?? 0,
            duration_seconds: lesson.duration ?? "",
          };
        }),
      )
      // Drop rows that have neither a title nor any video data
      .filter(
        (preview) =>
          preview.title !== "" ||
          preview.video_url instanceof File ||
          (typeof preview.video_url === "string" && preview.video_url !== ""),
      );

    console.log("PREVIEWS SENT:", JSON.stringify(previews, null, 2));
    console.log("PREVIEWS COUNT:", previews.length);

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
      published_at:
        forceStatus === "published"
          ? formData.published_at
            ? formatDateForMySQL(formData.published_at)
            : formatDateForMySQL(new Date())
          : formatDateForMySQL(formData.published_at),
      tags: formData.tags?.length > 0 ? formData.tags : undefined,
      learnings: formData.learnings
        ? formData.learnings.filter((l) => l && l.trim() !== "")
        : [],
      previews,
    };

    if (thumbnailFile) payload.thumbnail = thumbnailFile;
    if (coverFile) payload.cover_image = coverFile;

    const fd = buildFormData(payload);

    // Append _method only once to avoid conflicts with method-spoofing middleware
    if (editingItem && !fd.has("_method")) {
      fd.append("_method", "PUT");
    }

    setSubmitting(true);
    try {
      if (editingItem) {
        await updateCourse(editingItem.id, fd);
      } else {
        await createCourse(fd);
      }
      handleBack();
      refreshList();
    } catch (err) {
      console.error("Submission failed:", err);
      console.log("ERROR DETAILS:", err.response?.data);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Video modal handlers ──────────────────────────────────────────────────
  const handlePlayVideo = (url, title) => {
    if (!url) return;

    // Blob URLs and full http(s) URLs are used as-is.
    // Relative server paths (e.g. "courses/previews/abc.mp4") are prefixed
    // with the storage base URL so the <video> element can load them.
    let playUrl = url;
    if (!url.startsWith("blob:") && !url.startsWith("http")) {
      const base = (import.meta.env.VITE_API_URL || "")
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");
      const path = url.startsWith("/") ? url.slice(1) : url;
      playUrl = `${base}/storage/${path}`;
    }

    setVideoPreviewUrl(playUrl);
    setVideoTitle(title);
    setShowVideoModal(true);
  };

  const handleCloseVideo = () => {
    setShowVideoModal(false);
    setVideoPreviewUrl(null);
  };

  const isReadOnly = !!viewingItem;

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-content-page">
      {!showForm ? (
        /* ── List view ────────────────────────────────────────────────────── */
        <>
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">
                {showTrash
                  ? isArabic
                    ? "الكورسات المحذوفة (الأرشيف)"
                    : "Archived Courses (Trash)"
                  : t("courses_page.title", "Courses")}
              </h2>
              <p className="ac-subtitle text-muted mb-0">
                {t("courses_page.subtitle", "Manage all courses")}
              </p>
            </div>
            <div className="d-flex gap-2">
              {!showTrash && (
                <button
                  className="btn btn-danger ac-add-btn"
                  onClick={handleAddNew}
                >
                  <i className="bi bi-plus-lg me-0 me-md-1"></i>
                  <span className="d-none d-md-inline">
                    {t("courses_page.add_course", "Add Course")}
                  </span>
                </button>
              )}
              <button
                className="btn btn-outline-dark ac-add-btn"
                style={{ color: "#ffffff" }}
                onClick={() => {
                  if (showTrash) {
                    setShowTrash(false);
                    setTrashPeriod("");
                    setSelectedStatus("all");
                    setSelectedCategory("all");
                  } else {
                    setShowTrash(true);
                  }
                }}
              >
                <i
                  className={`bi ${showTrash ? "bi-arrow-left" : "bi-trash"} me-0 me-md-2`}
                ></i>
                <span className="d-none d-md-inline">
                  {showTrash
                    ? isArabic
                      ? "العودة للكورسات النشطة"
                      : "Back to Active Courses"
                    : isArabic
                      ? "سلة المحذوفات"
                      : "Trash"}
                </span>
              </button>
            </div>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0" dir="ltr">
                <CourseFilters
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedStatus={selectedStatus}
                  setSelectedStatus={setSelectedStatus}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  categories={treeCategories}
                  showTrash={showTrash}
                  trashPeriod={trashPeriod}
                  setTrashPeriod={setTrashPeriod}
                  isArabic={isArabic}
                  t={t}
                />
                <CourseTable
                  filteredCourses={filteredCourses}
                  loading={loading}
                  showTrash={showTrash}
                  isArabic={isArabic}
                  t={t}
                  handleView={handleView}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  handleRestore={handleRestore}
                  handleForceDelete={handleForceDelete}
                  handleStatusChange={handleStatusChange}
                  apiPagination={apiPagination}
                  handlePageChange={setCurrentPage}
                />
              </div>
              {apiPagination ? (
                <AdminPagination className=""
                  pagination={apiPagination}
                  onPageChange={setCurrentPage}
                />
              ) : null}

            </div>
          </div>
        </>
      ) : (
        /* ── Form view ────────────────────────────────────────────────────── */
        <CourseForm
          isReadOnly={isReadOnly}
          editingItem={editingItem}
          viewingItem={viewingItem}
          handleBack={handleBack}
          handleSubmitWrapper={handleSubmitWrapper}
          {...formLogic}
          categories={categories}
          instructors={instructors}
          availableTags={availableTags}
          handlePlayVideo={handlePlayVideo}
          isArabic={isArabic}
          t={t}
        />
      )}

      {/* Submitting overlay */}
      {submitting && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg text-center d-flex flex-column align-items-center"
            style={{ minWidth: "280px" }}
          >
            <div
              className="spinner-border text-danger mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {editingItem
                ? isArabic
                  ? "جاري تحديث الكورس..."
                  : "Updating course..."
                : isArabic
                  ? "جاري إنشاء الكورس..."
                  : "Creating course..."}
            </h5>
            <p className="text-muted small mb-0">
              {isArabic
                ? "يرجى عدم إغلاق أو تحديث الصفحة"
                : "Please do not close or refresh the page"}
            </p>
          </div>
        </div>
      )}

      {/* Video preview modal */}
      <VideoPreviewModal
        show={showVideoModal}
        onHide={handleCloseVideo}
        videoUrl={videoPreviewUrl}
        videoTitle={videoTitle}
        isArabic={isArabic}
      />
    </div>
  );
}

export default AdminCourses;
