import { useState, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import DetailModal from "../../../../components/shared/DetailModal/DetailModal";
import AdminPagination from "../../components/shared/AdminPagination";
import { useInstructors } from "../../hooks/useInstractor";
import { useGroups } from "../../hooks/useGroups";
import { showDeleteConfirm, showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { useAdminCourses } from "../../hooks/useAdminCourses";
import { toastError, toastSuccess } from "../../../../components/shared/Toaster/toaster";
import { getLearningGroupSessions, exportGroupStudents } from "../../services/learningGroupServices";
import { exportSchedule } from "../../services/adminScheduleService";
import { parseApiDateOnly } from "../../../../utils/formatDateTime";
import { getCourseInstructors } from "../../../../utils/courseInstructors";
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

const normalizeScheduleEntry = (s) => ({
  day_of_week: Number(s.day_of_week),
  start_time: (s.start_time || "").slice(0, 5),
  end_time: (s.end_time || "").slice(0, 5),
  room: s.room || "",
});

const normalizeSchedules = (schedules) =>
  [...(schedules || [])]
    .map(normalizeScheduleEntry)
    .sort((a, b) => a.day_of_week - b.day_of_week);

const dedupeStudentsById = (students) => {
  const seen = new Set();
  return (students || [])
    .map((s) => ({ ...s, id: Number(s.id) }))
    .filter((s) => {
      if (seen.has(s.id)) return false;
      seen.add(s.id);
      return true;
    });
};

const schedulesAreEqual = (current, original) =>
  JSON.stringify(normalizeSchedules(current)) ===
  JSON.stringify(normalizeSchedules(original));

const defaultFormData = {
  group_name: "",
  course_id: "",
  course_instructor_id: "",
  start_date: "",
  is_historical: false,
  status: "active",
  schedules: [],
  students: [],
};

const getCourseInstructorOptionId = (entry) =>
  entry?.course_instructor_id ?? entry?.id ?? "";

const getTodayDateStr = () => new Date().toISOString().split("T")[0];

const isDerivedHistoricalGroup = (group) => {
  if (!group?.start_date) return false;
  return group.start_date < getTodayDateStr();
};

const formatGroupSyncToast = (sync, isArabic, t) => {
  if (!sync) return null;

  const parts = [];

  if (sync.historical_backfill) {
    const bf = sync.historical_backfill;
    parts.push(
      t("groups_page.backfill_summary", {
        completed: bf.past_sessions_completed ?? 0,
        today: bf.today_upcoming ?? 0,
        future: bf.future_upcoming ?? 0,
      }),
    );
  }

  if (sync.enrollments_completed > 0) {
    parts.push(
      isArabic
        ? `${sync.enrollments_completed} طالب مكتمل`
        : `${sync.enrollments_completed} student(s) marked completed`,
    );
  }

  if (sync.enrollments_reopened > 0) {
    parts.push(
      isArabic
        ? `${sync.enrollments_reopened} طالب قيد الدراسة`
        : `${sync.enrollments_reopened} student(s) marked in progress`,
    );
  }

  if (sync.notifications_sent > 0) {
    parts.push(
      isArabic
        ? `${sync.notifications_sent} إشعار`
        : `${sync.notifications_sent} notification(s) sent`,
    );
  }

  if (sync.skipped_student_ids?.length > 0) {
    parts.push(
      isArabic
        ? `${sync.skipped_student_ids.length} طالب غير مشترك في الكورس`
        : `${sync.skipped_student_ids.length} student(s) skipped (not enrolled in course)`,
    );
  }

  return parts.length > 0 ? parts.join(" · ") : null;
};

const GROUP_STATUS_CONFIG = {
  active: {
    bg: "bg-success-subtle text-success",
    icon: "bi-play-circle-fill",
    labelEn: "Active",
    labelAr: "نشطة",
  },
  completed: {
    bg: "bg-secondary-subtle text-secondary",
    icon: "bi-check-circle-fill",
    labelEn: "Completed",
    labelAr: "مكتملة",
  },
  cancelled: {
    bg: "bg-danger-subtle text-danger",
    icon: "bi-x-circle-fill",
    labelEn: "Cancelled",
    labelAr: "ملغاة",
  },
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

const fmt = (t) => (t ? String(t).slice(0, 5) : "—");

const SESSION_STATUS_CONFIG = {
  upcoming: {
    bg: "bg-primary-subtle text-primary",
    icon: "bi-clock",
    labelEn: "Upcoming",
    labelAr: "قادمة",
  },
  active: {
    bg: "bg-success-subtle text-success",
    icon: "bi-play-circle-fill",
    labelEn: "Active",
    labelAr: "نشطة",
  },
  completed: {
    bg: "bg-secondary-subtle text-secondary",
    icon: "bi-check-circle-fill",
    labelEn: "Completed",
    labelAr: "مكتملة",
  },
  cancelled: {
    bg: "bg-danger-subtle text-danger",
    icon: "bi-x-circle-fill",
    labelEn: "Cancelled",
    labelAr: "ملغاة",
  },
};

const getEffectiveSession = (sess) => {
  const dateRaw = sess.override_date || sess.session_date || "";
  const effectiveDate = parseApiDateOnly(dateRaw);
  return {
    effectiveDate,
    effectiveStart: fmt(
      sess.override_start_time || sess.schedule?.start_time
    ),
    effectiveEnd: fmt(sess.override_end_time || sess.schedule?.end_time),
    room: sess.schedule?.room || "—",
  };
};

const getDayNameFromDate = (dateStr, isArabic) => {
  if (!dateStr) return "—";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "—";
  const jsToProjectDay = [1, 2, 3, 4, 5, 6, 0];
  const idx = jsToProjectDay[d.getDay()];
  return isArabic ? DAY_NAMES_AR[idx] : DAY_NAMES_EN[idx];
};

function GroupStatusBadge({ status, isArabic }) {
  const cfg = GROUP_STATUS_CONFIG[status] ?? {
    bg: "bg-light text-dark",
    icon: "bi-circle",
    labelEn: status,
    labelAr: status,
  };
  return (
    <span
      className={`badge rounded-pill px-2 py-1 ${cfg.bg}`}
      style={{ fontSize: "0.75rem" }}
    >
      <i className={`bi ${cfg.icon} me-1`}></i>
      {isArabic ? cfg.labelAr : cfg.labelEn}
    </span>
  );
}

function SessionStatusBadge({ status, isArabic }) {
  const cfg = SESSION_STATUS_CONFIG[status] ?? {
    bg: "bg-light text-dark",
    icon: "bi-circle",
    labelEn: status,
    labelAr: status,
  };
  return (
    <span
      className={`badge rounded-pill px-2 py-1 ${cfg.bg}`}
      style={{ fontSize: "0.75rem" }}
    >
      <i className={`bi ${cfg.icon} me-1`}></i>
      {isArabic ? cfg.labelAr : cfg.labelEn}
    </span>
  );
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
  const { courses, getCourses, getCourseById } = useAdminCourses();
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState(defaultFormData);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [scheduleErrors, setScheduleErrors] = useState([]);
  const originalSchedulesRef = useRef(null);
  const originalStatusRef = useRef("active");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [groupSessions, setGroupSessions] = useState([]);
  const [scheduleModalLoading, setScheduleModalLoading] = useState(false);
  const [scheduleExportLoading, setScheduleExportLoading] = useState(false);
  const [studentsExportLoading, setStudentsExportLoading] = useState(false);
  const [courseInstructorOptions, setCourseInstructorOptions] = useState([]);

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
    if (!formData.course_id) {
      setCourseInstructorOptions([]);
      return;
    }

    const course = courses?.find(
      (item) => Number(item.id) === Number(formData.course_id),
    );
    const fromList = getCourseInstructors(course);

    if (fromList.length) {
      setCourseInstructorOptions(fromList);
      return;
    }

    let cancelled = false;

    (async () => {
      const data = await getCourseById(formData.course_id);
      if (!cancelled && data) {
        setCourseInstructorOptions(getCourseInstructors(data));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [formData.course_id, courses, getCourseById]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, timeFilter, courseFilter, instructorFilter, statusFilter]);

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
      const matchStatus =
        statusFilter === "all" || group.status === statusFilter;

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

      return matchCourse && matchInstructor && matchStatus && matchTime;
    });
  }, [groups, courseFilter, instructorFilter, statusFilter, timeFilter]);

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

    const normalizedStudents = dedupeStudentsById(groupData.students);

    setFormData({
      group_name: groupData.group_name || "",
      course_id: groupData.course_id ? Number(groupData.course_id) : "",
      course_title: groupData.course_title || "",
      course_instructor_id: groupData.course_instructor_id
        ? Number(groupData.course_instructor_id)
        : "",
      instructor_name: groupData.instructor_name || "",
      start_date: groupData.start_date || "",
      status: groupData.status || "active",
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

    originalStatusRef.current = groupData.status || "active";

    originalSchedulesRef.current = groupData.schedules
      ? groupData.schedules.map((s) => ({
          day_of_week: Number(s.day_of_week),
          start_time: s.start_time || "",
          end_time: s.end_time || "",
          room: s.room || "",
        }))
      : [];

    await getAvailableStudents(group_id);
    setShowForm(true);
  };

  const handleView = async (group_id) => {
    setEditingItem(null);
    setViewingItem(group_id);
    setSelectedStudents([]);
    setScheduleErrors([]);

    const group = await getGroupById(group_id);
    const normalizedStudents = dedupeStudentsById(group.students);

    setFormData({
      group_name: group.group_name || "",
      course_id: group.course_id ? Number(group.course_id) : "",
      course_title: group.course_title || "",
      course_instructor_id: group.course_instructor_id
        ? Number(group.course_instructor_id)
        : "",
      instructor_name: group.instructor_name || "",
      start_date: group.start_date || "",
      end_date: group.end_date || "",
      status: group.status || "active",
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
    originalSchedulesRef.current = null;
    setShowScheduleModal(false);
    setGroupSessions([]);
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setGroupSessions([]);
  };

  const handleOpenScheduleModal = async () => {
    if (!viewingItem) return;
    setShowScheduleModal(true);
    setScheduleModalLoading(true);
    try {
      const res = await getLearningGroupSessions(viewingItem);
      setGroupSessions(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      toastError(
        err?.response?.data?.message ||
          (isArabic ? "فشل تحميل جدول المواعيد" : "Failed to load group schedule")
      );
      setGroupSessions([]);
    } finally {
      setScheduleModalLoading(false);
    }
  };

  const handleExportGroupSchedulePdf = async () => {
    if (!viewingItem) return;
    setScheduleExportLoading(true);
    try {
      await exportSchedule({ group_id: viewingItem }, "pdf");
    } catch (err) {
      toastError(
        err?.response?.data?.message ||
          (isArabic ? "فشل التصدير" : "Export failed. Please try again.")
      );
    } finally {
      setScheduleExportLoading(false);
    }
  };

  const handleExportGroupStudents = async (format) => {
    const groupId = viewingItem || editingItem;
    if (!groupId) return;
    setStudentsExportLoading(true);
    try {
      await exportGroupStudents(groupId, format);
    } catch (err) {
      toastError(
        err?.response?.data?.message ||
          (isArabic ? "فشل التصدير" : "Export failed. Please try again.")
      );
    } finally {
      setStudentsExportLoading(false);
    }
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
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]:
          type === "checkbox"
            ? checked
            : name === "course_id" || name === "course_instructor_id"
              ? value === ""
                ? ""
                : Number(value)
              : value,
      };

      if (name === "course_id") {
        next.course_instructor_id = "";
      }

      return next;
    });
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

    if (!formData.course_id) {
      toastError(isArabic ? "يجب اختيار الدورة" : "Course is required");
      return;
    }

    if (!formData.course_instructor_id) {
      toastError(isArabic ? "يجب اختيار المحاضر" : "Instructor is required");
      return;
    }

    if (!formData.start_date) {
      toastError(t("groups_page.errors.start_required"));
      return;
    }

    const todayStr = getTodayDateStr();

    if (!editingItem) {
      if (formData.is_historical && formData.start_date > todayStr) {
        toastError(t("groups_page.errors.historical_start_must_be_past"));
        return;
      }
      if (!formData.is_historical && formData.start_date < todayStr) {
        toastError(t("groups_page.errors.start_must_be_today_or_future"));
        return;
      }
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

    const nextStatus = formData.status || "active";
    const previousStatus = originalStatusRef.current || "active";

    if (editingItem && nextStatus === "completed" && previousStatus !== "completed") {
      const ok = await showConfirmCustom({
        title: isArabic ? "إغلاق المجموعة" : "Close Group",
        message: isArabic
          ? "سيتم تعليم جميع طلاب المجموعة كمكتملين وإشعارهم لعمل تقييم. الشهادة لن تُصدر إلا بعد التقييم."
          : "All students in this group will be marked as completed and notified to leave a review. Certificates will only be issued after a review is submitted.",
        icon: "warning",
        confirmText: isArabic ? "تأكيد" : "Confirm",
      });
      if (!ok) return;
    }

    if (editingItem && previousStatus === "completed" && nextStatus === "active") {
      const ok = await showConfirmCustom({
        title: isArabic ? "إعادة فتح المجموعة" : "Reopen Group",
        message: isArabic
          ? "سيتم إرجاع جميع طلاب المجموعة إلى قيد الدراسة. تحذير: يشمل الطلاب الذين أكملوا عبر الامتحان النهائي."
          : "All students in this group will be marked as in progress. Warning: this includes students who completed via the final exam.",
        icon: "warning",
        confirmText: isArabic ? "تأكيد" : "Confirm",
      });
      if (!ok) return;
    }

    try {
      if (editingItem) {
        const allStudentsData = [
          ...formData.students.map((s) => ({
            id: Number(s.id),
            is_completed:
              nextStatus === "completed" ? true : !!s.is_completed,
          })),
          ...selectedStudents.map((id) => ({
            id: Number(id),
            is_completed: nextStatus === "completed",
          })),
        ];

        const uniqueStudentsMap = new Map();
        allStudentsData.forEach((s) => {
          uniqueStudentsMap.set(s.id, s);
        });
        const uniqueStudentsData = [...uniqueStudentsMap.values()];

        const student_ids = uniqueStudentsData.map((s) => s.id);
        const student_statuses = {};
        uniqueStudentsData.forEach((s) => {
          student_statuses[String(s.id)] = s.is_completed;
        });

        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          course_instructor_id: Number(formData.course_instructor_id),
          start_date: formData.start_date,
          status: nextStatus,
          student_ids,
          student_statuses,
        };

        if (!schedulesAreEqual(formData.schedules, originalSchedulesRef.current)) {
          payload.schedules = formData.schedules;
        }

        const response = await updateGroup(editingItem, payload);
        const syncMessage = formatGroupSyncToast(response?.data?.sync, isArabic, t);
        if (syncMessage) {
          toastSuccess(syncMessage);
        }
      } else {
        if (formData.is_historical) {
          const ok = await showConfirmCustom({
            title: t("groups_page.confirm_historical_title"),
            message: t("groups_page.confirm_historical_message"),
            icon: "warning",
            confirmText: t("groups_page.confirm"),
          });
          if (!ok) return;
        }

        const payload = {
          group_name: formData.group_name,
          course_id: Number(formData.course_id),
          course_instructor_id: Number(formData.course_instructor_id),
          start_date: formData.start_date,
          status: nextStatus,
          schedules: formData.schedules,
          is_historical: !!formData.is_historical,
        };

        if (nextStatus === "completed") {
          const ok = await showConfirmCustom({
            title: isArabic ? "إنشاء مجموعة مغلقة" : "Create Closed Group",
            message: isArabic
              ? "المجموعة ستُنشأ بحالة مكتملة. أي طلاب يُضافون لاحقاً سيُعلَّمون مكتملين عند الإغلاق."
              : "The group will be created as completed. Students added later will be marked completed when the group is closed.",
            icon: "warning",
            confirmText: isArabic ? "تأكيد" : "Confirm",
          });
          if (!ok) return;
        }

        const response = await createGroup(payload);
        const syncMessage = formatGroupSyncToast(response?.data?.sync, isArabic, t);
        if (syncMessage) {
          toastSuccess(syncMessage);
        }
      }

      getGroups({ page: currentPage });
      handleBack();
    } catch (err) {}
  };

  // ── Today's date for date input constraints ─────────────────────────────
  const todayStr = getTodayDateStr();
  const isCreateMode = !editingItem && !viewingItem;
  const startDateMin =
    isCreateMode && !formData.is_historical ? todayStr : undefined;
  const startDateMax =
    isCreateMode && formData.is_historical ? todayStr : undefined;

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

                    <select
                      className={`form-select ac-form-select border-2 rounded-3 shadow-sm fw-medium transition-all ${statusFilter !== "all" ? "border-danger bg-danger-subtle text-danger-emphasis" : "border-light bg-light text-muted"}`}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">
                        {isArabic ? "كل الحالات" : "All Statuses"}
                      </option>
                      <option value="active">
                        {isArabic ? "نشطة" : "Active"}
                      </option>
                      <option value="completed">
                        {isArabic ? "مكتملة" : "Completed"}
                      </option>
                      <option value="cancelled">
                        {isArabic ? "ملغاة" : "Cancelled"}
                      </option>
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
                          {isArabic ? "الحالة" : "Status"}
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
                          <td colSpan={8} className="text-center py-5">
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
                                {isDerivedHistoricalGroup(group) && (
                                  <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2">
                                    {t("groups_page.historical_badge")}
                                  </span>
                                )}
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
                              <td className="text-center">
                                <GroupStatusBadge
                                  status={group.status || "active"}
                                  isArabic={isArabic}
                                />
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
                            colSpan={8}
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
              <AdminPagination pagination={apiPagination} onPageChange={handlePageChange} />
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
            {viewingItem && (
              <button
                type="button"
                className="btn btn-sm ac-btn-view border-0 rounded-3"
                onClick={handleOpenScheduleModal}
              >
                <i className="bi bi-calendar-week me-1"></i>
                {isArabic ? "عرض جدول المواعيد" : "Show Group Schedule"}
              </button>
            )}
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

              {/* ── Group Status ── */}
              <div className="mb-4">
                <label className="form-label fw-bold text-dark">
                  {isArabic ? "حالة المجموعة" : "Group Status"}
                </label>
                {viewingItem ? (
                  <div className="mt-1">
                    <GroupStatusBadge
                      status={formData.status || "active"}
                      isArabic={isArabic}
                    />
                  </div>
                ) : (
                  <select
                    name="status"
                    className="form-select ac-form-select p-3 bg-light border-0 rounded-3"
                    value={formData.status || "active"}
                    onChange={handleChange}
                  >
                    <option value="active">
                      {isArabic ? "نشطة" : "Active"}
                    </option>
                    <option value="completed">
                      {isArabic ? "مكتملة" : "Completed"}
                    </option>
                    <option value="cancelled">
                      {isArabic ? "ملغاة" : "Cancelled"}
                    </option>
                  </select>
                )}
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
                  {viewingItem ? (
                    <p className="form-control-plaintext fw-medium ps-1 mb-0">
                      {formData.instructor_name || "—"}
                    </p>
                  ) : (
                    <select
                      name="course_instructor_id"
                      className="form-control ac-form-input p-3 bg-light border-0 rounded-3"
                      value={formData.course_instructor_id || ""}
                      onChange={handleChange}
                      disabled={!formData.course_id}
                    >
                      <option value="">
                        {formData.course_id
                          ? isArabic
                            ? "اختر محاضر الدورة"
                            : "Select course instructor"
                          : isArabic
                            ? "اختر الدورة أولاً"
                            : "Select a course first"}
                      </option>
                      {courseInstructorOptions.map((instructor) => {
                        const optionId = getCourseInstructorOptionId(instructor);
                        return (
                          <option key={optionId} value={optionId}>
                            {instructor.full_name || instructor.name}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
              </div>

              {/* ── Historical toggle (create only) ── */}
              {isCreateMode && (
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input border-danger"
                      type="checkbox"
                      id="is_historical"
                      name="is_historical"
                      checked={!!formData.is_historical}
                      onChange={(e) => {
                        handleChange(e);
                        if (
                          !e.target.checked &&
                          formData.start_date &&
                          formData.start_date < todayStr
                        ) {
                          setFormData((prev) => ({ ...prev, start_date: "" }));
                        }
                      }}
                    />
                    <label
                      className="form-check-label ms-2 fw-medium"
                      htmlFor="is_historical"
                    >
                      {t("groups_page.is_historical")}
                    </label>
                  </div>
                  <small className="text-muted d-block mt-1">
                    {t("groups_page.is_historical_hint")}
                  </small>
                </div>
              )}

              {/* ── Start Date / End Date ── */}
              <div className="mb-4">
                {viewingItem ? (
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label className="form-label fw-bold text-dark">
                        <i className="bi bi-calendar-date me-2 text-danger"></i>
                        {isArabic ? "تاريخ بدء المجموعة" : "Group Start Date"}
                        {isDerivedHistoricalGroup(formData) && (
                          <span className="badge bg-secondary-subtle text-secondary-emphasis ms-2">
                            {t("groups_page.historical_badge")}
                          </span>
                        )}
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
                      min={startDateMin}
                      max={startDateMax}
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
                      className="btn btn-sm ac-add-lesson-btn rounded-3 border-2"
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
                      <div className="d-flex gap-2 flex-wrap">
                        <button
                          type="button"
                          className="btn-download-pdf"
                          onClick={() => handleExportGroupStudents("pdf")}
                          disabled={studentsExportLoading}
                        >
                          {studentsExportLoading ? (
                            <Spinner animation="border" size="sm" className="me-1" />
                          ) : (
                            <i className="bi bi-file-earmark-pdf me-1"></i>
                          )}
                          PDF
                        </button>
                        <button
                          type="button"
                          className="btn-download-excel"
                          onClick={() => handleExportGroupStudents("excel")}
                          disabled={studentsExportLoading}
                        >
                          {studentsExportLoading ? (
                            <Spinner animation="border" size="sm" className="me-1" />
                          ) : (
                            <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                          )}
                          Excel
                        </button>
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
                                        className="btn btn-sm ac-btn-deleteTable border-0"
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

      <DetailModal
        show={showScheduleModal}
        onHide={handleCloseScheduleModal}
        size="lg"
        scrollable
        dir={isArabic ? "rtl" : "ltr"}
        title={
          <>
            <i className="bi bi-calendar-week me-2 text-danger"></i>
            {formData.group_name || (isArabic ? "المجموعة" : "Group")} —{" "}
            {isArabic ? "جدول مواعيد المجموعة" : "Group Schedule"}
          </>
        }
        footer={
          <>
            <button
              type="button"
              className="btn ac-draft-btn border px-3 py-2 rounded-3"
              onClick={handleCloseScheduleModal}
            >
              {isArabic ? "إغلاق" : "Close"}
            </button>
            <button
              type="button"
              className="btn-download-pdf"
              onClick={handleExportGroupSchedulePdf}
              disabled={scheduleExportLoading || scheduleModalLoading}
            >
              {scheduleExportLoading ? (
                <Spinner animation="border" size="sm" className="me-1" />
              ) : (
                <i className="bi bi-file-earmark-pdf me-1"></i>
              )}
              {isArabic ? "تصدير PDF" : "Export PDF"}
            </button>
          </>
        }
      >
          {scheduleModalLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="danger" />
              <div className="text-muted mt-3 small">
                {isArabic ? "جاري تحميل الجدول…" : "Loading schedule…"}
              </div>
            </div>
          ) : groupSessions.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-calendar-x" style={{ fontSize: "3rem" }}></i>
              <p className="mt-3 fw-semibold mb-0">
                {isArabic
                  ? "لا توجد جلسات مجدولة"
                  : "No scheduled sessions"}
              </p>
            </div>
          ) : (
            <div className="table-responsive ac-table-wrapper">
              <table className="table ac-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{isArabic ? "اليوم" : "Day"}</th>
                    <th>{isArabic ? "التاريخ" : "Date"}</th>
                    <th>{isArabic ? "الوقت" : "Time"}</th>
                    <th>{isArabic ? "القاعة" : "Room"}</th>
                    <th>{isArabic ? "الحالة" : "Status"}</th>
                  </tr>
                </thead>
                <tbody>
                  {groupSessions.map((sess, idx) => {
                    const {
                      effectiveDate,
                      effectiveStart,
                      effectiveEnd,
                      room,
                    } = getEffectiveSession(sess);
                    return (
                      <tr
                        key={sess.id}
                        className={
                          sess.status === "cancelled" ? "opacity-60" : ""
                        }
                      >
                        <td className="text-muted small">{idx + 1}</td>
                        <td style={{ fontSize: "0.85rem" }}>
                          {getDayNameFromDate(effectiveDate, isArabic)}
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{effectiveDate}</td>
                        <td>
                          <span
                            className="fw-semibold"
                            style={{ fontSize: "0.85rem", color: "#374151" }}
                          >
                            {effectiveStart} – {effectiveEnd}
                          </span>
                        </td>
                        <td style={{ fontSize: "0.85rem" }}>{room}</td>
                        <td>
                          <SessionStatusBadge
                            status={sess.status}
                            isArabic={isArabic}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
      </DetailModal>
    </div>
  );
}

export default AdminGroups;
