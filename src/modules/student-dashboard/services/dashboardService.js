import axiosClient from "../../../api/axios";
import { saveAs } from "file-saver";

// --- الدوال المفقودة التي تسبب الخطأ ---

/**
 * جلب بيانات الداشبورد الرئيسية (كورسات + إحصائيات)
 */
export const getStudentCourses = () =>
  axiosClient.get("/student/dashboard/courses");

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
    { responseType: "blob" },
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
    { responseType: "blob" },
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
