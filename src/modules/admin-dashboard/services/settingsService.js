import axiosClient from "../../../api/axios";

// ----------------------------------------------------------------------------
// جلب صور الديسكافري ميديا (Discovery Media) مع التغليف والـ Data Unpacking
// ----------------------------------------------------------------------------
export const getDiscoveryMedia = () =>
  axiosClient
    .get("/admin/discovery-media")
    .then((res) => res.data?.data?.images || []);

// ----------------------------------------------------------------------------
// جلب بيانات الميديا بناءً على المفتاح (Key) مثل hero_image أو about_media
// ----------------------------------------------------------------------------
export const getWebsiteMedia = (key) =>
  axiosClient.get(`/website-media/${key}`).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب قيمة إعداد عام (Setting) بأي نوع (نص/منطقي) مثل site_name أو maintenance_mode
// يعتمد على راوت الإعدادات العام الذي يرجع القيمة بالنوع الصحيح من قاعدة البيانات
// ----------------------------------------------------------------------------
export const getSetting = (key) =>
  axiosClient.get(`/settings/${key}`).then((res) => res.data);

// ----------------------------------------------------------------------------
// جلب حالة وضع الصيانة من راوت الأدمن المخصص (مستثنى دائماً من حجب الصيانة)
// لذا يعطي المصدر الأكثر موثوقية لحالة التوغل حتى أثناء تفعيل الصيانة نفسها
// ----------------------------------------------------------------------------
export const getMaintenanceStatus = () =>
  axiosClient
    .get("/admin/settings/maintenance-status")
    .then((res) => res.data?.data?.is_maintenance_on ?? false);

// ----------------------------------------------------------------------------
// رفع صور جديدة للموقع متوافقة مع إرسال Multipart Form Data
// ----------------------------------------------------------------------------
export const uploadWebsiteMedia = (formData) =>
  axiosClient.post("/admin/website-media/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }).then((res) => res.data);

// ----------------------------------------------------------------------------
// حذف صورة معينة من الموقع باستخدام الـ query params
// ----------------------------------------------------------------------------
export const deleteWebsiteMedia = (imageUrl, key) =>
  axiosClient.delete("/admin/website-media/delete", {
    params: {
      image_url: imageUrl,
      key: key,
    },
  }).then((res) => res.data);

// ----------------------------------------------------------------------------
// تحديث إعدادات النص أو القيمة العامة في قاعدة البيانات (معلق مؤقتاً حتى صدور الـ API)
// ----------------------------------------------------------------------------
export const updateSetting = (key, value) =>
  axiosClient.post("/admin/settings", { key, value }).then((res) => res.data);
