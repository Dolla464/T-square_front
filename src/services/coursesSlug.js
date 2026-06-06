import axiosClient from "../api/axios";
export const getCourseSlug = (slug, config = {}) =>
    axiosClient.get(`/student/courses/${slug}`, config);