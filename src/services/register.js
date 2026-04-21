import axiosClient from '../api/axios';

export const registerService = async (userData) => {
  // Expected userData: { name, email, password, password_confirmation, phone, role: 'student' }
  const response = await axiosClient.post('/register', userData);
  return response.data;
};
