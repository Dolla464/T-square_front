import axiosClient from "../../../api/axios";

/**
 * جلب قائمة الطلاب مع دعم الفلترة والبحث والصفحات
 */
export const getStudents = async (params = {}) => {
  const response = await axiosClient.get("/admin/students", { params });
  return response.data;
};

/**
 * جلب بيانات طالب معين بالـ ID
 */
export const getStudentById = async (id) => {
  const response = await axiosClient.get(`/admin/students/${id}`);
  return response.data;
};

/**
 * تسجيل طالب جديد
 */
export const registerStudents = async (data) => {
  // ملاحظة: قد تحتاج لاستخدام FormData إذا كان هناك رفع صور
  const response = await axiosClient.post("/admin/users", data);
  return response.data;
};

/**
 * حذف طالب
 */
export const deleteStudent = async (id) => {
  const response = await axiosClient.delete(`/admin/students/${id}`);
  return response.data;
};

/**
 * Update a student's active/inactive status
 */
export const updateStudentStatus = (id, status) => {
  return axiosClient.patch(`/admin/students/${id}/status`, { status });
};

/**
 * Switch verification status for a student
 */
export const toggleStudentVerify = (id) => {
  return axiosClient.post(`/admin/students/${id}/toggle-verify`);
};

/**
 * Update a student's course group
 */
export const updateStudentCourseGroup = (studentId, courseId, groupId) => {
  return axiosClient.put(
    `/admin/students/${studentId}/courses/${courseId}/group`,
    { group_id: groupId },
  );
};
 
/**
 * Update a student's course completion status
 */
export const updateStudentCourseStatus = (studentId, courseId, isCompleted) => {
  return axiosClient.put(
    `/admin/students/${studentId}/courses/${courseId}/status`,
       { is_completed: isCompleted},
  );
}