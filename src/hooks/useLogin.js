import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginService } from '../services/login';
import { useAuth } from '../contexts/AuthContext';
import { toastWelcome } from '../components/shared/Toaster/toaster';
import { getRouteByRole } from '../config/routes';
import { safeReturnUrl } from '../utils/safeReturnUrl';

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ وحد الاسم مع اللي بيجي من ProtectedRoute
  const returnUrl = safeReturnUrl(
    location.state?.from || location.state?.returnUrl,
  );

  const executeLogin = async (credentials, rememberMe = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginService(credentials);
      const actualData = response.data.data;

      // ✅ استنى لما login يخلص (يخزن ويعمل fetch profile)
      await login(actualData, rememberMe);

      // ✅ الرسالة بعد ما كل حاجة تخلص
      toastWelcome(actualData.user?.name || actualData.user?.email);

      // ✅ Redirect
      if (returnUrl) {
        navigate(returnUrl, { replace: true });
        return actualData;
      }

      navigate(getRouteByRole(actualData.user.role), { replace: true });

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