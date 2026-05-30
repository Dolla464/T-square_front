import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toastSuccess, toastError, toastLoading, toastDismiss } from "../../../components/shared/Toaster/toaster";
import { showDeleteConfirm } from "../../../components/shared/ConfirmDialog/confirmDialog";
import {
  getDiscoveryMedia as apiGetDiscoveryMedia,
  getWebsiteMedia as apiGetWebsiteMedia,
  uploadWebsiteMedia as apiUploadMedia,
  deleteWebsiteMedia as apiDeleteMedia,
  updateSetting as apiUpdateSetting,
} from "../services/settingsService";

export const useAdminSettings = () => {
  const { t } = useTranslation(["adminDashboard"]);

  const [siteLogo, setSiteLogo] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [aboutImages, setAboutImages] = useState([]);
  const [discoveryMedia, setDiscoveryMedia] = useState([]);
  
  // الحالة المحلية للتحكم في الإعدادات العامة (General Settings) للمنصة
  const [generalSettings, setGeneralSettings] = useState({
    site_name: "T-Square LMS",
    contact_email: "info@tsquare.com",
    whatsapp: "0201210608027",
    facebook_url: "https://facebook.com/tsquare",
    maintenance_mode: "false",
  });
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // معالجة الأخطاء الموحدة وإطلاق التنبيهات مع الترجمات
  const handleError = useCallback((err, defaultKey) => {
    const errorMsg =
      err?.response?.data?.message ||
      t(defaultKey, "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
    setError(errorMsg);
    toastError(errorMsg);
    return errorMsg;
  }, [t]);

  // دالة مساعدة لاستخراج القيمة بشكل ديناميكي وآمن لتجنب المشاكل
  const extractValue = useCallback((res, defaultVal = null) => {
    if (!res) return defaultVal;
    const body = res.data !== undefined ? res.data : res;
    if (!body) return defaultVal;

    // إذا كانت القيمة نصاً مباشراً
    if (typeof body === "string") return body;

    // إذا كانت مغلفة في data
    const data = body.data !== undefined ? body.data : body;
    if (!data) return defaultVal;
    if (typeof data === "string") return data;

    if (typeof data === "object") {
      // فحص حقل value المعتمد بقاعدة البيانات
      if (data.value !== undefined && data.value !== null) return data.value;
      
      // فحص الحقول البديلة لتجنب أي تعقيد
      if (data.site_logo !== undefined && data.site_logo !== null) return data.site_logo;
      if (data.hero !== undefined && data.hero !== null) return data.hero;
      if (data.hero_image !== undefined && data.hero_image !== null) return data.hero_image;
      if (data.about_section !== undefined && data.about_section !== null) return data.about_section;
      if (data.about_media !== undefined && data.about_media !== null) return data.about_media;
      if (data.about_images !== undefined && data.about_images !== null) return data.about_images;

      // فحص الإعدادات العامة
      for (const k of ["site_name", "contact_email", "whatsapp", "facebook_url", "maintenance_mode"]) {
        if (data[k] !== undefined && data[k] !== null) return data[k];
      }
    }
    return defaultVal;
  }, []);

  // ================= جلب جميع الإعدادات والميديا بالتوازي وديناميكياً =================
  const fetchMediaSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // جلب جميع القيم من قاعدة البيانات بالتوازي لضمان الكفاءة
      const [
        heroRes,
        aboutRes,
        discoveryRes,
        siteNameRes,
        emailRes,
        whatsappRes,
        facebookRes,
        maintenanceRes,
        siteLogoRes
      ] = await Promise.all([
        apiGetWebsiteMedia("hero_image").catch(() => apiGetWebsiteMedia("hero")),
        apiGetWebsiteMedia("about_media").catch(() => apiGetWebsiteMedia("about_section")),
        apiGetDiscoveryMedia().catch(() => apiGetWebsiteMedia("discovery_media")),
        apiGetWebsiteMedia("site_name").catch(() => null),
        apiGetWebsiteMedia("contact_email").catch(() => null),
        apiGetWebsiteMedia("whatsapp").catch(() => null),
        apiGetWebsiteMedia("facebook_url").catch(() => null),
        apiGetWebsiteMedia("maintenance_mode").catch(() => null),
        apiGetWebsiteMedia("site_logo").catch(() => null),
      ]);

      // 1. استخراج صورة الهيرو ( hero_image أو hero )
      const hero = extractValue(heroRes);
      setHeroImage(hero);

      // 2. استخراج صور "عن الشركة" ( about_media أو about_section )
      const about = extractValue(aboutRes);
      let parsedAbout = [];
      if (about) {
        if (Array.isArray(about)) {
          parsedAbout = about;
        } else if (typeof about === "string") {
          try {
            parsedAbout = JSON.parse(about);
          } catch (e) {
            parsedAbout = about.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
          }
        }
      }
      setAboutImages(Array.isArray(parsedAbout) ? parsedAbout : []);

      // 3. استخراج صور معرض الديسكافري
      const discovery = discoveryRes?.data?.images || discoveryRes?.images || discoveryRes?.data || discoveryRes || [];
      let parsedDiscovery = discovery;
      if (typeof discovery === "string") {
        try {
          parsedDiscovery = JSON.parse(discovery);
        } catch (e) {
          parsedDiscovery = discovery.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
        }
      }
      setDiscoveryMedia(Array.isArray(parsedDiscovery) ? parsedDiscovery : []);

      // 4. استخراج شعار المنصة ( site_logo )
      const logo = extractValue(siteLogoRes);
      setSiteLogo(logo);

      // 5. استخراج الإعدادات العامة (site_name, contact_email, whatsapp, facebook_url, maintenance_mode)
      const site_name = extractValue(siteNameRes, "T-Square LMS");
      const contact_email = extractValue(emailRes, "info@tsquare.com");
      const whatsapp = extractValue(whatsappRes, "0201210608027");
      const facebook_url = extractValue(facebookRes, "https://facebook.com/tsquare");
      const maintenance_mode = String(extractValue(maintenanceRes, "false"));

      setGeneralSettings({
        site_name,
        contact_email,
        whatsapp,
        facebook_url,
        maintenance_mode,
      });

    } catch (err) {
      handleError(err, "errors.fetch_failed");
    } finally {
      setLoading(false);
    }
  }, [handleError, extractValue]);

  // ================= حفظ وتحديث إعداد فردي في قاعدة البيانات (وهمي حالياً حتى صدور الـ API) =================
  // تعليق: قسم الإعدادات العامة النصية لا يملك حالياً API نشط في الباك إند،
  // لذا قمنا ببناء محاكاة إرسال وهمية (Mock Request) لعرض شريط التحميل والنجاح بشكل واقعي وممتع.
  // سيتم تفعيل الـ Endpoint الحقيقي (apiUpdateSetting) بمجرد صدوره من الباك إند.
  const saveSetting = async (key, value) => {
    setUploading(true);
    const toastId = toastLoading(t("settings.saving", "جاري حفظ الإعدادات..."));

    try {
      // محاكاة تأخير 800ms للشعور بطلب السيرفر الحقيقي
      await new Promise((resolve) => setTimeout(resolve, 800));

      /* كود الـ API الحقيقي (معلق حالياً):
      await apiUpdateSetting(key, value);
      */
      
      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعداد بنجاح"));
      
      // تحديث الحالة المحلية مباشرة لضمان تجربة مستخدم سريعة
      setGeneralSettings(prev => ({
        ...prev,
        [key]: value
      }));
      return true;
    } catch (err) {
      toastDismiss(toastId);
      handleError(err, "errors.update_failed");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // ================= حفظ وتحديث مجموعة من الإعدادات دفعة واحدة مع توست موحد (وهمي حالياً حتى صدور الـ API) =================
  // تعليق: هذا التحديث وهمي أيضاً بالكامل للتوافق مع غياب الـ API الخاص بالإعدادات العامة النصية،
  // يمنح حفظاً سلساً وتجربة غاية في الاحترافية والجمال بإشعار موحد واحد فقط دون أي تكرار.
  const saveGeneralSettings = async (settingsObj) => {
    setUploading(true);
    const toastId = toastLoading(t("settings.saving", "جاري حفظ الإعدادات..."));

    try {
      // محاكاة تأخير 1000ms للشعور بطلب السيرفر الحقيقي دفعة واحدة
      await new Promise((resolve) => setTimeout(resolve, 1000));

      /* كود الـ API الحقيقي معلق مؤقتاً:
      await Promise.all(
        Object.entries(settingsObj).map(([key, value]) => apiUpdateSetting(key, value))
      );
      */
      
      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعدادات بنجاح"));
      
      // تحديث الحالة المحلية دفعة واحدة
      setGeneralSettings(prev => ({
        ...prev,
        ...settingsObj
      }));
      return true;
    } catch (err) {
      toastDismiss(toastId);
      handleError(err, "errors.update_failed");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // ================= رفع الميديا (يدعم اختيار append أو replace) =================
  // ── تفاصيل وتوثيق عملية الرفع لمساعدة المطورين والمشرفين ──
  // 1. استقبال ملفات الصور المختارة (files)، والمفتاح المقابل لها بالداتابيز (key)، ونوع العملية (action).
  // 2. استخدام كائن FormData لتجهيز البيانات وإرسالها بصيغة multipart/form-data.
  // 3. نرسل حقل "key" للباك إند بقيمة المفاتيح المعمدة بالتحقق (مثل: hero_image أو about_media أو discovery_media).
  // 4. نرسل حقل "action" لتحديد ما إذا كان سيتم دمج الصور الجديدة (append) أو حذف القديم واستبداله كاملاً (replace).
  // 5. نقوم بعمل حلقة تكرار لإرفاق كل الصور إلى مصفوفة images[] ليتم رفعها في طلب شبكة واحد بالتوازي.
  // 6. تشغيل شريط توست التحميل والمزامنة، يعقبه رسالة نجاح خضراء خفيفة وتحديث فوري للشاشات.
  const uploadMedia = async (files, key, action = "append") => {
    if (!files || files.length === 0) return false;

    setUploading(true);
    const toastId = toastLoading(t("settings.uploading", "جاري رفع الصور..."));

    try {
      const formData = new FormData();
      formData.append("key", key);
      formData.append("action", action);

      // إضافة جميع الملفات إلى المصفوفة images[]
      for (let i = 0; i < files.length; i++) {
        formData.append("images[]", files[i]);
      }

      // إرسال طلب الرفع الفعلي للسيرفر
      const res = await apiUploadMedia(formData);

      toastDismiss(toastId);
      toastSuccess(t("success.created", "تم الرفع بنجاح"));

      // إعادة جلب البيانات لتحديث العرض بعد الرفع الناجح
      await fetchMediaSettings();
      return res;
    } catch (err) {
      toastDismiss(toastId);
      handleError(err, "errors.create_failed");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // ================= حذف الميديا بعد تأكيد المستخدم =================
  const deleteMedia = async (imageUrl, key, name = "") => {
    // إظهار نافذة التأكيد المخصصة في الموقع
    const isConfirmed = await showDeleteConfirm(name || t("settings.image", "هذه الصورة"));
    if (!isConfirmed) return false;

    setLoading(true);
    const toastId = toastLoading(t("settings.deleting", "جاري حذف الصورة..."));

    try {
      await apiDeleteMedia(imageUrl, key);

      toastDismiss(toastId);
      toastSuccess(t("success.deleted", "تم حذف الصورة بنجاح"));

      // إعادة جلب البيانات لتحديث العرض بعد الحذف
      await fetchMediaSettings();
      return true;
    } catch (err) {
      toastDismiss(toastId);
      handleError(err, "errors.delete_failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    siteLogo,
    heroImage,
    aboutImages,
    discoveryMedia,
    generalSettings,
    loading,
    uploading,
    error,
    fetchMediaSettings,
    saveSetting,
    saveGeneralSettings,
    uploadMedia,
    deleteMedia,
  };
};
