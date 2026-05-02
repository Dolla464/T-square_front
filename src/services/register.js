import axiosClient from '../api/axios';

export const registerService = async (userData) => {
  // Expected userData: { name, email, password, password_confirmation, phone, role: 'student' }
  const response = await axiosClient.post('/register', userData);
  return response.data;
};

export const verifyEmail = async (id, hash, expires, signature) => {
  const response = await axiosClient.get(`/verify-email/${id}/${hash}?expires=${expires}&signature=${signature}`);
  return response.data;
};

export const resendVerificationNotification = async () => {
  const response = await axiosClient.post('/email/verification-notification');
  return response.data;
};
