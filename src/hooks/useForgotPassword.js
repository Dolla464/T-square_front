import { useState } from 'react';
import { forgotPasswordService } from '../services/forgotPassword';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const executeForgotPassword = async (email) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const data = await forgotPasswordService(email);
      setSuccessMsg(data.status || 'Email sent successfully.');
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to send password reset email.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeForgotPassword, loading, error, successMsg };
};
