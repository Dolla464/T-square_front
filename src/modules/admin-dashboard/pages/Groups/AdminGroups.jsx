import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Pagination } from "react-bootstrap";
import { useInstructors } from "../../hooks/useInstractor";
import { useGroups } from "../../hooks/useGroups";
import { showDeleteConfirm } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import "../../components/shared/AdminContentPage/AdminContentPage.css";

const DAY_NAMES_EN = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];
const DAY_NAMES_AR = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const EMPTY_SCHEDULE = {
  day_of_week: 0,
  start_time: "",
  end_time: "",
  room: "",
};

const defaultFormData = {
  group_name: "",
  course_id: "",
  instructor_id: "",
  start_date: "",
  schedules: [],
  students: [],
};

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the next occurrence date-string (YYYY-MM-DD) for a schedule array */
function getNextSessionDate(schedules) {
  if (!schedules || schedules.length === 0) return null;

  // Map our day numbering (0=Sat…6=Fri) → JS getDay() (0=Sun…6=Sat)
  const toJsDay = [6, 0, 1, 2, 3, 4, 5];

  const now = new Date();
  const nowDay = now.getDay();
  const nowMs = now.getTime();

  let earliest = null;

  schedules.forEach((s) => {
    const jsDay = toJsDay[s.day_of_week];
    if (jsDay === undefined) return;

    let diff = (jsDay - nowDay + 7) % 7;

    // If same day, check if the session hasn't passed yet
    if (diff === 0) {
      const [h, m] = (s.start_time || "00:00").split(":").map(Number);
      const sessionMs = new Date(now).setHours(h, m, 0, 0);
      if (sessionMs <= nowMs) diff = 7; // already passed today, next week
    }

    const candidate = new Date(now);
    candidate.setDate(now.getDate() + diff);

    if (!earliest || candidate < earliest.date) {
      earliest = { date: candidate, schedule: s };
    }
  });

  if (!earliest) return null;

  const d = earliest.date;
  const pad = (n) => String(n).padStart(2, "0");
  return {
    dateStr: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: earliest.schedule.start_time,
    dayName: DAY_NAMES_EN[earliest.schedule.day_of_week],
  };
}

// ── Component ────────────────────────────────────────────────────────────────

function AdminGroups() {
  const {
    groups,
    pagination: apiPagination,
    loading,
    availableStudents,
    getGroups,
    getGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    getAvailableStudents,
  } = useGroups();
  const { courses, getCourses } = useAdminCourses();
  const { instructors, getInstructors } = useInstructors();

  const { t, i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // ── State ──────────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scheduleErrors, setScheduleErrors] = useState([]);

  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    getGroups({
      page: currentPage,
      search: debouncedSearch,
      time: timeFilter === "all" ? "" : timeFilter,
      course_id: courseFilter === "all" ? "" : courseFilter,
      instructor_id: instructorFilter === "all" ? "" : instructorFilter,
    });
  }, [
    getGroups,
    currentPage,
    debouncedSearch,
    timeFilter,
    courseFilter,
    instructorFilter,
  ]);

  useEffect(() => {
    getCourses({ per_page: 100 });
    getInstructors({ per_page: 100 });
  }, [getCourses, getInstructors]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, timeFilter, courseFilter, instructorFilter]);

  const handlePageChange = (page) => setCurrentPage(page);

  const filteredGroups = useMemo(() => {
    if (!groups) return [];
    return groups.filter((group) => {
      const matchCourse =
        courseFilter === "all" ||
        String(group.course_id) === String(courseFilter);
      const matchInstructor =
        instructorFilter === "all" ||
        String(group.instructor_id) === String(instructorFilter);

      let matchTime = true;
      if (group.created_at) {
        if (timeFilter === "last_week") {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          matchTime = new Date(group.created_at) >= lastWeek;
        } else if (timeFilter === "last_month") {
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          matchTime = new Date(group.created_at) >= lastMonth;
        }
      }

      return matchCourse && matchInstructor && matchTime;
    });
  }, [groups, courseFilter, instructorFilter, timeFilter]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setViewingItem(null);
    setEditingItem(null);
    setFormData(defaultFormData);
    setSelectedStudents([]);
    setScheduleErrors([]);
    setShowForm(true);
  };

  const handleEdit = async (group_id) => {
    setViewingItem(null);
    setEditingItem(group_id);
    setSelectedStudents([]);
    setScheduleErrors([]);

    const groupData = await getGroupById(group_id);

    const normalizedStudents = groupData.students
      ? groupData.students.map((s) => ({ ...s, id: Number(s.id) }))
      : [];

    setFormData({
      group_name: groupData.group_name || "",
      course_id: groupData.course_id ? Number(groupData.course_id) : "",
      course_title: groupData.course_title || "",
      instructor_id: groupData.instructor_id
        ? Number(groupData.instructor_id)
        : "",
      instructor_name: groupData.instructor_name || "",
      start_date: groupData.start_date || "",
      schedules: groupData.schedules
        ? groupData.schedules.map((s) => ({
            day_of_week: Number(s.day_of_week),
            start_time: s.start_time || "",
            end_time: s.end_time || "",
            room: s.room || "",
          }))
        : [],
      students_count: groupData.students_count || 0,
      students: normalizedStudents,
    });

    await getAvailableStudents(group_id);
    setShowForm(true);
  };

  const handleView = async (group_id) => {
    setEditingItem(null);
    setViewingItem(group_id);
    setSelectedStudents([]);
    setScheduleErrors([]);

    const group = await getGroupById(group_id);
    const normalizedStudents = group.students
      ? group.students.map((s) => ({ ...s, id: Number(s.id) }))
      : [];

    setFormData({
      group_name: group.group_name || "",
      course_id: group.course_id ? Number(group.course_id) : "",
      course_title: group.course_title || "",
      instructor_id: group.instructor_id ? Number(group.instructor_id) : "",
      instructor_name: group.instructor_name || "",
      start_date: group.start_date || "",
      end_date: group.end_date || "",
      schedules: group.schedules
        ? group.schedules.map((s) => ({
            day_of_week: Number(s.day_of_week),
            start_time: s.start_time || "",
            end_time: s.end_time || "",
            room: s.room || "",
          }))
        : [],
      students_count: group.students_count || 0,
      students: normalizedStudents,
    });

    setShowForm(true);
  };

  const handleBack = () => {
    setShowForm(false);
    setEditingItem(null);
    setViewingItem(null);
    setSelectedStudents([]);
    setScheduleErrors([]);
  };

  const handleDelete = async (groupId) => {
    const group = groups.find((item) => item.id === groupId);
    const ok = await showDeleteConfirm(group?.group_name || "");
    if (ok) {
      const success = await deleteGroup(groupId);
      if (success) getGroups({ page: currentPage });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "course_id" || name === "instructor_id"
            ? Number(value)
            : value,
    }));
  };

  // ── Schedule management ──────────────────────────────────────────────────

  const addSchedule = () => {
    setFormData((prev) => ({
      ...prev,
      schedules: [...prev.schedules, { ...EMPTY_SCHEDULE }],
    }));
    setScheduleErrors((prev) => [...prev, {}]);
  };

  const removeSchedule = (index) => {
    setFormData((prev) => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index),
    }));
    setScheduleErrors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = prev.schedules.map((s, i) =>
        i === index
          ? { ...s, [field]: field === "day_of_week" ? Number(value) : value }
          : s,
      );
      return { ...prev, schedules: updated };
    });

    // Clear the error for that field when the user edits it
    setScheduleErrors((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: undefined };
      }
      return updated;
    });
  };

  // ── Student management ───────────────────────────────────────────────────

  const handleRemoveStudentLocal = (studentId) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.filter((s) => Number(s.id) !== Number(studentId)),
      students_count: Math.max(0, prev.students_count - 1),
    }));
  };

  const toggleStudentSelection = (studentId) => {
    const targetId = Number(studentId);
    setSelectedStudents((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId],
    );
  };

  const normalizedAvailableStudents = useMemo(() => {
    if (!availableStudents) return [];
    return availableStudents.map((s) => ({ ...s, id: Number(s.id) }));
  }, [availableStudents]);

  const filteredAvailableStudents = useMemo(() => {
    if (!normalizedAvailableStudents) return [];
    if (!formData.students) return normalizedAvailableStudents;
    return normalizedAvailableStudents.filter(
      (student) =>
        !formData.students.some((curr) => Number(curr.id) === student.id),
    );
  }, [normalizedAvailableStudents, formData.students]);

  const toggleSelectAllStudents = () => {
    if (
      selectedStudents.length === filteredAvailableStudents.length &&
      filteredAvailableStudents.length > 0
    ) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredAvailableStudents.map((s) => s.id));
    }
  };

  const handleLocalStatusChange = (studentId, newStatus) => {
    setFormData((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId
          ? { ...s, is_completed: newStatus === "completed" }
          : s,
      ),
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────

  const validateSchedules = () => {
    let valid = true;
    const errors = formData.schedules.map((s) => {
      const err = {};
      if (!s.start_time) {
        err.start_time = isArabic
          ? "وقت البدء مطلوب"
          : "Start time is required";
        valid = false;
      }
      if (!s.end_time) {
        err.end_time = isArabic
          ? "وقت الانتهاء مطلوب"
          : "End time is required";
        valid = false;
      }
      if (s.start_time && s.end_time && s.end_time <= s.start_time) {
        err.end_time = isArabic
          ? "يجب أن يكون وقت الانتهاء بعد وقت البدء"
          : "End time must be after start time";
        valid = false;
      }
      return err;
    });
    setScheduleErrors(errors);
    return valid;
  };

  // ── Submit ───────────────────────────────────────────────────────────────

  const handleSubmitWrapper = async (e) => {
    e.preventDefault();

    if (!formData.group_name) {
      toastError(isArabic ? "يجب إدخال اسم المجموعة" : "Group name is required");
      return;
    }

    if (!formData.start_date) {
      toastError(isArabic ? "تاريخ البدء مطلوب" : "Start date is required");
      return;
    }

    if (!formData.schedules || formData.schedules.length === 0) {
      toastError(
        isArabic
          ? "يجب إضافة جدول أسبوعي واحد على الأقل"
          : "At least one weekly schedule is required",
      );
      return;
    }

    if (!validateSchedules()) return;

    try {
      if (editingItem) {
        const allStudentsData = [
          ...formData.students.map((s) => ({
            id: Number(s.id),
            is_completed: !!s.is_completed,
          })),
          ...selectedStudents.map((id) => ({
            id: Number(id),
            is_completed: false,
          })),
        ];

        const student_ids = allStudentsData.map((s) => s.id);
        const student_statuses = {};
        allStudentsData.forEach((s) => {
          student_statuses[String(s.id)] = s.is_completed;
        });

        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          instructor_id: Number(formData.instructor_id),
          start_date: formData.start_date,
          schedules: formData.schedules,
          student_ids,
          student_statuses,
        };

        await updateGroup(editingItem, payload);
      } else {
        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          instructor_id: Number(formData.instructor_id),
          start_date: formData.start_date,
          schedules: formData.schedules,
        };
        await createGroup(payload);
      }

      getGroups({ page: currentPage });
      handleBack();
    } catch (err) {}
  };

  // ── Today's date (min for date input) ────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-content-page">
      {!showForm ? (
        <>
          {/* ── List header ── */}
          <div className="ac-header d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="ac-title">
                {isArabic ? "المجموعات الدراسيه" : "Learning Groups"}
              </h2>
              <p className="ac-subtitle text-muted mb-0">
                {isArabic
                  ? "ادارة جميع المجموعات الدراسيه "
                  : "Manage all learning groups"}
              </p>
            </div>
            <button
              className="btn btn-danger ac-add-btn"
              onClick={handleAddNew}
            >
              <i className="bi bi-plus-lg me-0 me-md-1"></i>
              <span className="d-none d-md-inline">
                {isArabic ? "اضافه مجموعه" : "Add Group"}
              </span>
            </button>
          </div>

          <div className="ac-table-card">
            <div className="ac-table-container">
              <div className="ac-rounded-table p-3 p-md-0">
                {/* ── Filters ── */}
                <div className="ac-filters-bar d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 gap-5">
                  <div className="ac-search-input-wrapper position-relative">
                    <i
                      className={`bi bi-search position-absolute start-0 top-50 translate-middle-y ms-3 pe-none ${searchTerm ? "text-danger fw-bold" : "text-muted"}`}
                      style={{ zIndex: 3 }}
                    ></i>
                    <input
                      type="text"
                      className={`form-control ac-search-input ps-5 py-2 border-2 rounded-3 shadow-sm transition-all ${searchTerm ? "border-danger bg-danger-subtle text-danger-emphasis fw-medium" : "border-light bg-light text-muted"}`}
                      placeholder={
                        isArabic
                          ? "بحث عن مجموعة دراسية..."
                          : "Search By Group Name or Course Name..."
                      }
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ zIndex: 1, position: "relative" }}
                    />
                  </div>

                  <div className="d-flex gap-2 gap-md-3 flex-wrap flex-md-nowrap">
                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${timeFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل الأوقات" : "All Time"}
                      </option>
                      <option value="last_week">
                        {isArabic ? "آخر أسبوع" : "Last Week"}
                      </option>
                      <option value="last_month">
                        {isArabic ? "آخر شهر" : "Last Month"}
                      </option>
                    </select>

                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${instructorFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                      value={instructorFilter}
                      onChange={(e) => setInstructorFilter(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل المحاضرين" : "All Instructors"}
                      </option>
                      {instructors?.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.full_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── Table ── */}
                <div className="table-responsive">
                  <table className="table ac-table mb-0 align-middle" dir="ltr">
                    <thead>
                      <tr>
                        <th>{isArabic ? "اسم المجموعة" : "Group Name"}</th>
                        <th className="text-center">
                          {isArabic ? "عنوان الدورة" : "Course Title"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "اسم المحاضر" : "Instructor Name"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الجلسة القادمة" : "Next Session"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "عدد الطلاب" : "Students"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "تاريخ الإنشاء" : "Created At"}
                        </th>
                        <th className="text-center">
                          {isArabic ? "الإجراءات" : "Actions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="text-center py-5">
                            <div
                              className="spinner-border text-danger"
                              role="status"
                            >
                              <span className="visually-hidden">Loading...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredGroups && filteredGroups.length > 0 ? (
                        filteredGroups.map((group) => {
                          const next = getNextSessionDate(group.schedules);
                          return (
                            <tr key={group.id}>
                              <td className="fw-medium text-dark">
                                {group.group_name}
                              </td>
                              <td className="text-center text-secondary">
                                {group.course_title}
                              </td>
                              <td className="text-center text-secondary">
                                {group.instructor_name}
                              </td>
                              <td className="text-center">
                                {next ? (
                                  <span className="badge bg-danger-subtle text-danger-emphasis rounded-pill px-3 py-2">
                                    <i className="bi bi-calendar-event me-1"></i>
                                    {next.dateStr}
                                    <span className="ms-1 opacity-75">
                                      {next.time}
                                    </span>
                                  </span>
                                ) : (
                                  <span className="text-muted small">
                                    {isArabic ? "لا يوجد جدول" : "No schedule"}
                                  </span>
                                )}
                              </td>
                              <td className="text-center text-secondary">
                                {group.students_count}
                              </td>
                              <td className="text-center text-secondary">
                                {group.created_at}
                              </td>
                              <td className="text-center">
                                <div className="d-flex justify-content-center gap-2">
                                  <button
                                    className="btn btn-sm ac-btn-view border-0"
                                    title="View"
                                    onClick={() => handleView(group.id)}
                                  >
                                    <i className="bi bi-eye fs-6"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm ac-btn-edit border-0"
                                    title="Edit"
                                    onClick={() => handleEdit(group.id)}
                                  >
                                    <i className="bi bi-pencil-square fs-6"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm ac-btn-deleteTable border-0"
                                    title="Delete"
                                    onClick={() => handleDelete(group.id)}
                                  >
                                    <i className="bi bi-trash fs-6"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="text-center py-4 text-muted"
                          >
                            {isArabic ? "لا توجد مجموعات" : "No groups found"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Pagination ── */}
            {apiPagination && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination className="custom-pagination">
                  <Pagination.Prev
                    disabled={apiPagination.current_page === 1}
                    onClick={() =>
                      handlePageChange(apiPagination.current_page - 1)
                    }
                  />
                  {(() => {
                    const cp = apiPagination.current_page;
                    const total = apiPagination.total_pages;
                    const start = Math.floor((cp - 1) / 3) * 3 + 1;
                    const end = Math.min(start + 2, total);
                    const items = [];

                    if (start > 1) {
                      items.push(
                        <Pagination.Ellipsis
                          key="prev-ellipsis"
                          onClick={() => handlePageChange(start - 1)}
                        />,
                      );
                    }

                    for (let p = start; p <= end; p++) {
                      items.push(
                        <Pagination.Item
                          style={{ margin: "0 3px" }}
                          key={p}
                          active={cp === p}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Pagination.Item>,
                      );
                    }

                    if (end < total) {
                      items.push(
                        <Pagination.Ellipsis
                          key="next-ellipsis"
                          onClick={() => handlePageChange(end + 1)}
                        />,
                      );
                    }

                    return items;
                  })()}
                  <Pagination.Next
                    style={{ margin: "0 6px 0" }}
                    disabled={
                      apiPagination.current_page === apiPagination.total_pages
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
        /* ══════════════════════════════════════════════════════════════════
           FORM PANEL (Add / Edit / View)
           ══════════════════════════════════════════════════════════════════ */
        <div className="ac-form-container">
          <div className="ac-form-header d-flex justify-content-between align-items-center mb-4">
            <button className="ac-back-btn" onClick={handleBack}>
              <i
                className={`bi ${isArabic ? "bi-arrow-right" : "bi-arrow-left"}`}
              ></i>
              <span className="ms-2 me-2 fs-5 fw-bold text-dark">
                {viewingItem
                  ? isArabic
                    ? "عرض بيانات المجموعة"
                    : "View Group"
                  : editingItem
                    ? isArabic
                      ? "تعديل بيانات المجموعة"
                      : "Edit Group"
                    : isArabic
                      ? "إضافة مجموعة جديدة"
                      : "Add New Group"}
              </span>
            </button>
          </div>

          <div className="ac-form-body p-4 bg-white border rounded-4 shadow-sm">
            <div className="ac-tab-content basic-info">

              {/* ── Group Name ── */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "اسم المجموعة" : "Group Name"}
                </label>
                <input
                  type="text"
                  name="group_name"
                  className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                  placeholder={
                    isArabic ? "أدخل اسم المجموعة" : "Enter group name"
                  }
                  value={formData.group_name || ""}
                  onChange={handleChange}
                  disabled={!!viewingItem}
                />
              </div>

              {/* ── Course + Instructor ── */}
              <div className="row mb-4">
                <div className="col-md-6 mb-3 mb-md-0">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "عنوان الدورة" : "Course Title"}
                  </label>
                  <select
                    name="course_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.course_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem || !!editingItem}
                  >
                    {viewingItem || editingItem ? (
                      <option value={formData.course_id || ""}>
                        {formData.course_title || ""}
                      </option>
                    ) : (
                      <>
                        <option value="">
                          {isArabic ? "اختر دورة" : "Select course"}
                        </option>
                        {courses?.map((course) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-bold text-dark">
                    {isArabic ? "المحاضر" : "Instructor"}
                  </label>
                  <select
                    name="instructor_id"
                    className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                    value={formData.instructor_id || ""}
                    onChange={handleChange}
                    disabled={!!viewingItem}
                  >
                    <option value="">
                      {isArabic ? "اختر محاضر" : "Select instructor"}
                    </option>
                    {instructors?.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.full_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ── Start Date / End Date ── */}
              <div className="mb-4">
                {viewingItem ? (
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-bold text-dark">
                        <i className="bi bi-calendar-date me-2 text-danger"></i>
                        {isArabic ? "تاريخ بدء المجموعة" : "Group Start Date"}
                      </label>
                      <p className="form-control-plaintext fw-medium ps-1 mb-0">
                        {formData.start_date || "—"}
                      </p>
                    </div>
                    <div className="col-sm-6">
                      <label className="form-label fw-bold text-dark">
                        <i className="bi bi-calendar-check me-2 text-danger"></i>
                        {isArabic ? "تاريخ انتهاء المجموعة" : "Group End Date"}
                      </label>
                      <p className="form-control-plaintext fw-medium ps-1 mb-0">
                        {formData.end_date || "—"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <label className="form-label fw-bold text-dark">
                      <i className="bi bi-calendar-date me-2 text-danger"></i>
                      {isArabic ? "تاريخ بدء المجموعة" : "Group Start Date"}
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.start_date || ""}
                      min={todayStr}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      {isArabic
                        ? "تاريخ الانتهاء يُحسب تلقائياً من مدة الدورة"
                        : "End date is automatically calculated from the course duration"}
                    </small>
                  </>
                )}
              </div>

              {/* ══════════════════════════════════════════════════════════════
                  WEEKLY SCHEDULE SECTION
                  ══════════════════════════════════════════════════════════ */}
              <div className="mb-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <label className="form-label fw-bold text-dark mb-0">
                    <i className="bi bi-clock me-2 text-danger"></i>
                    {isArabic ? "الجدول الأسبوعي" : "Weekly Schedule"}
                  </label>
                  {!viewingItem && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-3"
                      onClick={addSchedule}
                    >
                      <i className="bi bi-plus-circle me-1"></i>
                      {isArabic ? "إضافة يوم" : "Add Day"}
                    </button>
                  )}
                </div>

                {/* ── View mode: read-only schedule cards ── */}
                {viewingItem && formData.schedules.length > 0 && (
                  <div className="d-flex flex-wrap gap-3">
                    {formData.schedules.map((s, i) => (
                      <div
                        key={i}
                        className="card border-0 shadow-sm p-3"
                        style={{
                          borderRadius: "12px",
                          minWidth: "210px",
                          background: "linear-gradient(135deg,#fff5f5,#fff)",
                        }}
                      >
                        <div className="d-flex align-items-center mb-2">
                          <span
                            className="badge bg-danger me-2"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {isArabic
                              ? DAY_NAMES_AR[s.day_of_week]
                              : DAY_NAMES_EN[s.day_of_week]}
                          </span>
                        </div>
                        <div className="text-secondary small">
                          <i className="bi bi-clock me-1"></i>
                          {s.start_time} – {s.end_time}
                        </div>
                        {s.room && (
                          <div className="text-muted small mt-1">
                            <i className="bi bi-door-open me-1"></i>
                            {s.room}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {viewingItem && formData.schedules.length === 0 && (
                  <p className="text-muted fst-italic">
                    {isArabic ? "لا يوجد جدول أسبوعي" : "No schedule defined"}
                  </p>
                )}

                {/* ── Edit / Add mode: editable schedule rows ── */}
                {!viewingItem && (
                  <>
                    {formData.schedules.length === 0 && (
                      <div
                        className="border border-dashed rounded-3 p-4 text-center text-muted"
                        style={{ borderColor: "#dee2e6", background: "#fafafa" }}
                      >
                        <i className="bi bi-calendar-plus fs-2 d-block mb-2 text-danger opacity-50"></i>
                        {isArabic
                          ? 'اضغط "إضافة يوم" لتحديد أيام الجلسات الأسبوعية'
                          : 'Click "Add Day" to define weekly session days'}
                      </div>
                    )}

                    {formData.schedules.map((s, i) => {
                      const err = scheduleErrors[i] || {};
                      return (
                        <div
                          key={i}
                          className="card border-0 shadow-sm mb-3 p-3"
                          style={{ borderRadius: "12px", background: "#fff9f9" }}
                        >
                          {/* Card header */}
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <span className="fw-bold text-danger small">
                              <i className="bi bi-calendar-week me-1"></i>
                              {isArabic ? `يوم ${i + 1}` : `Day ${i + 1}`}
                            </span>
                            <button
                              type="button"
                              className="btn btn-sm btn-link text-danger p-0"
                              onClick={() => removeSchedule(i)}
                              title={isArabic ? "حذف هذا اليوم" : "Remove day"}
                            >
                              <i className="bi bi-trash fs-5"></i>
                            </button>
                          </div>

                          <div className="row g-3">
                            {/* Day of week */}
                            <div className="col-sm-3">
                              <label className="form-label small fw-medium text-dark mb-1">
                                {isArabic ? "اليوم" : "Day"}
                              </label>
                              <select
                                className="form-select bg-light border-0 rounded-3"
                                value={s.day_of_week}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    i,
                                    "day_of_week",
                                    e.target.value,
                                  )
                                }
                              >
                                {DAY_NAMES_EN.map((name, idx) => (
                                  <option key={idx} value={idx}>
                                    {isArabic ? DAY_NAMES_AR[idx] : name}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Start time */}
                            <div className="col-sm-3">
                              <label className="form-label small fw-medium text-dark mb-1">
                                {isArabic ? "وقت البدء" : "Start Time"}
                              </label>
                              <input
                                type="time"
                                className={`form-control bg-light border-0 rounded-3 ${err.start_time ? "is-invalid" : ""}`}
                                value={s.start_time || ""}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    i,
                                    "start_time",
                                    e.target.value,
                                  )
                                }
                              />
                              {err.start_time && (
                                <div className="invalid-feedback">
                                  {err.start_time}
                                </div>
                              )}
                            </div>

                            {/* End time */}
                            <div className="col-sm-3">
                              <label className="form-label small fw-medium text-dark mb-1">
                                {isArabic ? "وقت الانتهاء" : "End Time"}
                              </label>
                              <input
                                type="time"
                                className={`form-control bg-light border-0 rounded-3 ${err.end_time ? "is-invalid" : ""}`}
                                value={s.end_time || ""}
                                onChange={(e) =>
                                  handleScheduleChange(
                                    i,
                                    "end_time",
                                    e.target.value,
                                  )
                                }
                              />
                              {err.end_time && (
                                <div className="invalid-feedback">
                                  {err.end_time}
                                </div>
                              )}
                            </div>

                            {/* Room */}
                            <div className="col-sm-3">
                              <label className="form-label small fw-medium text-dark mb-1">
                                {isArabic
                                  ? "القاعة (اختياري)"
                                  : "Room (optional)"}
                              </label>
                              <input
                                type="text"
                                className="form-control bg-light border-0 rounded-3"
                                placeholder={isArabic ? "مثال: A-101" : "e.g. A-101"}
                                value={s.room || ""}
                                onChange={(e) =>
                                  handleScheduleChange(i, "room", e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>

              {/* ── Group Statistics (edit / view) ── */}
              {(viewingItem || editingItem) && (
                <div className="row mb-4">
                  <div className="col-12">
                    <label className="form-label fw-bold text-dark mb-3">
                      {isArabic ? "إحصائيات المجموعة" : "Group Statistics"}
                    </label>
                    <div className="d-flex align-items-center p-3 bg-light rounded-3 border">
                      <div
                        className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center mx-3"
                        style={{ width: "45px", height: "45px" }}
                      >
                        <i className="bi bi-people-fill fs-5"></i>
                      </div>
                      <div>
                        <h6 className="mb-0 fw-bold text-dark fs-5">
                          {formData.students_count || 0}
                        </h6>
                        <small className="text-muted">
                          {isArabic ? "طالب مسجل" : "Enrolled Students"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Current Students Table ── */}
              {(viewingItem || editingItem) && (
                <div className="ac-table-card mt-4">
                  <div className="ac-table-container">
                    <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                      <div className="d-flex align-items-center">
                        <div
                          className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <i className="bi bi-people text-white"></i>
                        </div>
                        <div>
                          <h5 className="fw-bold mb-0 text-dark">
                            {isArabic
                              ? "الطلاب الحاليين بالمجموعة"
                              : "Current Group Students"}
                          </h5>
                          <p className="text-muted small mb-0">
                            {isArabic
                              ? "قائمة بالطلاب المسجلين في هذه المجموعة حالياً"
                              : "List of students currently enrolled in this group"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div
                      className="card border-0 shadow-sm overflow-hidden"
                      style={{
                        backgroundColor: "#f8f9fc",
                        borderRadius: "15px",
                      }}
                    >
                      <div className="table-responsive">
                        <table className="table mb-0 align-middle">
                          <thead>
                            <tr>
                              <th className="ps-4 py-3 border-0 text-secondary small fw-bold">
                                {isArabic ? "الطالب" : "Student"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold">
                                {isArabic ? "البريد الإلكتروني" : "Email"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                {isArabic ? "رقم الهاتف" : "Phone"}
                              </th>
                              <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                {isArabic ? "الحالة" : "Status"}
                              </th>
                              {editingItem && (
                                <th className="py-3 border-0 text-secondary small fw-bold text-center">
                                  {isArabic ? "إجراء" : "Action"}
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="border-0">
                            {formData.students && formData.students.length > 0 ? (
                              formData.students.map((student) => (
                                <tr
                                  key={`current-${student.id}`}
                                  style={{
                                    borderBottom: "1px solid rgba(0,0,0,0.03)",
                                  }}
                                >
                                  <td className="ps-4 py-3 fw-bold text-dark">
                                    {student.full_name}
                                  </td>
                                  <td className="py-3 text-muted">
                                    {student.email || "-"}
                                  </td>
                                  <td className="py-3 text-center text-muted">
                                    {student.phone || "-"}
                                  </td>
                                  <td className="py-3 text-center">
                                    {editingItem ? (
                                      <select
                                        className="form-select form-select-sm rounded-pill px-3 fw-medium text-center border-0 shadow-sm d-inline-block transition-all"
                                        style={{
                                          width: "135px",
                                          backgroundColor: student.is_completed
                                            ? "#d1e7dd"
                                            : "#fff3cd",
                                          color: student.is_completed
                                            ? "#0f5132"
                                            : "#664d03",
                                          cursor: "pointer",
                                          fontSize: "0.85rem",
                                        }}
                                        value={
                                          student.is_completed
                                            ? "completed"
                                            : "progress"
                                        }
                                        onChange={(e) =>
                                          handleLocalStatusChange(
                                            student.id,
                                            e.target.value,
                                          )
                                        }
                                      >
                                        <option value="progress">
                                          {isArabic ? "قيد الدراسة" : "In Progress"}
                                        </option>
                                        <option value="completed">
                                          {isArabic ? "مكتمل" : "Completed"}
                                        </option>
                                      </select>
                                    ) : (
                                      <span
                                        className="badge rounded-pill px-3 py-2 fw-medium shadow-sm"
                                        style={{
                                          backgroundColor: student.is_completed
                                            ? "#d1e7dd"
                                            : "#fff3cd",
                                          color: student.is_completed
                                            ? "#0f5132"
                                            : "#664d03",
                                          fontSize: "0.85rem",
                                        }}
                                      >
                                        <i
                                          className={`bi ${student.is_completed ? "bi-check-circle-fill" : "bi-hourglass-split"} me-1`}
                                        ></i>
                                        {student.is_completed
                                          ? isArabic
                                            ? "مكتمل"
                                            : "Completed"
                                          : isArabic
                                            ? "قيد الدراسة"
                                            : "In Progress"}
                                      </span>
                                    )}
                                  </td>
                                  {editingItem && (
                                    <td className="py-3 text-center">
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0"
                                        title={
                                          isArabic
                                            ? "إزالة مؤقتة من المجموعة"
                                            : "Remove locally"
                                        }
                                        onClick={() =>
                                          handleRemoveStudentLocal(student.id)
                                        }
                                      >
                                        <i className="bi bi-x-circle fs-5"></i>
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={editingItem ? 5 : 4}
                                  className="text-center py-4 text-muted"
                                >
                                  {isArabic
                                    ? "لا يوجد طلاب في المجموعة، اضغط تحديث لحفظ التغيير"
                                    : "No students in this group. Click update to save."}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Available Students Table ── */}
              {editingItem &&
                filteredAvailableStudents &&
                filteredAvailableStudents.length > 0 && (
                  <div className="ac-table-card mt-4">
                    <div className="ac-table-container">
                      <div className="d-flex align-items-center justify-content-between mb-3 mt-5">
                        <div className="d-flex align-items-center">
                          <div
                            className="bg-danger rounded-3 p-2 me-3 d-flex align-items-center justify-content-center shadow-sm"
                            style={{ width: "40px", height: "40px" }}
                          >
                            <i className="bi bi-person-plus text-white"></i>
                          </div>
                          <div>
                            <h5 className="fw-bold mb-0 text-dark">
                              {isArabic
                                ? "طلاب متاحين للإضافة للمجموعة"
                                : "Available Students to Add"}
                            </h5>
                            <p className="text-muted small mb-0">
                              {isArabic
                                ? "الطلاب المسجلون في الدورة وغير منضمين لأي مجموعة"
                                : "Students enrolled in the course but not assigned to any group"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input border-danger"
                            type="checkbox"
                            id="selectAllStudents"
                            checked={
                              selectedStudents.length ===
                                filteredAvailableStudents.length &&
                              filteredAvailableStudents.length > 0
                            }
                            onChange={toggleSelectAllStudents}
                            style={{
                              width: "1.2em",
                              height: "1.2em",
                              cursor: "pointer",
                            }}
                          />
                          <label
                            className="form-check-label ms-2 fw-medium text-dark"
                            htmlFor="selectAllStudents"
                            style={{ cursor: "pointer" }}
                          >
                            {isArabic ? "تحديد الكل" : "Select All"}
                          </label>
                        </div>
                      </div>

                      <div
                        className="card border-0 shadow-sm overflow-hidden"
                        style={{
                          backgroundColor: "#ffffff",
                          borderRadius: "15px",
                          border: "1px solid #eee",
                        }}
                      >
                        <div className="table-responsive">
                          <table className="table mb-0 align-middle table-hover">
                            <thead>
                              <tr>
                                <th
                                  className="ps-4 py-3 border-0"
                                  style={{ width: "50px" }}
                                ></th>
                                <th className="py-3 border-0 text-secondary small fw-bold">
                                  {isArabic ? "الطالب" : "Student"}
                                </th>
                                <th className="py-3 border-0 text-secondary small fw-bold">
                                  {isArabic ? "البريد الإلكتروني" : "Email"}
                                </th>
                                <th className="pe-4 py-3 border-0 text-secondary small fw-bold text-center">
                                  {isArabic ? "رقم الهاتف" : "Phone"}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAvailableStudents.map((student) => (
                                <tr
                                  key={`available-${student.id}`}
                                  className={
                                    selectedStudents.includes(student.id)
                                      ? "table-success"
                                      : ""
                                  }
                                >
                                  <td className="ps-4 py-3">
                                    <input
                                      type="checkbox"
                                      className="form-check-input border-danger"
                                      checked={selectedStudents.includes(
                                        student.id,
                                      )}
                                      onChange={() =>
                                        toggleStudentSelection(student.id)
                                      }
                                      style={{
                                        width: "1.2em",
                                        height: "1.2em",
                                        cursor: "pointer",
                                      }}
                                    />
                                  </td>
                                  <td className="py-3 fw-bold text-dark">
                                    {student.full_name || "-"}
                                  </td>
                                  <td className="py-3 text-muted">
                                    {student.email || "-"}
                                  </td>
                                  <td className="pe-4 py-3 text-center text-muted">
                                    {student.phone || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              {/* ── Submit button ── */}
              {!viewingItem && (
                <div className="d-flex justify-content-end mt-4 pt-4 border-top">
                  <button
                    className="btn btn-danger px-5 py-2 fw-medium rounded-3"
                    onClick={handleSubmitWrapper}
                  >
                    {editingItem
                      ? isArabic
                        ? "تحديث المجموعة"
                        : "Update Group"
                      : isArabic
                        ? "إنشاء مجموعة"
                        : "Create Group"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminGroups;
