import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع التقييمات مع pagination
// ----------------------------------------------------------------------------
export const getReviews = async (params = {}) => {
    const response = await axiosClient.get("/admin/payments", { params });
    return response.data;
};

// ----------------------------------------------------------------------------
// جلب تقييم معين بالـ ID
// ----------------------------------------------------------------------------
export const getReviewById = async (id) => {
    const response = await axiosClient.get(`/admin/payments/${id}`);
    return response.data;
};
// ----------------------------------------------------------------------------
// جلب طلب دفع معين بالـ ID
// ----------------------------------------------------------------------------
export const updatePaymentOrdersById = async (id, payload) => {
    const response = await axiosClient.put(`/admin/payments/${id}`, payload);
    return response.data;
};

// ----------------------------------------------------------------------------
// حذف طلب دفع
// ----------------------------------------------------------------------------
export const deleteReview = async (id) => {
    const response = await axiosClient.delete(`/admin/payments/${id}`);
    return response.data;
};

// ----------------------------------------------------------------------------
// Export payments as PDF or CSV/Excel
// ----------------------------------------------------------------------------
export const exportPayments = async (filters = {}, format = "pdf") => {
    const params = { ...filters, format };

    const response = await axiosClient.get("/admin/payments/export", { params });

    const { content, filename, mime } = response.data?.data ?? {};

    if (!content) throw new Error("Export response missing content.");

    const byteChars = atob(content);
    const byteNumbers = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([byteNumbers], { type: mime });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};
