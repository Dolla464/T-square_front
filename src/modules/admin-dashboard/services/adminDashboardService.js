import axiosClient from "../../../api/axios";

export const getDashboardStats = async () => {
  const response = await axiosClient.get("/admin/dashboard/stats");
  return response.data;
};

export const getRevenueChart = async (period = "month") => {
  const response = await axiosClient.get("/admin/dashboard/revenue-chart", {
    params: { period },
  });
  return response.data;
};

export const getCourseSales = async (period = "month") => {
  const response = await axiosClient.get("/admin/dashboard/course-sales", {
    params: { period },
  });
  return response.data;
};

export const getRecentEnrollments = async (limit = 4) => {
  const response = await axiosClient.get("/admin/dashboard/recent-enrollments", {
    params: { limit },
  });
  return response.data;
};

export const getRecentOrders = async (limit = 4) => {
  const response = await axiosClient.get("/admin/dashboard/recent-orders", {
    params: { limit },
  });
  return response.data;
};

export const getTopCourses = async (limit = 3) => {
  const response = await axiosClient.get("/admin/dashboard/top-courses", {
    params: { limit },
  });
  return response.data;
};
