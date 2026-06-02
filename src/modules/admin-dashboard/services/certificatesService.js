import axiosClient from "../../../api/axios";

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
  return response.data;
};

// ----------------------------------------------------------------------------
// Download certificate (PDF file)
// ----------------------------------------------------------------------------
export const downloadCertificate = async (id) => {
  const response = await axiosClient.get(`/admin/certificates/${id}/download`, {
    responseType: "blob",
  });
  return response.data;
};

// ----------------------------------------------------------------------------
// Change certificate status (using GET with id and status)
// ----------------------------------------------------------------------------
export const changeCertificateStatus = async (id, status) => {
  const response = await axiosClient.post("/admin/certificates/update", {
    params: { id, status },
  });
  return response.data;
};

