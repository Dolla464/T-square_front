import axiosClient from "../api/axios";

export const getSolutions = (config = {}) =>
    axiosClient.get("/student/solutions", config);
