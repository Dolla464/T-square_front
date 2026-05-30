import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useAdminSettings } from "../../hooks/useAdminSettings";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

// استيراد ملف التنسيق المخصص والمدعوم بالتعليقات العربية للمطورين
import "./settings.css";

function AdminSettings() {
  const { i18n } = useTranslation("adminDashboard");
  const isArabic = i18n.language?.startsWith("ar");

  // استدعاء الهوك المخصص لإدارة حالة الميديا والاتصال بالـ APIs المحددة
  const {
    heroImage,
    aboutImages,
    discoveryMedia,
    generalSettings: hookGeneralSettings,
    loading,
    uploading,
    fetchMediaSettings,
    saveGeneralSettings,
    uploadMedia,
    deleteMedia,
  } = useAdminSettings();

  // إعدادات الـ Lightbox للتحكم بفتح وعرض السلايد شو لمعرض الصور بشكل ديناميكي
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  // مرجع لعناصر إدخال الملفات للتحكم بمسح القيم يدوياً بعد الرفع
  const heroInputRef = useRef(null);
  const aboutInputRef = useRef(null);
  const discoveryInputRef = useRef(null);

  // حالة لتعديل وإدارة الإعدادات العامة (General Settings) محلياً للمزامنة مع قاعدة البيانات
  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [localGeneralSettings, setLocalGeneralSettings] = useState({
    site_name: "",
    contact_email: "",
    whatsapp: "",
    facebook_url: "",
    maintenance_mode: "false",
  });

  // مزامنة البيانات المحلية عند اكتمال جلب الإعدادات من الهوك
  useEffect(() => {
    if (hookGeneralSettings) {
      setLocalGeneralSettings({
        site_name: hookGeneralSettings.site_name,
        contact_email: hookGeneralSettings.contact_email,
        whatsapp: hookGeneralSettings.whatsapp,
        facebook_url: hookGeneralSettings.facebook_url,
        maintenance_mode: String(hookGeneralSettings.maintenance_mode),
      });
    }
  }, [hookGeneralSettings]);

  // حفظ الإعدادات العامة في قاعدة البيانات دفعة واحدة بالتوازي
  const handleSaveGeneral = async () => {
    setIsEditingGeneral(false);
    await saveGeneralSettings(localGeneralSettings);
  };

  // خيارات الرفع التلقائية والافتراضية هي الاستبدال (Replace) لجميع الأقسام
  const [aboutAction, setAboutAction] = useState("replace");
  const [discoveryAction, setDiscoveryAction] = useState("replace");

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchMediaSettings();
  }, [fetchMediaSettings]);

  // دالة مساعدة للحصول على رابط الصورة المباشر من الاستجابة (سهلة ومنظمة وبسيطة)
  const getImgSrc = (item) => {
    if (!item) return "";
    const path = typeof item === "string" ? item : (item.image_url || item.url || item.path || item.value || "");
    if (!path) return "";
    
    // إذا كان الرابط كاملاً أو عبارة عن blob
    if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:") || path.startsWith("blob:")) {
      return path;
    }
    
    // الحصول على رابط الـ API الأساسي للباك إند
    const apiURL = import.meta.env.VITE_API_URL || "";
    const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    
    // فحص إذا كان الرابط يشتمل بالفعل على storage لتجنب التكرار
    if (!cleanPath.startsWith("/storage") && !cleanPath.startsWith("/public")) {
      return `${cleanBase}/storage${cleanPath}`;
    }
    return `${cleanBase}${cleanPath}`;
  };

  // معالجة رفع صورة الهيرو (Hero Image) - استبدال دائماً وبالمفتاح hero_image المعتمد في الباك إند
  const handleHeroChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // فحص حجم الملف بحد أقصى 3 ميجابايت
    if (file.size > 3 * 1024 * 1024) {
      toastError(
        isArabic
          ? "عذراً، حجم الصورة يتجاوز الحد الأقصى المسموح به وهو 3 ميجابايت!"
          : "Sorry, the image size exceeds the maximum limit of 3MB!"
      );
      if (heroInputRef.current) heroInputRef.current.value = "";
      return;
    }

    // إظهار نافذة التأكيد المخصصة للاستبدال
    const confirmed = await showConfirmCustom({
      title: isArabic ? "استبدال صورة الهيرو" : "Replace Hero Image",
      message: isArabic
        ? "هل أنت متأكد من استبدال صورة خلفية الهيرو الحالية بالصورة الجديدة؟"
        : "Are you sure you want to replace the current hero background image with the new one?",
      icon: "warning",
      variant: "danger",
    });
    if (!confirmed) {
      if (heroInputRef.current) heroInputRef.current.value = "";
      return;
    }

    const success = await uploadMedia([file], "hero_image", "replace");
    if (success && heroInputRef.current) {
      heroInputRef.current.value = "";
    }
  };

  // معالجة رفع صور \"من نحن\" (About Media) بمفتاح about_media المعتمد في الباك إند
  const handleAboutChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // فحص حجم الملفات بحد أقصى 3 ميجابايت لكل صورة
    const oversizedFile = files.find(file => file.size > 3 * 1024 * 1024);
    if (oversizedFile) {
      toastError(
        isArabic
          ? `عذراً، الصورة "${oversizedFile.name}" تتجاوز الحد الأقصى المسموح به وهو 3 ميجابايت!`
          : `Sorry, the image "${oversizedFile.name}" exceeds the maximum limit of 3MB!`
      );
      if (aboutInputRef.current) aboutInputRef.current.value = "";
      return;
    }

    if (aboutAction === "append") {
      const currentCount = aboutImages.length;
      if (currentCount >= 3) {
        toastError(
          isArabic
            ? "لقد وصلت بالفعل للحد الأقصى وهو 3 صور لقسم عن الشركة!"
            : "You have already reached the limit of 3 images for the About section!"
        );
        return;
      }

      const remainingSlots = 3 - currentCount;
      if (files.length > remainingSlots) {
        toastError(
          isArabic
            ? `لا يمكنك إضافة سوى ${remainingSlots} صورة إضافية لتجنب تجاوز الحد الأقصى.`
            : `You can only add up to ${remainingSlots} more images to stay within the limit.`
        );
        return;
      }
    } else {
      // وضع الاستبدال (Replace) لقسم الأبوت ميديا
      if (files.length > 3) {
        toastError(
          isArabic
            ? "الحد الأقصى للرفع هو 3 صور في وضع الاستبدال!"
            : "Maximum limit to upload is 3 images in replace mode!"
        );
        return;
      }

      // إظهار نافذة التأكيد المخصصة للاستبدال الكامل
      const confirmed = await showConfirmCustom({
        title: isArabic ? "استبدال صور القسم" : "Replace Section Images",
        message: isArabic
          ? "هل أنت متأكد من حذف واستبدال جميع الصور الحالية بالصور الجديدة؟"
          : "Are you sure you want to delete and replace all current images with the new ones?",
        icon: "warning",
        variant: "danger",
      });
      if (!confirmed) {
        if (aboutInputRef.current) aboutInputRef.current.value = "";
        return;
      }
    }

    const success = await uploadMedia(files, "about_media", aboutAction);
    if (success && aboutInputRef.current) {
      aboutInputRef.current.value = "";
    }
  };

  // معالجة رفع صور \"الديسكافري\" (Discovery Media) بمفتاح discovery_media المعتمد في الباك إند
  const handleDiscoveryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // فحص حجم الملفات بحد أقصى 3 ميجابايت لكل صورة
    const oversizedFile = files.find(file => file.size > 3 * 1024 * 1024);
    if (oversizedFile) {
      toastError(
        isArabic
          ? `عذراً، الصورة "${oversizedFile.name}" تتجاوز الحد الأقصى المسموح به وهو 3 ميجابايت!`
          : `Sorry, the image "${oversizedFile.name}" exceeds the maximum limit of 3MB!`
      );
      if (discoveryInputRef.current) discoveryInputRef.current.value = "";
      return;
    }

    if (discoveryAction === "append") {
      const currentCount = discoveryMedia.length;
      if (currentCount >= 30) {
        toastError(
          isArabic
            ? "وصلت للحد الأقصى المسموح به وهو 30 صورة لمعرض الصور!"
            : "You have reached the maximum limit of 30 images for the gallery!"
        );
        return;
      }
      const remainingSlots = 30 - currentCount;
      if (files.length > remainingSlots) {
        toastError(
          isArabic
            ? `لا يمكنك إضافة سوى ${remainingSlots} صورة إضافية فقط لتجنب تجاوز الحد الأقصى (30).`
            : `You can only add up to ${remainingSlots} more images to stay within the limit (30).`
        );
        return;
      }
    } else {
      // في حالة الاستبدال الكامل (Replace) لـ 30 صورة
      if (files.length > 30) {
        toastError(
          isArabic
            ? "الحد الأقصى للرفع هو 30 صورة في وضع الاستبدال!"
            : "Maximum limit to upload is 30 images in replace mode!"
        );
        return;
      }

      // إظهار نافذة التأكيد المخصصة للاستبدال الكامل
      const confirmed = await showConfirmCustom({
        title: isArabic ? "استبدال صور المعرض" : "Replace Gallery Images",
        message: isArabic
          ? "هل أنت متأكد من حذف واستبدال جميع صور المعرض الحالية بالصور الجديدة؟"
          : "Are you sure you want to delete and replace all current gallery images with the new ones?",
        icon: "warning",
        variant: "danger",
      });
      if (!confirmed) {
        if (discoveryInputRef.current) discoveryInputRef.current.value = "";
        return;
      }
    }

    const success = await uploadMedia(files, "discovery_media", discoveryAction);
    if (success && discoveryInputRef.current) {
      discoveryInputRef.current.value = "";
    }
  };

  // تهيئة الصور لشبكة ألبوم الصور التفاعلي (Lightbox)
  const discoveryPhotos = (discoveryMedia || []).map((url) => ({
    src: getImgSrc(url),
  }));

  return (
    <div className="admin-content-page admin-settings-page" dir={isArabic ? "rtl" : "ltr"}>
      {/* ── رأس الصفحة ── */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">{isArabic ? "إعدادات المنصة" : "Platform Settings"}</h2>
          <p className="ac-subtitle text-muted mb-0">
            {isArabic
              ? "إدارة وتحديث جميع صور ومقاطع الموقع الرئيسية وديناميكية الألبومات والإعدادات العامة"
              : "Manage and update platform general settings, main website media contents and gallery albums dynamic"}
          </p>
        </div>
      </div>

      {loading && !uploading && (
        <div className="text-center py-5">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted fw-semibold">{isArabic ? "جاري تحميل البيانات..." : "Loading content..."}</p>
        </div>
      )}

      {(!loading || uploading) && (
        <>
          {/* ────────────────────────────────────────────────────────────────
              0. قسم الإعدادات العامة (General Settings Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="general-settings-card shadow-sm">
            <div className="general-settings-header d-flex justify-content-between align-items-center">
              <span className="fw-bold">{isArabic ? "الإعدادات العامة (General Settings)" : "General Settings"}</span>
              <button
                className="btn btn-sm btn-outline-danger px-3 py-1 rounded-3 fw-bold"
                onClick={isEditingGeneral ? handleSaveGeneral : () => setIsEditingGeneral(true)}
              >
                <i className={`bi ${isEditingGeneral ? "bi-check-lg" : "bi-pencil"} me-1`}></i>
                {isEditingGeneral ? (isArabic ? "حفظ التغييرات" : "Save Changes") : (isArabic ? "تعديل" : "Edit")}
              </button>
            </div>

            <div className="general-settings-body">
              {/* Platform Name */}
              <div className="general-settings-row">
                <span className="general-settings-label">{isArabic ? "Platform Name" : "Platform Name"}</span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.site_name}
                    onChange={(e) => setLocalGeneralSettings({ ...localGeneralSettings, site_name: e.target.value })}
                  />
                ) : (
                  <span className="general-settings-value text-secondary">{localGeneralSettings.site_name}</span>
                )}
              </div>

              {/* Support Email */}
              <div className="general-settings-row">
                <span className="general-settings-label">{isArabic ? "Support Email" : "Support Email"}</span>
                {isEditingGeneral ? (
                  <input
                    type="email"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.contact_email}
                    onChange={(e) => setLocalGeneralSettings({ ...localGeneralSettings, contact_email: e.target.value })}
                  />
                ) : (
                  <span className="general-settings-value text-secondary">{localGeneralSettings.contact_email}</span>
                )}
              </div>

              {/* Support Whatsapp */}
              <div className="general-settings-row">
                <span className="general-settings-label">{isArabic ? "Support Whatsapp" : "Support Whatsapp"}</span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.whatsapp}
                    onChange={(e) => setLocalGeneralSettings({ ...localGeneralSettings, whatsapp: e.target.value })}
                  />
                ) : (
                  <span className="general-settings-value text-secondary">{localGeneralSettings.whatsapp}</span>
                )}
              </div>

              {/* Facebook URL */}
              <div className="general-settings-row">
                <span className="general-settings-label">{isArabic ? "Facebook URL" : "Facebook URL"}</span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.facebook_url}
                    onChange={(e) => setLocalGeneralSettings({ ...localGeneralSettings, facebook_url: e.target.value })}
                  />
                ) : (
                  <span className="general-settings-value text-secondary">{localGeneralSettings.facebook_url}</span>
                )}
              </div>

              {/* Maintenance Mode */}
              <div className="general-settings-row">
                <span className="general-settings-label">{isArabic ? "Maintenance Mode" : "Maintenance Mode"}</span>
                {isEditingGeneral ? (
                  <select
                    className="form-select form-select-sm w-50"
                    value={localGeneralSettings.maintenance_mode}
                    onChange={(e) => setLocalGeneralSettings({ ...localGeneralSettings, maintenance_mode: e.target.value })}
                  >
                    <option value="true">{isArabic ? "مفعل" : "Enabled"}</option>
                    <option value="false">{isArabic ? "معطل" : "Disabled"}</option>
                  </select>
                ) : (
                  <span className="general-settings-value text-secondary">
                    {localGeneralSettings.maintenance_mode === "true" ? (isArabic ? "مفعل" : "Enabled") : (isArabic ? "معطل" : "Disabled")}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              1. سكشن الهيرو (Hero Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="settings-card">
            <div className="settings-section-title">
              <i className="bi bi-image text-danger fs-4"></i>
              <span>{isArabic ? "صورة الهيرو الرئيسية (Hero Section)" : "Main Hero Background"}</span>
            </div>
            <div className="settings-title-divider"></div>

            <div className="row g-4 align-items-center">
              {/* العمود الأيمن: الصورة الحالية مع إمكانية التكبير */}
              <div className="col-md-6 order-md-2">
                <label className="form-label fw-bold text-secondary mb-2">
                  {isArabic ? "الصورة الحالية على الموقع" : "Current Active Image"}
                </label>
                <div className="hero-current-preview shadow-sm position-relative">
                  {heroImage ? (
                    <>
                      <img src={getImgSrc(heroImage)} alt="Hero Section" loading="lazy" />
                      {/* طبقة الأوفرلاي التفاعلية لتكبير صورة الهيرو */}
                      <div className="about-image-overlay d-flex justify-content-center align-items-center">
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{ width: "48px", height: "48px", transition: "transform 0.2s ease" }}
                          onClick={() => {
                            setLightboxSlides([{ src: getImgSrc(heroImage) }]);
                            setLightboxIndex(0);
                          }}
                          title={isArabic ? "عرض تكبير" : "Zoom View"}
                        >
                          <i className="bi bi-eye-fill text-dark fs-4"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted small d-flex flex-column align-items-center">
                      <i className="bi bi-image-fill fs-2 mb-2"></i>
                      <span>{isArabic ? "لا توجد صورة حالية مرفوعة" : "No active hero image uploaded"}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* العمود الأيسر: حقل رفع الصورة الجديدة (ديفولت ريبليس) */}
              <div className="col-md-6 order-md-1">
                <label className="form-label fw-bold text-secondary mb-2">
                  {isArabic ? "رفع صورة هيرو جديدة (استبدال)" : "Upload New Hero Image (Replace)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeroChange}
                  ref={heroInputRef}
                  id="heroUploadInput"
                  hidden
                />
                <label
                  htmlFor="heroUploadInput"
                  className="settings-file-uploader shadow-sm"
                  style={{ cursor: uploading ? "not-allowed" : "pointer" }}
                >
                  <i className="bi bi-cloud-arrow-up-fill"></i>
                  <h5 className="fw-bold mb-1">
                    {isArabic ? "اضغط لرفع صورة جديدة" : "Click to upload a new image"}
                  </h5>
                  <p className="text-muted small mb-0">
                    {isArabic
                      ? "PNG, JPG أو WEBP (الحد الأقصى 3 ميجابايت)"
                      : "PNG, JPG or WEBP (Max size 3MB)"}
                  </p>
                </label>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              2. سكشن أبوت ميديا (About Media Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="settings-card">
            <div className="settings-section-title d-flex justify-content-between align-items-center w-100">
              <div className="d-flex gap-2">
                <i className="bi bi-building text-danger fs-4"></i>
                <span>{isArabic ? "صور قسم عن المنصة (About Section)" : "About Section Media"}</span>
              </div>
              <span className="capacity-badge ">
                {aboutImages.length} / 3 {isArabic ? "صور" : "Images"}
              </span>
            </div>
            <div className="settings-title-divider"></div>

            {/* كارت خيارات وطريقة الرفع لقسم أبوت ميديا - الافتراضي هو ريبليس */}
            <div className="action-selector-card shadow-sm mb-4">
              <div className="row align-items-center g-3">
                <div className="col-md-6">
                  <div className="fw-bold text-dark mb-1">{isArabic ? "طريقة رفع صور قسم عن الشركة:" : "Upload action pattern:"}</div>
                  <div className="text-muted small">
                    {isArabic
                      ? "الرفع الإضافي يدمج مع الصور القديمة، بينما الاستبدال يعيد بناء القسم بالكامل."
                      : "Append adds new pictures to existing ones, while Replace overrides the whole section."}
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end">
                  <div className="action-radio-group">
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="aboutAction"
                        value="append"
                        checked={aboutAction === "append"}
                        onChange={() => setAboutAction("append")}
                      />
                      <span>{isArabic ? "إضافة وإلحاق (Append)" : "Append & Add"}</span>
                    </label>
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="aboutAction"
                        value="replace"
                        checked={aboutAction === "replace"}
                        onChange={() => setAboutAction("replace")}
                      />
                      <span>{isArabic ? "مسح واستبدال (Replace)" : "Replace All"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label fw-bold text-secondary mb-3">
                {isArabic
                  ? "الصور التعريفية الحالية (عند المرور بالماوس يظهر خيار التكبير أو الحذف)"
                  : "Current About Images (hover on any image to reveal view or delete options)"}
              </label>

              {aboutImages.length === 0 ? (
                <div className="text-center py-4 bg-light rounded-3 text-muted">
                  <i className="bi bi-folder-x fs-2 mb-2 d-block"></i>
                  <span>{isArabic ? "لم يتم رفع أي صور حتى الآن" : "No images uploaded yet"}</span>
                </div>
              ) : (
                <div className="about-images-grid">
                  {aboutImages.map((imgUrl, index) => (
                    <div key={index} className="about-image-item">
                      <img src={getImgSrc(imgUrl)} alt={`About ${index + 1}`} loading="lazy" />
                      {/* طبقة الأوفرلاي التفاعلية لتكبير الصورة أو حذفها مباشرة */}
                      <div className="about-image-overlay d-flex justify-content-center align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{ width: "44px", height: "44px", transition: "transform 0.2s ease" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxSlides(aboutImages.map(img => ({ src: getImgSrc(img) })));
                            setLightboxIndex(index);
                          }}
                          title={isArabic ? "عرض كبر" : "Zoom View"}
                        >
                          <i className="bi bi-eye-fill text-dark fs-5"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{ width: "44px", height: "44px", transition: "transform 0.2s ease" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMedia(imgUrl, "about_media", isArabic ? `الصورة رقم ${index + 1}` : `Image #${index + 1}`);
                          }}
                          title={isArabic ? "حذف الصورة" : "Delete Image"}
                        >
                          <i className="bi bi-trash-fill text-danger fs-5"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* حقل رفع إضافي للأبوت ميديا */}
            {(aboutAction === "replace" || aboutImages.length < 3) && (
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAboutChange}
                  ref={aboutInputRef}
                  id="aboutUploadInput"
                  hidden
                />
                <label htmlFor="aboutUploadInput" className="btn btn-outline-danger px-4 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center gap-2">
                  <i className="bi bi-plus-lg"></i>
                  {isArabic ? "إضافة صور جديدة" : "Add New Images"}
                </label>
                <span className="text-muted small ms-2 pe-none">
                  ({isArabic ? "الحد الأقصى 3 ميجابايت لكل صورة" : "Max size 3MB per image"})
                </span>
              </div>
            )}
          </div>

          {/* ────────────────────────────────────────────────────────────────
              3. قسم الديسكافري ميديا (Discovery Media Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="settings-card">
            <div className="settings-section-title d-flex justify-content-between align-items-center w-100">
              <div className="d-flex gap-2">
                <i className="bi bi-images text-danger fs-4"></i>
                <span>{isArabic ? "معرض الصور والألبوم (Discovery Gallery)" : "Discovery Gallery Album"}</span>
              </div>
              <span className={`capacity-badge ${discoveryMedia.length >= 30 ? "danger" : discoveryMedia.length >= 25 ? "warning" : ""}`}>
                {discoveryMedia.length} / 30 {isArabic ? "صورة" : "Photos"}
              </span>
            </div>
            <div className="settings-title-divider"></div>

            {/* كارت خيارات وطريقة الرفع للألبوم - الافتراضي هو ريبليس */}
            <div className="action-selector-card shadow-sm mb-4">
              <div className="row align-items-center g-3">
                <div className="col-md-6">
                  <div className="fw-bold text-dark mb-1">{isArabic ? "طريقة رفع الصور المعرض:" : "Upload action pattern:"}</div>
                  <div className="text-muted small">
                    {isArabic
                      ? "الرفع الإضافي يدمج مع الصور القديمة، بينما الاستبدال يعيد بناء الألبوم بالكامل."
                      : "Append adds new pictures to existing ones, while Replace overrides the whole album."}
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end">
                  <div className="action-radio-group">
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="discoveryAction"
                        value="append"
                        checked={discoveryAction === "append"}
                        onChange={() => setDiscoveryAction("append")}
                      />
                      <span>{isArabic ? "إضافة وإلحاق (Append)" : "Append & Add"}</span>
                    </label>
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="discoveryAction"
                        value="replace"
                        checked={discoveryAction === "replace"}
                        onChange={() => setDiscoveryAction("replace")}
                      />
                      <span>{isArabic ? "مسح واستبدال (Replace)" : "Replace All"}</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ألبوم عرض الصور الذكي (فقط فريم الصورة مع الأوفرلاي والتحكم التفاعلي) */}
            <div className="mb-4">
              <label className="form-label fw-bold text-secondary mb-3">
                {isArabic
                  ? "معرض الألبوم التفاعلي (عند المرور بالماوس يظهر خيار التكبير أو الحذف)"
                  : "Interactive Gallery Album (hover on any image to reveal view or delete options)"}
              </label>

              {discoveryMedia.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3 text-muted">
                  <i className="bi bi-images fs-1 mb-2 d-block"></i>
                  <span>{isArabic ? "الألبوم فارغ تماماً حالياً!" : "The album is currently empty!"}</span>
                </div>
              ) : (
                <div className="about-images-grid">
                  {discoveryMedia.map((url, index) => (
                    <div key={index} className="about-image-item">
                      <img src={getImgSrc(url)} alt={`Discovery ${index + 1}`} loading="lazy" />
                      {/* طبقة الأوفرلاي التفاعلية لتكبير الصورة أو حذفها مباشرة */}
                      <div className="about-image-overlay d-flex justify-content-center align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{ width: "44px", height: "44px", transition: "transform 0.2s ease" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxSlides(discoveryPhotos);
                            setLightboxIndex(index);
                          }}
                          title={isArabic ? "عرض كبر" : "Zoom View"}
                        >
                          <i className="bi bi-eye-fill text-dark fs-5"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{ width: "44px", height: "44px", transition: "transform 0.2s ease" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMedia(url, "discovery_media", isArabic ? `صورة المعرض رقم ${index + 1}` : `Gallery photo #${index + 1}`);
                          }}
                          title={isArabic ? "حذف الصورة" : "Delete Image"}
                        >
                          <i className="bi bi-trash-fill text-danger fs-5"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* حقل الرفع العام لمعرض الديسكافري */}
            {(discoveryAction === "replace" || discoveryMedia.length < 30) && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleDiscoveryChange}
                  ref={discoveryInputRef}
                  id="discoveryUploadInput"
                  hidden
                />
                <label
                  htmlFor="discoveryUploadInput"
                  className="btn btn-outline-danger px-4 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-plus-lg"></i>
                  {isArabic ? "رفع وسائط المعرض" : "Upload Gallery Media"}
                </label>
                <span className="text-muted small ms-2 pe-none">
                  ({isArabic ? "الحد الأقصى 3 ميجابايت لكل صورة" : "Max size 3MB per image"})
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── سلايد شو عارض الصور التفاعلي (Lightbox Component) ── */}
      <Lightbox
        open={lightboxIndex >= 0}
        index={lightboxIndex}
        close={() => setLightboxIndex(-1)}
        slides={lightboxSlides}
        carousel={{ finite: true }}
      />
    </div>
  );
}

export default AdminSettings;
