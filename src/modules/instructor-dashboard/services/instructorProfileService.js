import axiosClient from "../../../api/axios";

export const getInstructorProfile = () => axiosClient.get("/profile");

export const updateInstructorProfile = (profileData) => {
  if (profileData instanceof FormData) {
    return axiosClient.post("/profile", profileData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  }

  return axiosClient.post("/profile", {
    full_name: profileData.name || profileData.full_name,
    gender: profileData.gender,
    field: profileData.field,
    bio: profileData.bio,
    insta_url: profileData.insta_url,
    linkedin_url: profileData.linkedin_url,
    facebook_url: profileData.facebook_url,
  });
};

export const updateInstructorPassword = (passwordData) => {
  return axiosClient.put("/profile/password", {
    current_password: passwordData.current_password,
    password: passwordData.password,
    password_confirmation: passwordData.password_confirmation,
  });
};
