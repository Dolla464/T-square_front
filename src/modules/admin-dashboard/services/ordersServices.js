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
