import axiosClient from "../api/axios";

// جلب التقييمات من الـ API
// TODO: عدّل الرابط لما يتسلم الـ API النهائي
export const getTestimonials = () => axiosClient.get("/student/reviews/latest");
