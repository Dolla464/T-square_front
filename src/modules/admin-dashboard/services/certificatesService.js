import axiosClient from "../../../api/axios";
import { saveAs } from "file-saver";

// ----------------------------------------------------------------------------
// Get all certificates with optional filters (search, group_id, status, page)
// ----------------------------------------------------------------------------
export const getCertificates = async (params = {}) => {
  const response = await axiosClient.get("/admin/certificates", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// Get certificate preview (HTML template view)
// ----------------------------------------------------------------------------
export const getCertificatePreview = async (id) => {
  const response = await axiosClient.get(`/admin/certificates/${id}/view`, {
    responseType: "blob", // Fetch as blob for secure iframe visualization
  });

  // تأكيد أن الـ blob ليس عبارة عن إيرور سري (JSON)
  if (
    response.data instanceof Blob &&
    response.data.type === "application/json"
  ) {
    throw new Error("Invalid blob response");
  }

  // هنا نقوم بفرض نوع الـ PDF برمجياً داخل المتصفح بعد أن عبر بأمان من الـ IDM
  const file = new Blob([response.data], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);
  return fileURL;
};

// ----------------------------------------------------------------------------
// Download certificate (PDF file)
// ----------------------------------------------------------------------------
export const downloadCertificate = async (id, certificateNum) => {
  const response = await axiosClient.get(`/admin/certificates/${id}/download`, {
    responseType: "blob",
  });

  // تأكيد أن الـ blob واصل سليم ومش عبارة عن ايرور سري
  if (
    response.data instanceof Blob &&
    response.data.type === "application/json"
  ) {
    throw new Error("Download failed");
  }

  // 1. صياغة الـ Blob كـ PDF
  const blob = new Blob([response.data], { type: "application/pdf" });

  // 2. استخدام file-saver للتحميل المباشر والنظيف
  // هذا السطر يمنع التكرار تماماً ويجعل التنزيل متوافق مع المتصفح والـ IDM بسلاسة
  saveAs(blob, `certificate-${certificateNum || id}.pdf`);

  return true;
};

