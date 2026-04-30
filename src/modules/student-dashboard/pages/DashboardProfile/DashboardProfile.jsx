import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  toastSuccess,
  toastError,
} from "../../../../components/shared/Toaster/toaster";
import "./DashboardProfile.css";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import {
  getStudentProfile,
  updateStudentProfile,
  updateStudentPassword,
} from "../../services/dashboardService";

/**
 * صفحة الملف الشخصي والإعدادات
 * بيانات المستخدم تأتي من AuthContext
 * الحقول القابلة للتعديل: ستُربط بـ API
 */
function DashboardProfile() {
  const { t, i18n } = useTranslation("studentDashboard");
  const { user, updateUser } = useAuth();
  const isArabic = i18n.language === "ar";
  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+20 10 1234 5678");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [gender, setGender] = useState(user?.gender || "");
  const [isInfoUpdated, setIsInfoUpdated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await getStudentProfile();
        const profile =
          res?.data?.data?.data || res?.data?.data || res?.data || {};

        setFullName(profile.name ?? user?.name ?? "");
        setEmail(profile.email ?? user?.email ?? "");
        setPhone(profile.phone ?? user?.phone ?? "+20 10 1234 5678");
        setGender(profile.gender ?? user?.gender ?? "");
      } catch (err) {
        setProfileError(err);
      } finally {
        setProfileLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  // إعدادات الإشعارات
  const [prefs, setPrefs] = useState({
    newLessons: true,
    certEarned: true,
    weeklyReminders: false,
    promoEmails: false,
  });

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "ST";

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!currentPwd || !newPwd || !confirmPwd) {
      toastError(
        isArabic
          ? "الرجاء تعبئة جميع حقول كلمة المرور"
          : "Please fill in all password fields",
      );
      return;
    }

    if (newPwd !== confirmPwd) {
      toastError(
        isArabic
          ? "كلمة المرور الجديدة غير مطابقة"
          : "New passwords do not match",
      );
      return;
    }

    setPwdLoading(true);

    try {
      await updateStudentPassword({
        current_password: currentPwd,
        password: newPwd,
        password_confirmation: confirmPwd,
      });

      toastSuccess(
        isArabic
          ? "تم تحديث كلمة المرور بنجاح"
          : "Password updated successfully",
      );
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          (isArabic
            ? "حدث خطأ أثناء تحديث كلمة المرور"
            : "Unable to update password"),
      );
    } finally {
      setPwdLoading(false);
    }
  };

  const handleSavePrefs = () => {
    // TODO: ربط بـ API
    toastSuccess(isArabic ? "تم حفظ التفضيلات" : "Preferences saved");
  };

  const togglePref = (key) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setIsInfoUpdated(true);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsInfoUpdated(true);
  };

  const handleUpdateInformation = async () => {
    const ok = await showConfirmCustom({
      title: isArabic ? "تحديث البيانات" : "Update Information",
      message: isArabic ? "هل أنت متأكد؟" : "Are you sure?",
      icon: "question",
      variant: "danger",
    });

    if (!ok) {
      return;
    }

    setSaveLoading(true);

    try {
      await updateStudentProfile({
        name: fullName,
        gender,
      });

      toastSuccess(
        isArabic
          ? "تم تحديث المعلومات بنجاح"
          : "Information updated successfully",
      );
      setIsInfoUpdated(false);

      if (updateUser) {
        updateUser({
          ...user,
          name: fullName,
          gender,
        });
      }
    } catch (error) {
      toastError(
        error?.response?.data?.message ||
          (isArabic
            ? "حدث خطأ أثناء تحديث المعلومات"
            : "Unable to update information"),
      );
    } finally {
      setSaveLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="dash-profile">
        {isArabic ? "جارٍ تحميل الملف الشخصي..." : "Loading profile..."}
      </div>
    );
  }

  return (
    <div className="dash-profile">
      <h4 className="dash-page-title d-md-none d-block">
        {t("profile_page.title")}
      </h4>

      {profileError && (
        <div className="profile-error text-danger mb-4">
          {isArabic
            ? "حدث خطأ أثناء تحميل بيانات الملف الشخصي"
            : "Failed to load profile data."}
        </div>
      )}

      <div className="profile-grid">
        {/* ── العمود الأيسر ── */}
        <div className="profile-left-col">
          {/* المعلومات الشخصية */}
          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.personal_info")}
            </h6>
            {/* صورة + اسم */}
            <div className="profile-head-row">
              <div className="profile-avatar">{initials}</div>
              <div>
                <div className="profile-name">{user?.name}</div>
                <div className="profile-email-sub">{user?.email}</div>
              </div>
              <button className="btn-edit-photo">
                {t("profile_page.edit_photo")}
              </button>
            </div>

            {/* الحقول */}
            <div className="profile-fields">
              <div className="profile-field">
                <label>{t("profile_page.full_name")}</label>
                <input
                  value={fullName}
                  onChange={handleInputChange(setFullName)}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.email_address")}</label>
                <input
                  value={email}
                  readOnly
                  className="profile-input profile-input-readonly"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.phone_number")}</label>
                <input
                  value={phone}
                  readOnly
                  className="profile-input profile-input-readonly"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.gender")}</label>
                <select
                  className={`form-control profile-input  ${!gender ? "" : "profile-input profile-input-readonly"}`}
                  value={gender || ""}
                  onChange={handleGenderChange}
                  readOnly
                  disabled={gender}
                >
                  <option value="">{t("profile_page.select_gender")}</option>
                  <option value="male">{t("profile_page.male")}</option>
                  <option value="female">{t("profile_page.female")}</option>
                </select>
              </div>
              {isInfoUpdated && (
                <div className="profile-field-actions">
                  <button
                    className="btn-update-pwd"
                    onClick={handleUpdateInformation}
                    disabled={saveLoading}
                  >
                    {saveLoading
                      ? isArabic
                        ? "جاري الحفظ..."
                        : "Saving..."
                      : t("profile_page.update_data")}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* تغيير كلمة المرور */}
          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.change_password")}
            </h6>
            <form onSubmit={handlePasswordUpdate} className="profile-fields">
              <div className="profile-field">
                <label>{t("profile_page.current_password")}</label>
                <input
                  type="password"
                  value={currentPwd}
                  onChange={(e) => setCurrentPwd(e.target.value)}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.new_password")}</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.confirm_new_password")}</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  className="profile-input"
                />
              </div>
              <div className="profile-field-actions">
                <button
                  type="submit"
                  className="btn-update-pwd"
                  disabled={pwdLoading}
                >
                  {pwdLoading
                    ? isArabic
                      ? "جاري التحديث..."
                      : "Updating..."
                    : t("profile_page.update_password")}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* ── العمود الأيمن ── */}
        <div className="profile-right-col">
          {/* إعدادات الحساب */}
          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.account_settings")}
            </h6>
            <div className="profile-field">
              <label>{t("profile_page.language")}</label>
              <select
                className="profile-input"
                value={i18n.language}
                onChange={(e) => {
                  i18n.changeLanguage(e.target.value);
                  localStorage.setItem("i18nextLng", e.target.value);
                  document.documentElement.dir =
                    e.target.value === "ar" ? "rtl" : "ltr";
                  document.documentElement.lang = e.target.value;
                }}
              >
                <option value="en">English (US)</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>

          {/* تفضيلات الإشعارات */}
          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.notification_prefs")}
            </h6>
            <div className="notif-list">
              {[
                { key: "newLessons", label: t("profile_page.new_lessons") },
                { key: "certEarned", label: t("profile_page.cert_earned") },
                {
                  key: "weeklyReminders",
                  label: t("profile_page.weekly_reminders"),
                },
                { key: "promoEmails", label: t("profile_page.promo_emails") },
              ].map(({ key, label }) => (
                <div key={key} className="notif-row">
                  <span className="notif-label">{label}</span>
                  <button
                    className={`toggle-btn ${prefs[key] ? "toggle-on" : ""}`}
                    onClick={() => togglePref(key)}
                    aria-pressed={prefs[key]}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              ))}
            </div>
            <button className="btn-save-prefs" onClick={handleSavePrefs}>
              {t("profile_page.save_preferences")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardProfile;
