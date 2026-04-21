import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerService } from '../services/register';
import { useAuth } from '../contexts/AuthContext';

export const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const executeRegister = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // By default ensure role is student based on requirement
      const payload = { ...userData, role: 'student' };
      const response = await registerService(payload);
      
      const responseData = response.data; // { user, token }
      setSuccessMsg(response.message || 'Registration successful.');

      // --- EMAIL VERIFICATION FLOW (Commented out for future use) ---
      // If email verification is strict and blocks login:
      // if (response.status === 'success' && response.message.includes('verify')) {
      //    navigate('/verify-email', { state: { email: userData.email } });
      //    return response;
      // }
      // -------------------------------------------------------------

      // 1. Log the user in implicitly using AuthContext logic
      login(responseData);

      // 2. Redirect to default student dashboard 
      // (or let ProtectedRoute logic handle it based on context if we just navigate('/student'))
      if (responseData.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }
      
      return response;
    } catch (err) {
      // Capture error response
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check the inputs.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeRegister, loading, error, successMsg };
};
