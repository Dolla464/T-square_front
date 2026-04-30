import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerService } from '../services/register';
import { useAuth } from '../contexts/AuthContext';
import { toastAccountCreated } from '../components/shared/Toaster/toaster';

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
      // التأكد من إرسال الدور كـ student بشكل افتراضي للتوافق مع الباك-إند
      const payload = { ...userData, role: userData.role || 'student' };
      const response = await registerService(payload);

      const responseData = response.data;
      setSuccessMsg(responseData.message || response.data.message || 'Registration successful.');

      // عرض إشعار إنشاء الحساب بنجاح
      toastAccountCreated();

      // 1. Log the user in implicitly using AuthContext logic
      login(responseData);

      // 2. Redirect based on role
      if (responseData.user?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/student', { replace: true });
      }

      return response;
    } catch (err) {
      // استخراج رسالة الخطأ بشكل دقيق من رد الباك-إند
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please check the inputs.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeRegister, loading, error, successMsg };
};
