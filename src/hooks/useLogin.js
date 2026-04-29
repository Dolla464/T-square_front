import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginService } from '../services/login';
import { useAuth } from '../contexts/AuthContext';
import { toastWelcome } from '../components/shared/Toaster/toaster';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const executeLogin = async (credentials, rememberMe = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await loginService(credentials);
      const actualData = response.data.data;
      
      // حفظ بيانات المستخدم في الـ Context
      login(actualData, rememberMe);

      // عرض رسالة ترحيب بعد تسجيل الدخول بنجاح
      toastWelcome(actualData.user?.name || actualData.user?.email);

      // Role-based routing
      if (actualData.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (actualData.user.role === "student") {
        navigate("/student", { replace: true });
      } else {
        // Fallback for unknown role
        navigate("/", { replace: true });
      }
      
      return actualData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeLogin, loading, error };
};
