import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import { toastError } from "../../../../components/shared/Toaster/toaster";
import { useAdminSettings } from "../../hooks/useAdminSettings";

// استيراد ملف التنسيق المخصص والمدعوم بالتعليقات العربية للمطورين
import "../../components/shared/AdminContentPage/AdminContentPage.css";
import "./settings.css";

function AdminSettings() {
  const { t, i18n } = useTranslation("adminDashboard");
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
    saveSetting,
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
  const [heroPreviewLang, setHeroPreviewLang] = useState("en");
  const [localGeneralSettings, setLocalGeneralSettings] = useState({
    site_name: "",
    contact_email: "",
    whatsapp: "",
    facebook_url: "",
    maintenance_mode: "false",
    hero_title_en: "",
    hero_title_ar: "",
    hero_title_highlight_en: "",
    hero_title_highlight_ar: "",
    hero_subtitle_en: "",
    hero_subtitle_ar: "",
  });

  // مزامنة البيانات المحلية عند اكتمال جلب الإعدادات من الهوك
  useEffect(() => {
    if (hookGeneralSettings) {
      setLocalGeneralSettings({ ...hookGeneralSettings });
    }
  }, [hookGeneralSettings]);

  // حفظ الإعدادات العامة في قاعدة البيانات دفعة واحدة بالتوازي
  const handleSaveGeneral = async () => {
    setIsEditingGeneral(false);
    const success = await saveGeneralSettings(localGeneralSettings);
    if (!success && hookGeneralSettings) {
      setLocalGeneralSettings({ ...hookGeneralSettings });
    }
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

    const path =
      typeof item === "string"
        ? item
        : item.image_url || item.url || item.path || item.value || "";

    if (!path) return "";

    // لو URL كامل
    if (
      path.startsWith("http://") ||
      path.startsWith("https://") ||
      path.startsWith("data:") ||
      path.startsWith("blob:")
    ) {
      return path;
    }

    let apiURL = import.meta.env.VITE_API_URL || "";

    // شيل /api من آخر الرابط لو موجودة
    apiURL = apiURL.replace(/\/api\/?$/, "");

    const cleanBase = apiURL.endsWith("/") ? apiURL.slice(0, -1) : apiURL;

    const cleanPath = path.startsWith("/") ? path : `/${path}`;

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
          : "Sorry, the image size exceeds the maximum limit of 3MB!",
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
  // معالجة رفع صور "من نحن" (About Media) - وضع الاستبدال (Replace) دائماً ومباشرة
  const handleAboutChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // فحص حجم الملفات بحد أقصى 3 ميجابايت لكل صورة
    const oversizedFile = files.find((file) => file.size > 3 * 1024 * 1024);
    if (oversizedFile) {
      toastError(
        isArabic
          ? `عذراً، الصورة "${oversizedFile.name}" تتجاوز الحد الأقصى المسموح به وهو 3 ميجابايت!`
          : `Sorry, the image "${oversizedFile.name}" exceeds the maximum limit of 3MB!`,
      );
      if (aboutInputRef.current) aboutInputRef.current.value = "";
      return;
    }
    if (aboutImages.length === 0 && files.length < 3) {
      toastError(
        isArabic
          ? "غير مسموح برفع أقل من 3 صور يجب أن يحتوي المعرض على 3 صور على الأقل!"
          : "Not allowed to upload less than 3 images the gallery must contain at least 3 images!",
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
            : "You have already reached the limit of 3 images for the About section!",
        );
        return;
      }

      const remainingSlots = 3 - currentCount;
      if (files.length > remainingSlots) {
        toastError(
          isArabic
            ? `لا يمكنك إضافة سوى ${remainingSlots} صورة إضافية لتجنب تجاوز الحد الأقصى.`
            : `You can only add up to ${remainingSlots} more images to stay within the limit.`,
        );
        return;
      }
    } else {
      // وضع الاستبدال (Replace) لقسم الأبوت ميديا
      if (files.length !== 3) {
        toastError(
          isArabic
            ? "غير مسموح برفع الا 3 صور يجب أن يحتوي امعرض على 3 صور!"
            : "Not allowed to upload other than 3 images the gallery must contain 3 images!",
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

    // تمرير القيمة "replace" مباشرةً هنا في المعامل الثالث للدالة
    const success = await uploadMedia(files, "about_media", "replace");
    if (success && aboutInputRef.current) {
      aboutInputRef.current.value = "";
    }
  };

  // معالجة رفع صور \"الديسكافري\" (Discovery Media) بمفتاح discovery_media المعتمد في الباك إند
  const handleDiscoveryChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (discoveryMedia.length === 0 && files.length < 5) {
      toastError(
        isArabic
          ? "غير مسموح برفع أقل من 5 صور يجب أن يحتوي المعرض على 5 صور على الأقل!"
          : "Not allowed to upload less than 5 images the gallery must contain at least 5 images!",
      );
      if (discoveryInputRef.current) discoveryInputRef.current.value = "";
      return;
    }

    if (files.length < 5 && discoveryAction === "replace")
      return toastError(
        isArabic
          ? "ادخل علي الاقل خمس صور لتتمكن من تبديلهم"
          : "Uplad at least 5 images to replace",
      );

    // فحص حجم الملفات بحد أقصى 3 ميجابايت لكل صورة
    const oversizedFile = files.find((file) => file.size > 3 * 1024 * 1024);
    if (oversizedFile) {
      toastError(
        isArabic
          ? `عذراً، الصورة "${oversizedFile.name}" تتجاوز الحد الأقصى المسموح به وهو 3 ميجابايت!`
          : `Sorry, the image "${oversizedFile.name}" exceeds the maximum limit of 3MB!`,
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
            : "You have reached the maximum limit of 30 images for the gallery!",
        );
        return;
      }
      const remainingSlots = 30 - currentCount;
      if (files.length > remainingSlots) {
        toastError(
          isArabic
            ? `لا يمكنك إضافة سوى ${remainingSlots} صورة إضافية فقط لتجنب تجاوز الحد الأقصى (30).`
            : `You can only add up to ${remainingSlots} more images to stay within the limit (30).`,
        );
        return;
      }
    } else {
      // في حالة الاستبدال الكامل (Replace) لـ 30 صورة
      if (files.length > 30) {
        toastError(
          isArabic
            ? "الحد الأقصى للرفع هو 30 صورة في وضع الاستبدال!"
            : "Maximum limit to upload is 30 images in replace mode!",
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

    const success = await uploadMedia(
      files,
      "discovery_media",
      discoveryAction,
    );
    if (success && discoveryInputRef.current) {
      discoveryInputRef.current.value = "";
    }
  };

  // إلغاء التعديلات والتراجع عن التغييرات المحلية وإعادتها لقيم السيرفر الأصلية
  const handleCancelGeneral = () => {
    setIsEditingGeneral(false);
    if (hookGeneralSettings) {
      setLocalGeneralSettings({ ...hookGeneralSettings });
    }
  };

  // تهيئة دوال حفظ وإلغاء تعديل نصوص الهيرو بشكل منفصل عن الإعدادات العامة
  const handleSaveHero = async () => {
    const success = await saveGeneralSettings(localGeneralSettings);
    if (!success && hookGeneralSettings) {
      setLocalGeneralSettings({ ...hookGeneralSettings });
    }
  };

  const handleCancelHero = () => {
    if (hookGeneralSettings)
      setLocalGeneralSettings({ ...hookGeneralSettings });
  };

  // تهيئة الصور لشبكة ألبوم الصور التفاعلي (Lightbox)
  const discoveryPhotos = Array.isArray(discoveryMedia)
    ? discoveryMedia.map((url) => ({ src: getImgSrc(url) }))
    : [];

  return (
    <div
      className="admin-content-page admin-settings-page"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ── رأس الصفحة ── */}
      <div className="ac-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="ac-title">
            {isArabic ? "إعدادات المنصة" : "Platform Settings"}
          </h2>
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
          <p className="mt-2 text-muted fw-semibold">
            {isArabic ? "جاري تحميل البيانات..." : "Loading content..."}
          </p>
        </div>
      )}

      {(!loading || uploading) && (
        <>
          {/* ────────────────────────────────────────────────────────────────
              0. قسم الإعدادات العامة (General Settings Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="general-settings-card shadow-sm">
            <div className="general-settings-header d-flex justify-content-between align-items-center">
              <span className="fw-bold">
                {isArabic
                  ? "الإعدادات العامة (General Settings)"
                  : "General Settings"}
              </span>

              <div className="d-flex gap-2">
                {isEditingGeneral ? (
                  <>
                    {/* زر التراجع (Undo / Cancel) */}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary px-3 py-1 rounded-3 fw-bold"
                      onClick={handleCancelGeneral}
                    >
                      <i className="bi bi-arrow-counterclockwise me-1"></i>
                      {isArabic ? "تراجع" : "Undo"}
                    </button>

                    {/* زر حفظ التغييرات (Save) */}
                    <button
                      type="button"
                      className="btn btn-sm btn-danger px-3 py-1 rounded-3 fw-bold"
                      onClick={handleSaveGeneral}
                    >
                      <i className="bi bi-check-lg me-1"></i>
                      {isArabic ? "حفظ التغييرات" : "Save Changes"}
                    </button>
                  </>
                ) : (
                  /* زر التعديل الافتراضي في حالة العرض فقط */
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger px-3 py-1 rounded-3 fw-bold"
                    onClick={() => setIsEditingGeneral(true)}
                  >
                    <i className="bi bi-pencil me-1"></i>
                    {isArabic ? "تعديل" : "Edit"}
                  </button>
                )}
              </div>
            </div>

            <div className="general-settings-body">
              {/* Platform Name */}
              <div className="general-settings-row">
                <span className="general-settings-label">
                  {isArabic ? "Platform Name" : "Platform Name"}
                </span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.site_name}
                    onChange={(e) =>
                      setLocalGeneralSettings({
                        ...localGeneralSettings,
                        site_name: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="general-settings-value text-secondary">
                    {localGeneralSettings.site_name}
                  </span>
                )}
              </div>

              {/* Support Email */}
              <div className="general-settings-row">
                <span className="general-settings-label">
                  {isArabic ? "Support Email" : "Support Email"}
                </span>
                {isEditingGeneral ? (
                  <input
                    type="email"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.contact_email}
                    onChange={(e) =>
                      setLocalGeneralSettings({
                        ...localGeneralSettings,
                        contact_email: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="general-settings-value text-secondary">
                    {localGeneralSettings.contact_email}
                  </span>
                )}
              </div>

              {/* Support Whatsapp */}
              <div className="general-settings-row">
                <span className="general-settings-label">
                  {isArabic ? "Support Whatsapp" : "Support Whatsapp"}
                </span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.whatsapp}
                    onChange={(e) =>
                      setLocalGeneralSettings({
                        ...localGeneralSettings,
                        whatsapp: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="general-settings-value text-secondary">
                    {localGeneralSettings.whatsapp}
                  </span>
                )}
              </div>

              {/* Facebook URL */}
              <div className="general-settings-row">
                <span className="general-settings-label">
                  {isArabic ? "Facebook URL" : "Facebook URL"}
                </span>
                {isEditingGeneral ? (
                  <input
                    type="text"
                    className="form-control form-control-sm w-50"
                    value={localGeneralSettings.facebook_url}
                    onChange={(e) =>
                      setLocalGeneralSettings({
                        ...localGeneralSettings,
                        facebook_url: e.target.value,
                      })
                    }
                  />
                ) : (
                  <span className="general-settings-value text-secondary">
                    {localGeneralSettings.facebook_url}
                  </span>
                )}
              </div>

              {/* Maintenance Mode */}
              <div className="general-settings-row d-flex justify-content-between align-items-center py-3 border-bottom">
                <div className="d-flex flex-column">
                  <span className="general-settings-label fw-bold mb-1">
                    {isArabic
                      ? "وضع الصيانة (Maintenance Mode)"
                      : "Maintenance Mode"}
                  </span>
                  <span className="text-muted small">
                    {isArabic
                      ? "عند التفعيل، سيتم حجب المنصة عن جميع الطلاب والمعلمين وتوجيههم لصفحة الصيانة."
                      : "When enabled, the platform will be hidden from students and teachers."}
                  </span>
                </div>

                <div className="form-check form-switch fs-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    id="maintenanceModeToggle"
                    style={{ cursor: "pointer" }}
                    checked={localGeneralSettings.maintenance_mode === "true"}
                    disabled={uploading || loading}
                    onChange={async (e) => {
                      const nextStatus = e.target.checked;

                      // 1. إظهار نافذة التأكيد المخصصة التفاعلية المعتمدة عندك في الكود
                      const confirmed = await showConfirmCustom({
                        title: isArabic
                          ? "تغيير حالة المنصة"
                          : "Change Platform Status",
                        message: nextStatus
                          ? isArabic
                            ? "هل أنت متأكد من تفعيل وضع الصيانة؟ هذا سيؤدي إلى حجب المنصة عن الطلاب فوراً."
                            : "Are you sure you want to enable maintenance mode? This will block students immediately."
                          : isArabic
                            ? "هل أنت متأكد من إيقاف وضع الصيانة وإتاحة المنصة للجميع؟"
                            : "Are you sure you want to disable maintenance mode and make the platform public?",
                        icon: "warning",
                        variant: nextStatus ? "danger" : "success",
                      });

                      if (!confirmed) return;

                      // 2. تحديث الحالة محلياً فوراً لتغيير شكل الزرار (Optimistic UI)
                      setLocalGeneralSettings((prev) => ({
                        ...prev,
                        maintenance_mode: String(nextStatus),
                      }));

                      // 3. حفظ مفتاح الصيانة فقط (لا نلمس باقي الحقول حتى لا تُمسح بالخطأ)
                      const success = await saveSetting(
                        "maintenance_mode",
                        String(nextStatus),
                      );

                      // 4. في حالة الفشل نرتد للحالة القديمة
                      if (!success) {
                        setLocalGeneralSettings((prev) => ({
                          ...prev,
                          maintenance_mode: String(!nextStatus),
                        }));
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              1. سكشن الهيرو (Hero Section)
              ──────────────────────────────────────────────────────────────── */}

          <div className="settings-card hero-unified-card">
            {/* Card Header */}
            <div className="settings-section-title">
              <i className="bi bi-display text-danger fs-4"></i>
              <span>
                {isArabic
                  ? "محتوى وصورة الهيرو الرئيسية (Hero Section)"
                  : "Hero Section Content & Background"}
              </span>
            </div>
            <div className="settings-title-divider"></div>

            <div className="row g-4 align-items-stretch">
              {/* ── Left: Live Preview (real header look) ── */}
              <div className="col-lg-7 d-flex flex-column">
                <div
                  className={`hero-live-stage${heroImage ? "" : " no-image"}`}
                  style={
                    heroImage
                      ? { backgroundImage: `url(${getImgSrc(heroImage)})` }
                      : undefined
                  }
                >
                  {/* readability overlay */}
                  <div className="hero-live-overlay"></div>

                  {/* top toolbar: live badge + lang toggle + compact uploader */}
                  <div className="hero-live-toolbar">
                    <div className="hero-mock-live-badge">
                      <span className="live-dot"></span>
                      {isArabic ? "معاينة مباشرة" : "Live Preview"}
                    </div>

                    <div className="hero-live-tools">
                      <div className="hero-mock-lang-toggle">
                        <button
                          type="button"
                          className={`hero-mock-lang-btn${heroPreviewLang === "en" ? " active" : ""}`}
                          onClick={() => setHeroPreviewLang("en")}
                        >
                          EN
                        </button>
                        <button
                          type="button"
                          className={`hero-mock-lang-btn${heroPreviewLang === "ar" ? " active" : ""}`}
                          onClick={() => setHeroPreviewLang("ar")}
                        >
                          AR
                        </button>
                      </div>

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
                        className="hero-compact-upload"
                        title={isArabic ? "تغيير الخلفية" : "Change background"}
                        style={{
                          cursor: uploading ? "not-allowed" : "pointer",
                        }}
                      >
                        <i className="bi bi-camera-fill"></i>
                      </label>
                    </div>
                  </div>

                  {/* overlaid hero text */}
                  <div
                    className="hero-live-content"
                    dir={heroPreviewLang === "ar" ? "rtl" : "ltr"}
                  >
                    <h2 className="hero-live-title">
                      {localGeneralSettings[
                        `hero_title_${heroPreviewLang}`
                      ] || (
                        <span className="hero-live-placeholder">
                          {heroPreviewLang === "ar"
                            ? "عنوان الهيرو"
                            : "Hero Title"}
                        </span>
                      )}{" "}
                      {localGeneralSettings[
                        `hero_title_highlight_${heroPreviewLang}`
                      ] && (
                        <span className="hero-live-highlight">
                          {
                            localGeneralSettings[
                              `hero_title_highlight_${heroPreviewLang}`
                            ]
                          }
                        </span>
                      )}
                    </h2>
                    <p className="hero-live-subtitle">
                      {localGeneralSettings[
                        `hero_subtitle_${heroPreviewLang}`
                      ] || (
                        <span className="hero-live-placeholder">
                          {heroPreviewLang === "ar"
                            ? "النص الوصفي للهيرو يظهر هنا"
                            : "Hero subtitle text appears here"}
                        </span>
                      )}
                    </p>
                    {/* Multi-language CTA buttons block dynamically translated */}
                    <div className="hero-live-cta d-flex gap-2">
                      <span className="btn btn-danger btn-sm px-3 rounded-pill fw-bold">
                        {t("hero_live_cta.contact_us")}
                      </span>
                      <span className="btn btn-outline-light btn-sm px-3 rounded-pill fw-bold">
                        {t("hero_live_cta.explore_courses")}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="hero-upload-hint">
                  <i className="bi bi-info-circle me-1"></i>
                  {isArabic
                    ? "اضغط على أيقونة الكاميرا لتغيير صورة الخلفية (PNG / JPG / WEBP — بحد أقصى 3 ميجابايت)"
                    : "Click the camera icon to change the background image (PNG / JPG / WEBP — max 3MB)"}
                </p>
              </div>

              {/* ── Right: Text fields (EN + AR) ── */}
              <div className="col-lg-5 d-flex flex-column">
                <div className="hero-fields-wrapper flex-grow-1">
                  {/* English */}
                  <div className="hero-lang-section lang-en">
                    <div className="hero-lang-section-title">
                      <i className="bi bi-translate"></i>
                      English Content
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <label className="hero-field-label">
                          {isArabic ? "العنوان الرئيسي" : "Main Title"}
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm hero-text-input"
                          placeholder="e.g. Discover Your Learning"
                          value={localGeneralSettings.hero_title_en}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_title_en: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="hero-field-label">
                          {isArabic ? "النص المميز" : "Highlighted Text"}
                          <span className="hero-highlight-badge">
                            {isArabic ? "ملون" : "Colored"}
                          </span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm hero-text-input hero-highlight-input"
                          placeholder="e.g. Potential"
                          value={localGeneralSettings.hero_title_highlight_en}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_title_highlight_en: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="hero-field-label">
                          {isArabic ? "النص الوصفي" : "Subtitle"}
                        </label>
                        <textarea
                          rows={2}
                          className="form-control form-control-sm hero-text-input"
                          placeholder="Short description under the title..."
                          value={localGeneralSettings.hero_subtitle_en}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_subtitle_en: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Arabic */}
                  <div className="hero-lang-section lang-ar" dir="rtl">
                    <div className="hero-lang-section-title">
                      <i className="bi bi-translate"></i>
                      المحتوى العربي
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div>
                        <label className="hero-field-label">
                          العنوان الرئيسي
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm hero-text-input"
                          placeholder="مثال: اكتشف إمكاناتك"
                          value={localGeneralSettings.hero_title_ar}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_title_ar: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="hero-field-label">
                          النص المميز
                          <span className="hero-highlight-badge">ملون</span>
                        </label>
                        <input
                          type="text"
                          className="form-control form-control-sm hero-text-input hero-highlight-input"
                          placeholder="مثال: التعليمية"
                          value={localGeneralSettings.hero_title_highlight_ar}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_title_highlight_ar: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className="hero-field-label">النص الوصفي</label>
                        <textarea
                          rows={2}
                          className="form-control form-control-sm hero-text-input"
                          placeholder="وصف قصير يظهر تحت العنوان..."
                          value={localGeneralSettings.hero_subtitle_ar}
                          onChange={(e) =>
                            setLocalGeneralSettings({
                              ...localGeneralSettings,
                              hero_subtitle_ar: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Unified footer actions ── */}
            <div className="hero-card-footer">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary px-3 rounded-3 fw-bold"
                onClick={handleCancelHero}
                disabled={uploading}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>
                {isArabic ? "تراجع" : "Reset"}
              </button>
              <button
                type="button"
                className="btn btn-sm btn-danger px-4 rounded-3 fw-bold"
                onClick={handleSaveHero}
                disabled={uploading}
              >
                <i className="bi bi-check-lg me-1"></i>
                {isArabic ? "حفظ التغييرات" : "Save Changes"}
              </button>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────────────
              2. سكشن أبوت ميديا (About Media Section)
              ──────────────────────────────────────────────────────────────── */}
          <div className="settings-card">
            <div className="settings-section-title d-flex justify-content-between align-items-center w-100">
              <div className="d-flex gap-2">
                <i className="bi bi-building text-danger fs-4"></i>
                <span>
                  {isArabic
                    ? "صور قسم عن المنصة (About Section)"
                    : "About Section Media"}
                </span>
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
                  <div className="fw-bold text-dark mb-1">
                    {isArabic
                      ? "طريقة رفع صور قسم عن الشركة:"
                      : "Upload action pattern:"}
                  </div>
                  <div className="text-muted small">
                    {isArabic
                      ? "الاستبدال يعيد بناء القسم بالكامل."
                      : "Replace overrides the whole section."}
                  </div>
                </div>
                <div className="col-md-6 d-flex justify-content-md-end">
                  <div className="action-radio-group">
                    {/* <label className="action-radio-label">
                      <input
                        type="radio"
                        name="aboutAction"
                        value="append"
                        checked={aboutAction === "append"}
                        onChange={() => setAboutAction("append")}
                      />
                      <span>{isArabic ? "إضافة وإلحاق (Append)" : "Append & Add"}</span>
                    </label> */}
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="aboutAction"
                        value="replace"
                        checked={aboutAction === "replace"}
                        onChange={() => setAboutAction("replace")}
                      />
                      <span>
                        {isArabic ? "مسح واستبدال (Replace)" : "Replace All"}
                      </span>
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
                  <span>
                    {isArabic
                      ? "لم يتم رفع أي صور حتى الآن"
                      : "No images uploaded yet"}
                  </span>
                </div>
              ) : (
                <div className="about-images-grid">
                  {aboutImages.map((imgUrl, index) => (
                    <div key={index} className="about-image-item">
                      <img
                        src={getImgSrc(imgUrl)}
                        alt={`About ${index + 1}`}
                        loading="lazy"
                      />
                      {/* طبقة الأوفرلاي التفاعلية لتكبير الصورة أو حذفها مباشرة */}
                      <div className="about-image-overlay d-flex justify-content-center align-items-center gap-3">
                        <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: "44px",
                            height: "44px",
                            transition: "transform 0.2s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLightboxSlides(
                              aboutImages.map((img) => ({
                                src: getImgSrc(img),
                              })),
                            );
                            setLightboxIndex(index);
                          }}
                          title={isArabic ? "عرض كبر" : "Zoom View"}
                        >
                          <i className="bi bi-eye-fill text-dark fs-5"></i>
                        </button>
                        {/* <button
                          type="button"
                          className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                          style={{
                            width: "44px",
                            height: "44px",
                            transition: "transform 0.2s ease",
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteMedia(
                              imgUrl,
                              "about_media",
                              isArabic
                                ? `الصورة رقم ${index + 1}`
                                : `Image #${index + 1}`,
                            );
                          }}
                          title={isArabic ? "حذف الصورة" : "Delete Image"}
                        >
                          <i className="bi bi-trash-fill text-danger fs-5"></i>
                        </button> */}
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
                <label
                  htmlFor="aboutUploadInput"
                  className="btn btn-outline-danger px-4 py-2.5 rounded-3 fw-bold d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-plus-lg"></i>
                  {isArabic ? "صور الاستبدال" : "Replacement Images"}
                </label>
                <span className="text-muted small ms-2 pe-none">
                  (
                  {isArabic
                    ? "الحد الأقصى 3 ميجابايت لكل صورة"
                    : "Max size 3MB per image"}
                  )
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
                <span>
                  {isArabic
                    ? "معرض الصور والألبوم (Discovery Gallery)"
                    : "Discovery Gallery Album"}
                </span>
              </div>
              <span
                className={`capacity-badge ${discoveryMedia.length >= 30 ? "danger" : discoveryMedia.length >= 25 ? "warning" : ""}`}
              >
                {discoveryMedia.length} / 30 {isArabic ? "صورة" : "Photos"}
              </span>
            </div>
            <div className="settings-title-divider"></div>

            {/* كارت خيارات وطريقة الرفع للألبوم - الافتراضي هو ريبليس */}
            <div className="action-selector-card shadow-sm mb-4">
              <div className="row align-items-center g-3">
                <div className="col-md-6">
                  <div className="fw-bold text-dark mb-1">
                    {isArabic
                      ? "طريقة رفع الصور المعرض:"
                      : "Upload action pattern:"}
                  </div>
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
                      <span>
                        {isArabic ? "إضافة وإلحاق (Append)" : "Append & Add"}
                      </span>
                    </label>
                    <label className="action-radio-label">
                      <input
                        type="radio"
                        name="discoveryAction"
                        value="replace"
                        checked={discoveryAction === "replace"}
                        onChange={() => setDiscoveryAction("replace")}
                      />
                      <span>
                        {isArabic ? "مسح واستبدال (Replace)" : "Replace All"}
                      </span>
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

              {!discoveryMedia ||
              !Array.isArray(discoveryMedia) ||
              discoveryMedia.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3 text-muted">
                  <i className="bi bi-images fs-1 mb-2 d-block"></i>
                  <span>
                    {isArabic
                      ? "الألبوم فارغ تماماً حالياً!"
                      : "The album is currently empty!"}
                  </span>
                </div>
              ) : (
                <div className="about-images-grid">
                  {Array.isArray(discoveryMedia) &&
                    discoveryMedia.map((url, index) => {
                      // فحص إضافي: إذا كان الـ url القادم عبارة عن كائن بالخطأ وليس نصاً، نقوم بتجاوزه
                      if (typeof url !== "string") return null;

                      return (
                        <div key={index} className="about-image-item">
                          <img
                            src={getImgSrc(url)}
                            alt={`Discovery ${index + 1}`}
                            loading="lazy"
                          />
                          {/* طبقة الأوفرلاي التفاعلية لتكبير الصورة أو حذفها مباشرة كما هي دون تغيير */}
                          <div className="about-image-overlay d-flex justify-content-center align-items-center gap-3">
                            <button
                              type="button"
                              className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center p-0"
                              style={{
                                width: "44px",
                                height: "44px",
                                transition: "transform 0.2s ease",
                              }}
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
                              style={{
                                width: "44px",
                                height: "44px",
                                transition: "transform 0.2s ease",
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMedia(
                                  url,
                                  "discovery_media",
                                  isArabic
                                    ? `صورة المعرض رقم ${index + 1}`
                                    : `Gallery photo #${index + 1}`,
                                );
                              }}
                              title={isArabic ? "حذف الصورة" : "Delete Image"}
                            >
                              <i className="bi bi-trash-fill text-danger fs-5"></i>
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                  (
                  {isArabic
                    ? "الحد الأقصى 3 ميجابايت لكل صورة"
                    : "Max size 3MB per image"}
                  )
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

      {/* ── شريط تحميل شفاف يغطي الشاشة أثناء رفع الملفات ── */}
      {uploading && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            backdropFilter: "blur(4px)",
            transition: "all 0.3s ease",
          }}
        >
          <div
            className="bg-white p-4 rounded-4 shadow-lg text-center d-flex flex-column align-items-center"
            style={{ minWidth: "280px" }}
          >
            <div
              className="spinner-border text-danger mb-3"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="fw-bold text-dark mb-1">
              {isArabic ? "جاري رفع الملفات..." : "Uploading files..."}
            </h5>
            <p className="text-muted small mb-0">
              {isArabic
                ? "يرجى عدم إغلاق أو تحديث الصفحة"
                : "Please do not close or refresh the page"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
