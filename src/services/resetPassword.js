import axiosClient from "../api/axios";

/**
 * خدمة إعادة تعيين كلمة المرور
 * ترسل طلب PUT إلى /password بناءً على توجيهات المستخدم
 */
export const resetPasswordService = async (resetData) => {
  const response = await axiosClient.put("/reset-password", resetData);
  return response.data;
};
