import axiosClient from "../../../api/axios";

export const getLearningGroups = (params) =>
  axiosClient.get("/admin/learning-groups", { params }).then((res) => res.data);

export const getLearningGroupsSelection = () =>
  axiosClient.get("/admin/learning-groups/selection").then((res) => res.data);

export const getLearningGroupById = (id) =>
  axiosClient.get(`/admin/learning-groups/${id}`).then((res) => res.data);

export const createLearningGroup = (payload) =>
  axiosClient
    .post("/admin/learning-groups", payload)
    .then((res) => res.data);

export const updateLearningGroup = (id, payload) =>
  axiosClient
    .put(`/admin/learning-groups/${id}`, payload)
    .then((res) => res.data);

export const deleteLearningGroup = (id) =>
  axiosClient
    .delete(`/admin/learning-groups/${id}`)
    .then((res) => res.data);
