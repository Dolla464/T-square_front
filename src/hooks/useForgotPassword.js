import { useState } from 'react';
import { forgotPasswordService } from '../services/forgotPassword';
import {
  toastSuccess,
  toastError,
  toastWarning,
} from '../components/shared/Toaster/toaster';

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const executeForgotPassword = async (email) => {
    setLoading(true);
    try {
      await forgotPasswordService(email);
      const isArabic =
        document.documentElement.lang === 'ar' ||
        localStorage.getItem('i18nextLng')?.startsWith('ar');
      toastSuccess(
        isArabic
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور بنجاح. يرجى التحقق من بريدك الإلكتروني (بما في ذلك البريد العشوائي).'
          : 'Password reset link sent successfully. Please check your email (including spam folder).',
      );
      return true;
    } catch (err) {
      const responseData = err.response?.data;
      const message = responseData?.message || responseData?.error || '';
      const isArabic =
        document.documentElement.lang === 'ar' ||
        localStorage.getItem('i18nextLng')?.startsWith('ar');

      const isThrottle = 
        message.toLowerCase().includes('wait') ||
        message.toLowerCase().includes('retry') ||
        message.toLowerCase().includes('throttle') ||
        err.response?.status === 429;

      if (isThrottle) {
        toastWarning(
          isArabic
            ? 'لقد أرسلت طلبًا مؤخرًا. يرجى الانتظار قليلاً قبل المحاولة مرة أخرى.'
            : 'You recently sent a request. Please wait a moment before trying again.',
        );
      } else {
        toastError(
          isArabic
            ? 'البريد الإلكتروني غير صحيح أو غير مسجل'
            : message || 'Invalid or unregistered email',
        );
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { executeForgotPassword, loading };
};
