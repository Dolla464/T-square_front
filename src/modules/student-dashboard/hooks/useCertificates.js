import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
} from "../../../components/shared/Toaster/toaster";
import {
  getStudentCertificates,
  previewStudentCertificate,
  downloadStudentCertificate,
} from "../services/dashboardService";

/**
 * Extract a human-readable message out of an Axios error whose payload may be
 * a Blob (because the request used responseType: "blob").
 */
const resolveBlobError = async (err, fallback) => {
  if (err?.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      const parsed = JSON.parse(text);
      return parsed.message || fallback;
    } catch {
      return fallback;
    }
  }
  return err?.response?.data?.message || err?.message || fallback;
};

export const useCertificates = () => {
  const { i18n } = useTranslation("studentDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  const getCertificates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStudentCertificates();
      const data = res?.data?.data;
      setCertificates(Array.isArray(data) ? data : []);
      return data;
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getCertificates();
  }, [getCertificates]);

  // Returns a ready-to-use Object URL for the inline iframe preview.
  const getCertificatePreview = useCallback(
    async (id) => {
      setError(null);
      try {
        return await previewStudentCertificate(id);
      } catch (err) {
        console.error("Error loading preview:", err);
        const errorMsg = await resolveBlobError(
          err,
          isArabic ? "تعذر تحميل المعاينة" : "Failed to load preview",
        );
        setError(errorMsg);
        toastError(errorMsg);
        throw err;
      }
    },
    [isArabic],
  );

  const downloadCertificate = useCallback(
    async (id, certificateNum = "certificate") => {
      setDownloading(true);
      setError(null);
      try {
        await downloadStudentCertificate(id, certificateNum);
        toastSuccess(isArabic ? "تم التحميل بنجاح" : "Downloaded successfully");
        return true;
      } catch (err) {
        console.error("Error downloading certificate:", err);
        const errorMsg = await resolveBlobError(
          err,
          isArabic ? "فشل التحميل" : "Failed to download",
        );
        setError(errorMsg);
        toastError(errorMsg);
        return false;
      } finally {
        setDownloading(false);
      }
    },
    [isArabic],
  );

  return {
    certificates,
    loading,
    downloading,
    error,
    getCertificates,
    getCertificatePreview,
    downloadCertificate,
  };
};
