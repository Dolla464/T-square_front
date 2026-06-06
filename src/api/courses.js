import axiosInstance from "./axios"; // ملف إعدادات للأكسيوس

export const fetchUserCategories = (params, config = {}) => {
  return axiosInstance.get("student/categories", { params, ...config });
};

export const fetchUserCourses = (params, config = {}) => {
  return axiosInstance.get("student/courses", { params, ...config });
};