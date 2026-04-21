import axiosClient from "../api/axios";

export const getCategories = (type = "") => {
    return axiosClient.get(`/student/categories${type ? `?type=${type}` : ""}`);
};