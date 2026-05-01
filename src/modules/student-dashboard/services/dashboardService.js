import axiosClient from "../../../api/axios";

// --- الدوال المفقودة التي تسبب الخطأ ---

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 */
export const getStudentCourses = () =>
  axiosClient.get("student/courses/dashboard");

/**
 * جلب شهادات الطالب
 */
export const getStudentCertificates = () =>
  axiosClient.get("/student/certificates");

// --- الدوال التي قمنا بتعديلها سابقاً ---

/**
 * جلب بيانات ملف الطالب الشخصية
 */
export const getStudentProfile = () => axiosClient.get("/profile");

/**
 * تحديث بيانات الملف الشخصي
 */
export const updateStudentProfile = (profileData) => {
  // لو بعت FormData جاهزة من الكومبوننت
  if (profileData instanceof FormData) {
    return axiosClient.post("/profile", profileData, {
      headers: {
        "Content-Type": "multipart/form-data", // تأكيد للـ axios
      },
    });
  }

  // البيانات النصية العادية
  return axiosClient.post("/profile", {
    ...profileData,
    _method: "PUT",
  });
};

/**
 * تحديث كلمة المرور
 */
export const updateStudentPassword = (passwordData) => {
  return axiosClient.post("/profile", {
    ...passwordData,
    _method: "PUT",
  });
};
