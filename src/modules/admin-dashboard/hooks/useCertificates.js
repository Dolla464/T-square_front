import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError } from "../../../components/shared/Toaster/toaster";
import {
  getCertificates as fetchCertificates,
  getCertificatePreview as fetchCertificatePreview,
  downloadCertificate as apiDownloadCertificate,
  changeCertificateStatus as apiChangeCertificateStatus,
} from "../services/certificatesService";

export const useCertificates = () => {
  const { t } = useTranslation(["common", "adminDashboard"]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ issued: 0, pending: 0, revoked: 0 });
  const [pagination, setPagination] = useState(null);

  const getCertificates = useCallback(
    async (params = {}) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchCertificates(params);
        
        // Response format is { status: "success", message: "...", data: { statistics: {...}, certificates: [...] } }
        const dataObj = response?.data || {};
        const list = dataObj.certificates || [];
        const statsObj = dataObj.statistics || { issued: 0, pending: 0, revoked: 0 };
        
        // Support pagination metadata if returned by backend (e.g. meta or pagination)
        const paginationData = response?.meta || dataObj?.meta || response?.pagination || dataObj?.pagination || null;
        const formattedPagination = paginationData
          ? {
              current_page: paginationData.current_page,
              total_pages: paginationData.last_page || paginationData.total_pages,
              total: paginationData.total,
            }
          : null;

        setCertificates(Array.isArray(list) ? list : []);
        setStats(statsObj);
        setPagination(formattedPagination);

        return response;
      } catch (err) {
        console.error("Error fetching certificates:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed", "Failed to fetch data");
        setError(errorMsg);
        toastError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const getCertificatePreview = useCallback(
    async (id) => {
      setError(null);
      try {
        const blob = await fetchCertificatePreview(id);
        return blob;
      } catch (err) {
        console.error("Error loading preview:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.fetch_failed", "Failed to load preview");
        setError(errorMsg);
        toastError(errorMsg);
        throw err;
      }
    },
    [t]
  );

  const downloadCertificate = useCallback(
    async (id, certificateNum = "certificate") => {
      setLoading(true);
      setError(null);
      try {
        const blob = await apiDownloadCertificate(id);
        const url = window.URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${certificateNum}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toastSuccess(
          t("adminDashboard:success.downloaded", "Downloaded successfully")
        );
        return true;
      } catch (err) {
        console.error("Error downloading certificate:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.download_failed", "Failed to download");
        setError(errorMsg);
        toastError(errorMsg);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  const changeCertificateStatus = useCallback(
    async (id, newStatus) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiChangeCertificateStatus(id, newStatus);
        
        // Response format might contain updated certificates/statistics since it calls getCertificates endpoint
        const dataObj = response?.data || {};
        if (dataObj.certificates) {
          const list = dataObj.certificates || [];
          const statsObj = dataObj.statistics || { issued: 0, pending: 0, revoked: 0 };
          setCertificates(Array.isArray(list) ? list : []);
          setStats(statsObj);
        } else {
          // Optimistic local state update
          setCertificates((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, status: newStatus } : item
            )
          );
        }

        toastSuccess(
          t("adminDashboard:success.updated", "Updated successfully")
        );
        return response;
      } catch (err) {
        console.error("Failed to update certificate status:", err);
        const errorMsg =
          err.response?.data?.message ||
          t("adminDashboard:errors.update_failed", "Failed to update status");
        setError(errorMsg);
        toastError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [t]
  );

  return {
    certificates,
    loading,
    error,
    stats,
    pagination,
    getCertificates,
    getCertificatePreview,
    downloadCertificate,
    changeCertificateStatus,
  };
};

