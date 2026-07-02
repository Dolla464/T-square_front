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
export const getLearningGroupsSelection = (params = {}) =>
  axiosClient.get("/admin/learning-groups/selection", { params }).then((res) => res.data);

export const getCompletedLearningGroupsSelection = () =>
  getLearningGroupsSelection({ status: "completed" });

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

// ----------------------------------------------------------------------------
// Session attendance with all enrolled students
// ----------------------------------------------------------------------------
export const getSessionAttendance = (groupId, sessionId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/sessions/${sessionId}/attendance`)
    .then((res) => res.data);

// ----------------------------------------------------------------------------
// Group attendance summary (course-level per student)
// ----------------------------------------------------------------------------
export const getGroupAttendanceSummary = (groupId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/attendance-summary`)
    .then((res) => res.data);

export const getStudentCourseAttendance = (groupId, studentId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/students/${studentId}/attendance`)
    .then((res) => res.data);

const downloadExportBlob = (response) => {
  const { content, filename, mime } = response.data?.data ?? {};

  if (!content) throw new Error("Export response missing content.");

  const byteChars = atob(content);
  const byteNumbers = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const blob = new Blob([byteNumbers], { type: mime });

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// ----------------------------------------------------------------------------
// Export session attendance table
// ----------------------------------------------------------------------------
export const exportSessionAttendance = async (groupId, sessionId, format = "pdf") => {
  const response = await axiosClient.get(
    `/admin/learning-groups/${groupId}/sessions/${sessionId}/attendance/export`,
    { params: { format } }
  );
  downloadExportBlob(response);
};

// ----------------------------------------------------------------------------
// Export student course attendance
// ----------------------------------------------------------------------------
export const exportStudentCourseAttendance = async (
  groupId,
  studentId,
  format = "pdf"
) => {
  const response = await axiosClient.get(
    `/admin/learning-groups/${groupId}/students/${studentId}/attendance/export`,
    { params: { format } }
  );
  downloadExportBlob(response);
};

// ----------------------------------------------------------------------------
// Export group students as PDF or CSV/Excel
// ----------------------------------------------------------------------------
export const exportGroupStudents = async (id, format = "pdf") => {
  const params = { format };

  const response = await axiosClient.get(
    `/admin/learning-groups/${id}/students/export`,
    { params }
  );

  downloadExportBlob(response);
};

// ----------------------------------------------------------------------------
// Group exams for results page
// ----------------------------------------------------------------------------
export const getLearningGroupExams = (groupId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/exams`)
    .then((res) => res.data);

export const getExamResults = (groupId, examId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/exams/${examId}/results`)
    .then((res) => res.data);

export const getStudentExamResults = (groupId, studentId, examId) =>
  axiosClient
    .get(`/admin/learning-groups/${groupId}/students/${studentId}/exam-results`, {
      params: { exam_id: examId },
    })
    .then((res) => res.data);

export const exportExamResults = async (groupId, examId, format = "pdf") => {
  const response = await axiosClient.get(
    `/admin/learning-groups/${groupId}/exams/${examId}/results/export`,
    { params: { format } }
  );
  downloadExportBlob(response);
};
