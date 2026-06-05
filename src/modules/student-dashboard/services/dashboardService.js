import axiosClient from "../../../api/axios";

// --- الدوال المفقودة التي تسبب الخطأ ---

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 */
export const getStudentCourses = () =>
  axiosClient.get("/student/dashboard/courses");
export const getCourseSlug = (slug) =>
  axiosClient.get(`/student/courses/${slug}`);
/**
 * جلب شهادات الطالب
 */
export const getStudentCertificates = () =>
  axiosClient.get("/student/certificates");
export const downloadStudentCertificate = (certificate_id) =>
  axiosClient.get(`/student/certificates/${certificate_id}/download`);
export const showStudentCertificate = (certificate_id) =>
  axiosClient.get(`/student/certificates/${certificate_id}`);


// الكويزات و الاختبارات و الاجابات بتاعتهم
export const getStudentExams = () => axiosClient.get("/exams");

export const startExam = (examId) => axiosClient.post("/exams/start", { exam_id: examId });

export const saveExamAnswer = (payload) => axiosClient.post("/exams/save-answer", payload);

// Submit uses the attempt_id (not exam_id) so backend can authorize ownership
export const submitExam = (attemptId) => axiosClient.post(`/exams/${attemptId}/submit`);


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
