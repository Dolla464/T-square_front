import axiosClient from "../api/axios";
export const getCourseSlug = (courseId) =>
    axiosClient.get(`/student/courses/${courseId}`);