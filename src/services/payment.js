import axios from "../api/axios";

/**
 * Create a new enrollment/payment.
 *
 * @param {Object} paymentData - The payment data to send to the API.
 * @returns {Promise<Object>} - The API response.
 */
export const createPayment = async (paymentData) => {
  try {
    const response = await axios.post("/student/enrollments", paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
