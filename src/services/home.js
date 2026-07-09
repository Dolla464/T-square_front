import axiosClient from "../api/axios";

export const getHomePageData = () => axiosClient.get("/home");
