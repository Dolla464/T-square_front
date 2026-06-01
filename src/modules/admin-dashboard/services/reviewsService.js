import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع التقييمات مع pagination
// ----------------------------------------------------------------------------
export const getReviews = async (params = {}) => {
    const response = await axiosClient.get("/admin/reviews", { params });
    return response.data;
};

// ----------------------------------------------------------------------------
// جلب تقييم معين بالـ ID
// ----------------------------------------------------------------------------
export const getReviewById = async (id) => {
    const response = await axiosClient.get(`/admin/reviews/${id}`);
    return response.data;
};

// ----------------------------------------------------------------------------
// تغيير حالة تقييم معين
// ----------------------------------------------------------------------------
export const changeReviewStatus = async (id, status) => {
    const response = await axiosClient.put(`/admin/reviews/${id}`, { review_status: status });
    return response.data;
};

// ----------------------------------------------------------------------------
// حذف تقييم
// ----------------------------------------------------------------------------
export const deleteReview = async (id) => {
    const response = await axiosClient.delete(`/admin/reviews/${id}`);
    return response.data;
};
