import { createContext, useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  toastSuccess,
  toastError,
  toastLoading,
  toastDismiss,
} from "../../../components/shared/Toaster/toaster";
import { showDeleteConfirm } from "../../../components/shared/ConfirmDialog/confirmDialog";
import {
  getDiscoveryMedia as apiGetDiscoveryMedia,
  getWebsiteMedia as apiGetWebsiteMedia,
  getSetting as apiGetSetting,
  getMaintenanceStatus as apiGetMaintenanceStatus,
  uploadWebsiteMedia as apiUploadMedia,
  deleteWebsiteMedia as apiDeleteMedia,
  updateSetting as apiUpdateSetting,
} from "../services/settingsService";

<<<<<<< HEAD:src/modules/admin-dashboard/hooks/useAdminSettings.jsx
// سياق مشترك للإعدادات حتى تتشارك كل المكونات (الـ Layout والصفحة) نفس الحالة
// وبهذا يتفاعل شريط تنبيه الصيانة فوراً مع أي تغيير في الـ Toggle
const AdminSettingsContext = createContext(null);

const useAdminSettingsState = () => {
  const { t } = useTranslation(["adminDashboard"]);

=======
export const useAdminSettings = () => {
  const { t, i18n } = useTranslation(["adminDashboard"]);
  const isArabic = i18n.language == "ar";
  const [siteLogo, setSiteLogo] = useState(null);
>>>>>>> 9cea2ec37f1efaa950b783f9c3d4721752f2e7e3:src/modules/admin-dashboard/hooks/useAdminSettings.js
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
  const handleError = useCallback(
    (err, defaultKey) => {
      const errorMsg =
        err?.response?.data?.message ||
        t(defaultKey, "حدث خطأ ما، يرجى المحاولة مرة أخرى.");
      setError(errorMsg);
      toastError(errorMsg);
      return errorMsg;
    },
    [t],
  );

  // دالة مساعدة لاستخراج القيمة بشكل ديناميكي وآمن لتجنب المشاكل
  const extractValue = useCallback((res, defaultVal = null) => {
    if (!res) return defaultVal;
    const body = res.data !== undefined ? res.data : res;
    if (!body) return defaultVal;

    if (typeof body === "string") return body;

    const data = body.data !== undefined ? body.data : body;
    if (!data) return defaultVal;
    if (typeof data === "string") return data;

    if (typeof data === "object") {
      if (data.value !== undefined && data.value !== null) return data.value;
<<<<<<< HEAD:src/modules/admin-dashboard/hooks/useAdminSettings.jsx
=======

      // فحص الحقول البديلة لتجنب أي تعقيد
      if (data.site_logo !== undefined && data.site_logo !== null) return data.site_logo;
      if (data.hero !== undefined && data.hero !== null) return data.hero;
      if (data.hero_image !== undefined && data.hero_image !== null) return data.hero_image;
      if (data.about_section !== undefined && data.about_section !== null) return data.about_section;
      if (data.about_media !== undefined && data.about_media !== null) return data.about_media;
      if (data.about_images !== undefined && data.about_images !== null) return data.about_images;
>>>>>>> 9cea2ec37f1efaa950b783f9c3d4721752f2e7e3:src/modules/admin-dashboard/hooks/useAdminSettings.js

      if (data.hero !== undefined && data.hero !== null) return data.hero;
      if (data.hero_image !== undefined && data.hero_image !== null)
        return data.hero_image;
      if (data.about_section !== undefined && data.about_section !== null)
        return data.about_section;
      if (data.about_media !== undefined && data.about_media !== null)
        return data.about_media;
      if (data.about_images !== undefined && data.about_images !== null)
        return data.about_images;

      for (const k of [
        "site_name",
        "contact_email",
        "whatsapp",
        "facebook_url",
        "maintenance_mode",
      ]) {
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
      const [
        heroRes,
        aboutRes,
        discoveryRes,
        siteNameRes,
        emailRes,
        whatsappRes,
        facebookRes,
        maintenanceRes,
      ] = await Promise.all([
        apiGetWebsiteMedia("hero_image")
          .catch(() => apiGetWebsiteMedia("hero"))
          .catch(() => null),
        apiGetWebsiteMedia("about_media")
          .catch(() => apiGetWebsiteMedia("about_section"))
          .catch(() => null),
        apiGetDiscoveryMedia()
          .catch(() => apiGetWebsiteMedia("discovery_media"))
          .catch(() => null),
        apiGetSetting("site_name").catch(() => null),
        apiGetSetting("contact_email").catch(() => null),
        apiGetSetting("whatsapp").catch(() => null),
        apiGetSetting("facebook_url").catch(() => null),
        apiGetMaintenanceStatus().catch(() => false),
      ]);

      const hero = extractValue(heroRes);
      setHeroImage(hero);

      const about = extractValue(aboutRes);
      let parsedAbout = [];
      if (about) {
        if (Array.isArray(about)) {
          parsedAbout = about;
        } else if (typeof about === "string") {
          try {
            parsedAbout = JSON.parse(about);
          } catch {
            parsedAbout = about
              .split(",")
              .map((s) => s.trim().replace(/^["']|["']$/g, ""));
          }
        }
      }
      setAboutImages(Array.isArray(parsedAbout) ? parsedAbout : []);

      const discovery =
        discoveryRes?.data?.images ||
        discoveryRes?.images ||
        discoveryRes?.data ||
        discoveryRes ||
        [];
      let parsedDiscovery = discovery;
      if (typeof discovery === "string") {
        try {
          parsedDiscovery = JSON.parse(discovery);
        } catch {
          parsedDiscovery = discovery
            .split(",")
            .map((s) => s.trim().replace(/^["']|["']$/g, ""));
        }
      }
      setDiscoveryMedia(Array.isArray(parsedDiscovery) ? parsedDiscovery : []);

      const site_name = extractValue(siteNameRes, "T-Square LMS");
      const contact_email = extractValue(emailRes, "info@tsquare.com");
      const whatsapp = extractValue(whatsappRes, "");
      const facebook_url = extractValue(facebookRes, "");

      const maintenance_mode = maintenanceRes === true ? "true" : "false";

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

<<<<<<< HEAD:src/modules/admin-dashboard/hooks/useAdminSettings.jsx
  // ================= حفظ وتحديث مجموعة من الإعدادات ربطاً بالباك إند الحقيقي =================
=======
  // ================= حفظ وتحديث إعداد فردي في قاعدة البيانات (وهمي حالياً حتى صدور الـ API) =================
  // تعليق: قسم الإعدادات العامة النصية لا يملك حالياً API نشط في الباك إند،
  // لذا قمنا ببناء محاكاة إرسال وهمية (Mock Request) لعرض شريط التحميل والنجاح بشكل واقعي وممتع.
  // سيتم تفعيل الـ Endpoint الحقيقي (apiUpdateSetting) بمجرد صدوره من الباك إند.
  const saveSetting = async (key, value) => {
    setUploading(true);
    const toastId = toastLoading(isArabic ? "جاري حفظ الاعدادات..." : "Saving setting");

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
>>>>>>> 9cea2ec37f1efaa950b783f9c3d4721752f2e7e3:src/modules/admin-dashboard/hooks/useAdminSettings.js
  const saveGeneralSettings = async (settingsObj) => {
    setUploading(true);
    const toastId = toastLoading(isArabic ? "جاري حفظ الاعدادات..." : "Saving setting");

    try {
      await Promise.all(
        Object.entries(settingsObj).map(([key, value]) => {
          let payloadValue = value;
          if (key === "maintenance_mode") {
            const isMaintenanceOn = value === "true" || value === true;
            payloadValue = isMaintenanceOn ? "1" : "0";
          }

          // العودة لتمرير الـ key كـ string صافي والـ value كبارامتر ثاني لمنع الـ TypeError بالباك إند
          return apiUpdateSetting(key, payloadValue);
        }),
      );
<<<<<<< HEAD:src/modules/admin-dashboard/hooks/useAdminSettings.jsx
=======
      */
>>>>>>> 9cea2ec37f1efaa950b783f9c3d4721752f2e7e3:src/modules/admin-dashboard/hooks/useAdminSettings.js

      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعدادات بنجاح"));

<<<<<<< HEAD:src/modules/admin-dashboard/hooks/useAdminSettings.jsx
      setGeneralSettings((prev) => ({
=======
      // تحديث الحالة المحلية دفعة واحدة
      setGeneralSettings(prev => ({
>>>>>>> 9cea2ec37f1efaa950b783f9c3d4721752f2e7e3:src/modules/admin-dashboard/hooks/useAdminSettings.js
        ...prev,
        ...settingsObj,
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

  // ================= حفظ وتحديث إعداد فردي في قاعدة البيانات =================
  const saveSetting = async (key, value) => {
    setUploading(true);
    const toastId = toastLoading(t("settings.saving", "جاري حفظ الإعدادات..."));

    try {
      const payloadValue =
        key === "maintenance_mode"
          ? value === "true" || value === true
            ? "1"
            : "0"
          : value;

      // تمرير الـ key كـ string صافي
      await apiUpdateSetting(key, payloadValue);

      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعداد بنجاح"));

      setGeneralSettings((prev) => ({
        ...prev,
        [key]: value,
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

  // ================= رفع الميديا =================
  const uploadMedia = async (files, key, action = "append") => {
    if (!files || files.length === 0) return false;

    setUploading(true);
    const toastId = toastLoading(isArabic ? "جاري رفع الصور..." : "Uploading images");

    try {
      const formData = new FormData();
      formData.append("key", key);
      formData.append("action", action);

      for (let i = 0; i < files.length; i++) {
        formData.append("images[]", files[i]);
      }

      const res = await apiUploadMedia(formData);

      toastDismiss(toastId);
      toastSuccess(t("success.created", "تم الرفع بنجاح"));

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

  // ================= حذف الميديا =================
  const deleteMedia = async (imageUrl, key, name = "") => {
    const isConfirmed = await showDeleteConfirm(
      name || t("settings.image", "هذه الصورة"),
    );
    if (!isConfirmed) return false;

    setLoading(true);
    const toastId = toastLoading(isArabic ? "جاري حذف الصور..." : "Deleting images..");

    try {
      await apiDeleteMedia(imageUrl, key);

      toastDismiss(toastId);
      toastSuccess(t("success.deleted", "تم حذف الصورة بنجاح"));

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

// مزود الحالة المشتركة - يلف لوحة تحكم الأدمن بأكملها
export const AdminSettingsProvider = ({ children }) => {
  const value = useAdminSettingsState();
  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

// الهوك العام الذي تستهلكه المكونات للوصول لنفس الحالة المشتركة
export const useAdminSettings = () => {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error(
      "useAdminSettings must be used within an AdminSettingsProvider",
    );
  }
  return context;
};
