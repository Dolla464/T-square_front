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
      const responseData = err.response?.data;
      const message = responseData?.message || responseData?.error || '';

      const isThrottle = 
        message.toLowerCase().includes('wait') ||
        message.toLowerCase().includes('retry') ||
        message.toLowerCase().includes('throttle') ||
        err.response?.status === 429;

      if (isThrottle) {
        setError({ type: 'throttle', message });
      } else {
        setError({ type: 'invalid', message: message || 'Failed to send password reset email.' });
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeForgotPassword, loading, error, successMsg };
};
