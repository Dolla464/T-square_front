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

      // التوجيه إلى صفحة تسجيل الدخول بدلاً من الدخول التلقائي
      navigate('/login', { replace: true });

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
