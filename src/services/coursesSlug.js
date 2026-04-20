import axiosClient from "../api/axios";
export const getCourseSlug = (slug) =>
    axiosClient.get(`/student/courses/${slug}`);