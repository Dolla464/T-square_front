import axiosInstance from "./axios"; // ملف إعدادات للأكسيوس

export const fetchUserCategories = (params) => {
  return axiosInstance.get("api/student/categories", { params });
};

export const fetchUserCourses = (params) => {
  return axiosInstance.get("api/student/courses", { params });
};