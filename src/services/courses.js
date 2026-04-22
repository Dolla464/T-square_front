import axiosClient from "../api/axios";

export const getCourses = () =>
    axiosClient.get("/student/courses");