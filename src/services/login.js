import axiosClient from '../api/axios';

export const loginService = async (credentials) => {
  const response = await axiosClient.post('/login', credentials);
  return response.data;
};
