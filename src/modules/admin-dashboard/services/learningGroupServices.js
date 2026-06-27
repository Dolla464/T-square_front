import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع المجموعات الدراسية مع الفلاتر و pagination
// Response includes: id, group_name, course_id, instructor_id,
//   start_date, end_date, status, schedules[], course_title,
//   instructor_name, students_count, created_at
// ----------------------------------------------------------------------------
export const getLearningGroups = (params) =>
  axiosClient.get("/admin/learning-groups", { params }).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب المجموعات الدراسية للقوائم المنسدلة (بدون pagination)
// ----------------------------------------------------------------------------
export const getLearningGroupsSelection = () =>
  axiosClient.get("/admin/learning-groups/selection").then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب مجموعة دراسية معينة بالـ ID
// Response includes: id, group_name, course_id, instructor_id,
//   start_date, end_date, status, schedules[], course_title,
//   instructor_name, students_count, students[], created_at
// ----------------------------------------------------------------------------
export const getLearningGroupById = (id) =>
  axiosClient.get(`/admin/learning-groups/${id}`).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب الطلاب المتاحين (غير المسجلين) لمجموعة دراسية معينة
// ----------------------------------------------------------------------------
export const getAvailableStudents = (id) =>
  axiosClient
    .get(`/admin/learning-groups/${id}/unassigned-students`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// إنشاء مجموعة دراسية جديدة
// Required payload fields: group_name, course_id, instructor_id,
//   start_date (YYYY-MM-DD), schedules[]
// Optional payload fields: status, student_ids[], student_statuses{}
// ----------------------------------------------------------------------------
export const createLearningGroup = (payload) =>
  axiosClient
    .post("/admin/learning-groups", payload)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// تحديث بيانات مجموعة دراسية
// Required payload fields: group_name, course_id, instructor_id,
//   start_date (YYYY-MM-DD), schedules[]
// Optional payload fields: status, student_ids[], student_statuses{}
// ----------------------------------------------------------------------------
export const updateLearningGroup = (id, payload) =>
  axiosClient
    .put(`/admin/learning-groups/${id}`, payload)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// حذف مجموعة دراسية
// ----------------------------------------------------------------------------
export const deleteLearningGroup = (id) =>
  axiosClient
    .delete(`/admin/learning-groups/${id}`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// إضافة مجموعة من الطلاب إلى مجموعة دراسية
// ----------------------------------------------------------------------------
export const bulkAssignStudents = (id, payload) =>
  axiosClient
    .post(`/admin/learning-groups/${id}/bulk-assign`, payload)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب الجدول الأسبوعي لمجموعة دراسية
// Response: schedules[]
// ----------------------------------------------------------------------------
export const getLearningGroupSchedule = (id) =>
  axiosClient
    .get(`/admin/learning-groups/${id}/schedule`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب جلسات الحضور لمجموعة دراسية (مرتبة بالتاريخ)
// Response: attendance sessions[]
// ----------------------------------------------------------------------------
export const getLearningGroupSessions = (id) =>
  axiosClient
    .get(`/admin/learning-groups/${id}/sessions`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب تقرير الحضور لمجموعة دراسية
// Optional param: session_id — filter by a specific session
// ----------------------------------------------------------------------------
export const getAttendanceReport = (id, sessionId = null) => {
  const params = sessionId ? { session_id: sessionId } : {};
  return axiosClient
    .get(`/admin/learning-groups/${id}/attendance`, { params })
    .then((res) => res.data);
};
