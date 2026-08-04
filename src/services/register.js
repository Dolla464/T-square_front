import axiosClient from '../api/axios';
import { buildRegisterPayload } from '../utils/buildPayload';

export const registerService = async (userData) => {
  const response = await axiosClient.post('/register', buildRegisterPayload(userData));
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
