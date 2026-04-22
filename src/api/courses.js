import axiosInstance from "./axios"; // ملف إعدادات للأكسيوس

export const fetchUserCategories = (params) => {
  return axiosInstance.get("/student/categories", { params });
};

export const fetchUserCourses = (params) => {
  return axiosInstance.get("/student/courses", { params });
};