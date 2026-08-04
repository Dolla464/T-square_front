import axiosClient from "../../../api/axios";
import { buildInstructorProfilePayload } from "../../../utils/buildPayload";

export const getInstructorProfile = () => axiosClient.get("/profile");

export const updateInstructorProfile = (profileData) => {
  const payload = buildInstructorProfilePayload(profileData);

  if (payload instanceof FormData) {
    return axiosClient.post("/profile", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return axiosClient.post("/profile", payload);
};

export const updateInstructorPassword = (passwordData) => {
  return axiosClient.put("/profile/password", {
    current_password: passwordData.current_password,
    password: passwordData.password,
    password_confirmation: passwordData.password_confirmation,
  });
};
