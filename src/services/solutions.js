import axiosClient from "../api/axios";

export const getSolutions = () =>
    axiosClient.get("/student/solutions");
