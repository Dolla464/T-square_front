import axiosClient from "../api/axios";

export const getWebsiteMedia = (key) =>
  axiosClient.get(`/website-media/${key}`);
