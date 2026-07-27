import axiosClient from "../../../api/axios";
import { buildProfilePayload } from "../../../utils/buildPayload";
import { saveAs } from "file-saver";

// --- الدوال المفقودة التي تسبب الخطأ ---

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 */
export const getStudentCourses = () =>
  axiosClient.get("/student/dashboard/courses");
export const getCourseDetails = (courseId, config = {}) =>
  axiosClient.get(`/student/dashboard/courses/${courseId}`, config);
/**
 * جلب شهادات الطالب
 */
export const getStudentCertificates = () =>
  axiosClient.get("/student/certificates");

/**
 * جلب تفاصيل شهادة واحدة (JSON)
 */
export const showStudentCertificate = (certificate_id) =>
  axiosClient.get(`/student/certificates/${certificate_id}`);

/**
 * معاينة الشهادة داخل المتصفح: نجلبها كـ blob وننشئ Object URL آمن للـ iframe
 * (نفس منطق لوحة الأدمن، ويتجاوز اعتراض برامج التحميل IDM).
 */
export const previewStudentCertificate = async (certificate_id) => {
  const response = await axiosClient.get(
    `/student/certificates/${certificate_id}/view`,
    { responseType: "blob", timeout: 60000 },
  );

  // تأكيد أن الـ blob ليس عبارة عن إيرور سري (JSON)
  if (
    response.data instanceof Blob &&
    response.data.type === "application/json"
  ) {
    throw new Error("Invalid blob response");
  }

  // فرض نوع الـ PDF برمجياً داخل المتصفح بعد عبوره بأمان
  const file = new Blob([response.data], { type: "application/pdf" });
  return URL.createObjectURL(file);
};

/**
 * تحميل الشهادة كملف PDF عبر file-saver (نفس منطق لوحة الأدمن).
 */
export const downloadStudentCertificate = async (
  certificate_id,
  certificateNum,
) => {
  const response = await axiosClient.get(
    `/student/certificates/${certificate_id}/download`,
    { responseType: "blob", timeout: 60000 },
  );

  // تأكيد أن الـ blob واصل سليم ومش عبارة عن ايرور سري
  if (
    response.data instanceof Blob &&
    response.data.type === "application/json"
  ) {
    throw new Error("Download failed");
  }

  const blob = new Blob([response.data], { type: "application/pdf" });
  saveAs(blob, `certificate-${certificateNum || certificate_id}.pdf`);

  return true;
};

// الكويزات و الاختبارات و الاجابات بتاعتهم
export const getStudentExams = () => axiosClient.get("/exams");

export const startExam = (examId) =>
  axiosClient.post("/exams/start", { exam_id: examId });

export const saveExamAnswer = (payload) =>
  axiosClient.post("/exams/save-answer", payload);

// Submit uses the attempt_id (not exam_id) so backend can authorize ownership
export const submitExam = (attemptId) =>
  axiosClient.post(`/exams/${attemptId}/submit`);

/**
 * جلب بيانات ملف الطالب الشخصية
 */
export const getStudentProfile = () => axiosClient.get("/profile");

/**
 * تحديث بيانات الملف الشخصي والصورة (POST صريح يدعم الـ FormData)
 */
export const updateStudentProfile = (profileData) => {
  const payload = buildProfilePayload(profileData);

  if (payload instanceof FormData) {
    return axiosClient.post("/profile", payload, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  return axiosClient.post("/profile", payload);
};

/**
 * تحديث كلمة المرور (PUT صريح ونقي متوافق مع Route::put الجديد)
 */
export const updateStudentPassword = (passwordData) => {
  return axiosClient.put("/profile/password", {
    current_password: passwordData.current_password,
    password: passwordData.password,
    password_confirmation: passwordData.password_confirmation,
  });
};

/**
 * جلب تفاصيل محاولات ونتائج كويز معين
 */
export const getExamResults = (examId) =>
  axiosClient.get("/exams/my-results", { params: { exam_id: examId } });

/**
 * جلب مراجعة إجابات محاولة منتهية
 */
export const getAttemptReview = (attemptId, config = {}) =>
  axiosClient.get(`/exams/attempts/${attemptId}/review`, config);

/**
 * Check review eligibility for a course
 */
export const getReviewEligibility = (courseId) =>
  axiosClient.get(`/student/reviews/eligibility/${courseId}`);

/**
 * Submit a course review
 */
export const submitCourseReview = (payload) =>
  axiosClient.post("/student/reviews", payload);

