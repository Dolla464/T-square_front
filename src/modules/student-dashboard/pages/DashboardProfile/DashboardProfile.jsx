import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import { toastSuccess } from "../../../../components/shared/Toaster/toaster";
import "./DashboardProfile.css";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";

/**
 * صفحة الملف الشخصي والإعدادات
 * بيانات المستخدم تأتي من AuthContext
 * الحقول القابلة للتعديل: ستُربط بـ API لاحقاً
 */
function DashboardProfile() {
  const { t, i18n } = useTranslation("studentDashboard");
  const { user } = useAuth();
  const isArabic = i18n.language === "ar";
  const [fullName, setFullName] = useState(user?.name || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "+20 10 1234 5678");
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [gender, setGender] = useState(user?.gender || "");
  const [isUpdated, setIsUpdated] = useState(false);
  const [isInfoUpdated, setIsInfoUpdated] = useState(false);

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

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    // TODO: ربط بـ API (updateStudentPassword)
    toastSuccess(
      i18n.language === "ar"
        ? "تم تحديث كلمة المرور"
        : "Password updated successfully",
    );
    setCurrentPwd("");
    setNewPwd("");
    setConfirmPwd("");
  };

  const handleSavePrefs = () => {
    // TODO: ربط بـ API
    toastSuccess(isArabic ? "تم حفظ التفضيلات" : "Preferences saved");
  };

  const togglePref = (key) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    setIsUpdated(true);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setIsInfoUpdated(true);
  };

  const handleUpdateInformation = async () => {
    // Confirm dialog before updating

    const ok = await showConfirmCustom({
      title: isArabic ? "تحديث البيانات" : "Update Information",
      message: isArabic ? "هل أنت متأكد؟" : "Are you sure?",
      icon: "question",
      variant: "danger",
    });
    if (ok) {
      // TODO: ربط بـ API لتحديث البيانات
      toastSuccess(
        isArabic
          ? "تم تحديث المعلومات بنجاح"
          : "Information updated successfully",
      );
      setIsInfoUpdated(false);
    }
  };

  return (
    <div className="dash-profile">
      <h4 className="dash-page-title d-md-none d-block">
        {t("profile_page.title")}
      </h4>

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
                  onChange={handleInputChange(setPhone)}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.gender")}</label>
                <select
                  className="form-control"
                  value={gender}
                  onChange={handleInputChange(setGender)}
                >
                  <option value="">{t("profile_page.select_gender")}</option>
                  <option value="male">{t("profile_page.male")}</option>
                  <option value="female">{t("profile_page.female")}</option>
                </select>
              </div>
              {isInfoUpdated && (
                <div className="profile-field-actions">
                  <button
                    className=" btn-update-pwd"
                    onClick={handleUpdateInformation}
                  >
                    {t("profile_page.update_data")}
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
                <button type="submit" className="btn-update-pwd">
                  {t("profile_page.update_password")}
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
