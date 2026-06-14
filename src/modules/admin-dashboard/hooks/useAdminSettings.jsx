import { createContext, useContext, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { clearHeroAndAboutCache } from "../../../hooks/useDiscovery";
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

// 1. إنشاء الـ Context في البداية لمنع أخطاء الترتيب
const AdminSettingsContext = createContext(null);

// ذاكرة تخزين مؤقتة على مستوى المودول لمنع تكرار طلبات API أثناء التنقل بين الصفحات
let settingsCache = null;

// 2. تغيير اسم الهوك الداخلي ليصبح مسئولاً عن بناء الـ State
export const useAdminSettingsState = () => {
  const { t, i18n } = useTranslation(["adminDashboard"]);
  const isArabic = i18n.language === "ar";
  const [siteLogo, setSiteLogo] = useState(
    () => settingsCache?.siteLogo || null,
  );
  const [heroImage, setHeroImage] = useState(
    () => settingsCache?.heroImage || null,
  );
  const [aboutImages, setAboutImages] = useState(
    () => settingsCache?.aboutImages || [],
  );
  const [discoveryMedia, setDiscoveryMedia] = useState(
    () => settingsCache?.discoveryMedia || [],
  );

  // الحالة المحلية للتحكم في الإعدادات العامة (General Settings) للمنصة
  const [generalSettings, setGeneralSettings] = useState(
    () =>
      settingsCache?.generalSettings || {
        site_name: "T-Square LMS",
        contact_email: "N/A",
        whatsapp: "N/A",
        facebook_url: "N/A",
        maintenance_mode: "false",
        hero_title_en: "N/A",
        hero_title_ar: "N/A",
        hero_title_highlight_en: "N/A",
        hero_title_highlight_ar: "N/A",
        hero_subtitle_en: "N/A",
        hero_subtitle_ar: "N/A",
      },
  );

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

      // فحص الحقول البديلة لتجنب أي تعقيد
      if (data.site_logo !== undefined && data.site_logo !== null)
        return data.site_logo;
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
        "hero_title_en",
        "hero_title_ar",
        "hero_title_highlight_en",
        "hero_title_highlight_ar",
        "hero_subtitle_en",
        "hero_subtitle_ar",
      ]) {
        if (data[k] !== undefined && data[k] !== null) return data[k];
      }
    }
    return defaultVal;
  }, []);

  // ================= جلب جميع الإعدادات والميديا بالتوازي وديناميكياً =================
  const fetchMediaSettings = useCallback(
    async (force = false) => {
      if (settingsCache && !force) {
        // تم تحميل الإعدادات مسبقاً، لا داعي لتكرار الـ API
        return;
      }
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
          heroTitleEnRes,
          heroTitleArRes,
          heroTitleHighlightEnRes,
          heroTitleHighlightArRes,
          heroSubtitleEnRes,
          heroSubtitleArRes,
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
          apiGetSetting("hero_title_en").catch(() => null),
          apiGetSetting("hero_title_ar").catch(() => null),
          apiGetSetting("hero_title_highlight_en").catch(() => null),
          apiGetSetting("hero_title_highlight_ar").catch(() => null),
          apiGetSetting("hero_subtitle_en").catch(() => null),
          apiGetSetting("hero_subtitle_ar").catch(() => null),
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
        setDiscoveryMedia(
          Array.isArray(parsedDiscovery) ? parsedDiscovery : [],
        );

        const site_name = extractValue(siteNameRes, "T-Square LMS");
        const contact_email = extractValue(emailRes, "N/A") || "N/A";
        const whatsapp = extractValue(whatsappRes, "N/A") || "N/A";
        const facebook_url = extractValue(facebookRes, "N/A") || "N/A";

        const maintenance_mode = maintenanceRes === true ? "true" : "false";

        const hero_title_en = extractValue(heroTitleEnRes, "N/A") || "N/A";
        const hero_title_ar = extractValue(heroTitleArRes, "N/A") || "N/A";
        const hero_title_highlight_en =
          extractValue(heroTitleHighlightEnRes, "N/A") || "N/A";
        const hero_title_highlight_ar =
          extractValue(heroTitleHighlightArRes, "N/A") || "N/A";
        const hero_subtitle_en =
          extractValue(heroSubtitleEnRes, "N/A") || "N/A";
        const hero_subtitle_ar =
          extractValue(heroSubtitleArRes, "N/A") || "N/A";

        const newGeneralSettings = {
          site_name,
          contact_email,
          whatsapp,
          facebook_url,
          maintenance_mode,
          hero_title_en,
          hero_title_ar,
          hero_title_highlight_en,
          hero_title_highlight_ar,
          hero_subtitle_en,
          hero_subtitle_ar,
        };

        setGeneralSettings(newGeneralSettings);

        // تحديث ذاكرة التخزين المؤقت
        settingsCache = {
          siteLogo: null,
          heroImage: hero,
          aboutImages: Array.isArray(parsedAbout) ? parsedAbout : [],
          discoveryMedia: Array.isArray(parsedDiscovery) ? parsedDiscovery : [],
          generalSettings: newGeneralSettings,
        };
      } catch (err) {
        handleError(err, "errors.fetch_failed");
      } finally {
        setLoading(false);
      }
    },
    [handleError, extractValue],
  );

  // ================= حفظ وتحديث إعداد فردي =================
  const saveSetting = async (key, value) => {
    setUploading(true);
    const toastId = toastLoading(
      isArabic ? "جاري حفظ الاعدادات..." : "Saving setting",
    );

    try {
      let payloadValue = value;
      if (key === "maintenance_mode") {
        payloadValue = value === "true" || value === true ? "1" : "0";
      }

      await apiUpdateSetting(key, payloadValue);
      clearHeroAndAboutCache();

      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعداد بنجاح"));

      setGeneralSettings((prev) => {
        const next = {
          ...prev,
          [key]: value,
        };
        if (settingsCache) {
          settingsCache.generalSettings = next;
        }
        return next;
      });
      return true;
    } catch (err) {
      toastDismiss(toastId);
      handleError(err, "errors.update_failed");
      return false;
    } finally {
      setUploading(false);
    }
  };

  // ================= حفظ وتحديث مجموعة من الإعدادات دفعة واحدة =================
  const saveGeneralSettings = async (settingsObj) => {
    setUploading(true);
    const toastId = toastLoading(
      isArabic ? "جاري حفظ الاعدادات..." : "Saving setting",
    );

    try {
      // Find only the keys that have actually changed compared to the current generalSettings state
      const changedSettings = Object.entries(settingsObj).filter(
        ([key, value]) => {
          return generalSettings[key] !== value;
        },
      );

      if (changedSettings.length > 0) {
        await Promise.all(
          changedSettings.map(([key, value]) => {
            let payloadValue = value;
            if (key === "maintenance_mode") {
              const isMaintenanceOn = value === "true" || value === true;
              payloadValue = isMaintenanceOn ? "1" : "0";
            }
            return apiUpdateSetting(key, payloadValue);
          }),
        );
        clearHeroAndAboutCache();
      }

      toastDismiss(toastId);
      toastSuccess(t("success.updated", "تم تحديث الإعدادات بنجاح"));

      setGeneralSettings((prev) => {
        const next = {
          ...prev,
          ...settingsObj,
        };
        if (settingsCache) {
          settingsCache.generalSettings = next;
        }
        return next;
      });
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
    const toastId = toastLoading(
      isArabic ? "جاري رفع الصور..." : "Uploading images",
    );

    try {
      const formData = new FormData();
      formData.append("key", key);
      formData.append("action", action);

      for (let i = 0; i < files.length; i++) {
        formData.append("images[]", files[i]);
      }

      const res = await apiUploadMedia(formData);
      clearHeroAndAboutCache();

      toastDismiss(toastId);
      toastSuccess(t("success.created", "تم الرفع بنجاح"));

      await fetchMediaSettings(true);
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
    const toastId = toastLoading(
      isArabic ? "جاري حذف الصور..." : "Deleting images..",
    );

    try {
      await apiDeleteMedia(imageUrl, key);
      clearHeroAndAboutCache();

      toastDismiss(toastId);
      toastSuccess(t("success.deleted", "تم حذف الصورة بنجاح"));

      await fetchMediaSettings(true);
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

// 3. مزود الحالة المشتركة (Provider) باستخدام الهوك الداخلي الجديد
export const AdminSettingsProvider = ({ children }) => {
  const value = useAdminSettingsState();
  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

// 4. الهوك العام الموحد الذي تستهلكه المكونات (Consumer)
export const useAdminSettings = () => {
  const context = useContext(AdminSettingsContext);
  if (!context) {
    throw new Error(
      "useAdminSettings must be used within an AdminSettingsProvider",
    );
  }
  return context;
};
