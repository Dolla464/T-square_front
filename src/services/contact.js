import axiosClient from "../api/axios";

export const postContactMessage = (data) =>
    axiosClient.post("/student/contact-us", data);
