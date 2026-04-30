import axiosClient from "../api/axios";

export const getInstructors = () =>
    axiosClient.get("/student/instructors");
