import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب جميع الرسائل من الـ API الحقيقي مع البارامترات (البحث، الترقيم، الفترة)
// ----------------------------------------------------------------------------
export const getMessages = async (params = {}) => {
  const response = await axiosClient.get("/admin/messages", { params });
  return response.data;
};

// ----------------------------------------------------------------------------
// جلب تفاصيل رسالة معينة بالـ ID من الـ API الحقيقي
// ----------------------------------------------------------------------------
export const getMessageById = async (id) => {
  const response = await axiosClient.get(`/admin/messages/${id}`);
  return response.data;
};

// ----------------------------------------------------------------------------
// حذف رسالة معينة بالـ ID من الـ API الحقيقي
// ----------------------------------------------------------------------------
export const deleteMessage = async (id) => {
  const response = await axiosClient.delete(`/admin/messages/${id}`);
  return response.data;
};
