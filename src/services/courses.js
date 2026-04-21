import axiosClient from "../api/axios";

export const getCourses = (params = {}) =>
    axiosClient.get("/student/courses", { params });