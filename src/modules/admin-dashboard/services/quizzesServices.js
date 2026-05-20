import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع الاختبارات مع pagination
// ----------------------------------------------------------------------------
export const getQuizzes = async (params = {}) => {
  // const response = await axiosClient.get("/admin/quizzes", { params });
  // return response.data;
  return { data: [], pagination: null };
};

// ----------------------------------------------------------------------------
// جلب اختبار معين بالـ ID
// ----------------------------------------------------------------------------
export const getQuizById = async (id) => {
  // const response = await axiosClient.get(`/admin/quizzes/${id}`);
  // return response.data;
  return { data: null };
};

// ----------------------------------------------------------------------------
// إنشاء اختبار جديد
// ----------------------------------------------------------------------------
export const createQuiz = async (payload) => {
  // const response = await axiosClient.post("/admin/quizzes", payload);
  // return response.data;
  return { data: null };
};

// ----------------------------------------------------------------------------
// تعديل اختبار معين بالـ ID
// ----------------------------------------------------------------------------
export const updateQuiz = async (id, payload) => {
  // const response = await axiosClient.put(`/admin/quizzes/${id}`, payload);
  // return response.data;
  return { data: null };
};

// ----------------------------------------------------------------------------
// حذف اختبار
// ----------------------------------------------------------------------------
export const deleteQuiz = async (id) => {
  // const response = await axiosClient.delete(`/admin/quizzes/${id}`);
  // return response.data;
  return { success: true };
};

// ----------------------------------------------------------------------------
// تعديل حالة الاختبار (نشط / غير نشط)
// ----------------------------------------------------------------------------
export const toggleQuizStatus = async (id, status) => {
  // const response = await axiosClient.patch(`/admin/quizzes/${id}/status`, { status });
  // return response.data;
  return { success: true };
};

// ----------------------------------------------------------------------------
// جلب الاختبارات المؤرشفة (سلة المحذوفات)
// ----------------------------------------------------------------------------
export const getTrashedQuizzes = async (params = {}) => {
  // const response = await axiosClient.get("/admin/quizzes/trash", { params });
  // return response.data;
  return { data: [], pagination: null };
};

// ----------------------------------------------------------------------------
// استعادة اختبار محذوف من سلة المحذوفات
// ----------------------------------------------------------------------------
export const restoreQuiz = async (id) => {
  // const response = await axiosClient.post(`/admin/quizzes/${id}/restore`);
  // return response.data;
  return { success: true };
};

// ----------------------------------------------------------------------------
// حذف اختبار نهائياً
// ----------------------------------------------------------------------------
export const forceDeleteQuiz = async (id) => {
  // const response = await axiosClient.delete(`/admin/quizzes/${id}/force-delete`);
  // return response.data;
  return { success: true };
};

