import { useState } from "react";
import { createPayment } from "../services/payment";

/**
 * Custom hook for handling payment-related logic.
 *
 * @returns {Object} - { createEnrollment, loading, error }
 */
const usePayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createEnrollment = async (paymentData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createPayment(paymentData);
      setLoading(false);
      return response;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  };

  return { createEnrollment, loading, error };
};

export default usePayment;
