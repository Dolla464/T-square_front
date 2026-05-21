import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع الاختبارات مع pagination
// ----------------------------------------------------------------------------
export const getQuizzes = async (params = {}) => {
  const response = await axiosClient.get("/admin/exams", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// جلب اختبار معين بالـ ID
// ----------------------------------------------------------------------------
export const getQuizById = async (id) => {
  const response = await axiosClient.get(`/admin/exams/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// إنشاء اختبار جديد
// ----------------------------------------------------------------------------
export const createQuiz = async (payload) => {
  const response = await axiosClient.post("/admin/exams", payload);
  return response.data;
};

// ----------------------------------------------------------------------------
// تعديل اختبار معين بالـ ID
// ----------------------------------------------------------------------------
export const updateQuiz = async (id, payload) => {
  const response = await axiosClient.put(`/admin/exams/${id}`, payload);
  return response.data;
};

// ----------------------------------------------------------------------------
// حذف اختبار
// ----------------------------------------------------------------------------
export const deleteQuiz = async (id) => {
  const response = await axiosClient.delete(`/admin/exams/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// تعديل حالة الاختبار (نشط / غير نشط)
// ----------------------------------------------------------------------------
export const toggleQuizStatus = async (id, status) => {
  const response = await axiosClient.patch("/admin/exams/toggle-status", {
    exam_id: id,
    is_active: status,
  });
  return response.data;
};

// ----------------------------------------------------------------------------
// جلب الاختبارات المؤرشفة (سلة المحذوفات)
// ----------------------------------------------------------------------------
export const getTrashedQuizzes = async (params = {}) => {
  const response = await axiosClient.get("/admin/exams/trash", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// استعادة اختبار محذوف من سلة المحذوفات
// ----------------------------------------------------------------------------
export const restoreQuiz = async (id) => {
  const response = await axiosClient.post(`/admin/exams/${id}/restore`);
  return response.data;
};

// ----------------------------------------------------------------------------
// حذف اختبار نهائياً
// ----------------------------------------------------------------------------
export const forceDeleteQuiz = async (id) => {
  const response = await axiosClient.delete(`/admin/exams/${id}/force-delete`);
  return response.data;
};


