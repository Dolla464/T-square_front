import axiosClient from "../api/axios";

export const getWebsiteMedia = (key) =>
  axiosClient.get(`/website-media/${key}`);

export const getSetting = (key) =>
  axiosClient.get(`/settings/${key}`).then((res) => res.data);

