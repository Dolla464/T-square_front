import axiosClient from "../../../api/axios";

// ================================================================
// خدمات داشبورد الطالب — جاهزة للربط بالـ API
// حالياً تُرجع null — سيتم التفعيل عند تسليم الـ API
// ================================================================

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 * TODO: فعّل عند توفر الـ endpoint
 */
export const getStudentDashboard = () =>
    axiosClient.get("/student/dashboard");

/**
 * جلب شهادات الطالب
 * TODO: فعّل عند توفر الـ endpoint
 */
export const getStudentCertificates = () =>
    axiosClient.get("/student/certificates");

/**
 * تحديث بيانات الملف الشخصي
 * @param {Object} profileData
 */
export const updateStudentProfile = (profileData) =>
    axiosClient.put("/student/profile", profileData);

/**
 * تحديث كلمة المرور
 * @param {Object} passwordData
 */
export const updateStudentPassword = (passwordData) =>
    axiosClient.put("/student/password", passwordData);
