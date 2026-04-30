import axiosClient from "../../../api/axios";

// ================================================================
// خدمات داشبورد الطالب — جاهزة للربط بالـ API
// حالياً تُرجع null — سيتم التفعيل عند تسليم الـ API
// ================================================================

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 * TODO: فعّل عند توفر الـ endpoint
 */
export const getStudentCourses = () =>
  axiosClient.get("student/courses/dashboard");

/**
 * جلب شهادات الطالب
 * TODO: فعّل عند توفر الـ endpoint
 */
export const getStudentCertificates = () =>
  axiosClient.get("/student/certificates");

/**
 * جلب بيانات ملف الطالب الشخصية
 */
export const getStudentProfile = () => axiosClient.get("/profile");


/**
 * تحديث بيانات الملف الشخصي
 * @param {Object} profileData
 */
export const updateStudentProfile = (profileData) =>
  axiosClient.post("/profile", profileData);

/**
 * تحديث كلمة المرور
 * @param {Object} passwordData
 */
export const updateStudentPassword = (passwordData) =>
  axiosClient.post("/profile", passwordData);
