import axiosClient from "../api/axios";

/**
 * خدمة إعادة تعيين كلمة المرور
 * ترسل طلب POST إلى /reset-password بناءً على توجيهات المستخدم
 */
export const resetPasswordService = async (resetData) => {
  const response = await axiosClient.post("/reset-password", resetData);
  return response.data;
};
