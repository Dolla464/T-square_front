import axiosClient from '../api/axios';

export const forgotPasswordService = async (email) => {
  const response = await axiosClient.post('/forgot-password', { email });
  return response.data;
};
