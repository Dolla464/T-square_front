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
// حذف تقييم
// ----------------------------------------------------------------------------
export const deleteReview = async (id) => {
    const response = await axiosClient.delete(`/admin/reviews/${id}`);
    return response.data;
};
