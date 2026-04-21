import axiosClient from "../api/axios";

export const getCategories = () => {
    return axiosClient.get("/student/categories");
};