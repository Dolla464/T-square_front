import axiosClient from "../api/axios";

export const getTestimonials = () => axiosClient.get("/student/reviews/latest");
