import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../../contexts/AuthContext";
import {
  toastSuccess,
  toastError,
} from "../../../../components/shared/Toaster/toaster";
import "../../../student-dashboard/pages/DashboardProfile/DashboardProfile.css";
import { showConfirmCustom } from "../../../../components/shared/ConfirmDialog/confirmDialog";
import {
  getInstructorProfile,
  updateInstructorProfile,
  updateInstructorPassword,
} from "../../services/instructorProfileService";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProfilePasswordField from "../../../../components/shared/ProfilePasswordField/ProfilePasswordField";

function InstructorProfile() {
  const { t, i18n } = useTranslation("adminDashboard");
  const { user, updateUser } = useAuth();
  const isArabic = i18n.language === "ar";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [field, setField] = useState("");
  const [bio, setBio] = useState("");
  const [instaUrl, setInstaUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [isInfoUpdated, setIsInfoUpdated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const markUpdated = () => setIsInfoUpdated(true);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await getInstructorProfile();
        const profileData = res?.data?.data || res?.data;

        if (profileData) {
          const instructor = profileData.instructor || {};
          setFullName(instructor.full_name || profileData.name || "");
          setEmail(profileData.email || "");
          setPhone(instructor.phone || "");
          setGender(instructor.gender === "not_set" ? "" : instructor.gender || "");
          setField(instructor.field || "");
          setBio(instructor.bio || "");
          setInstaUrl(instructor.insta_url || "");
          setLinkedinUrl(instructor.linkedin_url || "");
          setFacebookUrl(instructor.facebook_url || "");

          if (updateUser) {
            updateUser(profileData);
          }
        }
      } catch (err) {
        console.error("Failed to load instructor profile:", err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("avatar", file);

    setSaveLoading(true);
    try {
      const res = await updateInstructorProfile(formData);
      const updatedData = res?.data?.data || res?.data;

      setImageError(false);
      toastSuccess(
        isArabic ? "تم تحديث الصورة بنجاح" : "Photo updated successfully",
      );

      if (updateUser && updatedData) {
        updateUser(updatedData);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      toastError(isArabic ? "فشل رفع الصورة" : "Failed to upload photo");
    } finally {
      setSaveLoading(false);
      e.target.value = "";
    }
  };

  const initials =
    typeof fullName === "string" && fullName.trim()
      ? fullName
          .split(" ")
          .filter(Boolean)
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      : "IN";

  const avatarUrl = user?.instructor?.avatar;
  const hasAvatar =
    avatarUrl && !avatarUrl.includes("default-instructor.png") && !imageError;

  const handleUpdateInformation = async () => {
    if (phone && phone.replace(/\D/g, "").length < 10) {
      toastError(
        isArabic
          ? "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"
          : "Phone number must be at least 10 digits",
      );
      return;
    }

    const ok = await showConfirmCustom({
      title: isArabic ? "تحديث البيانات" : "Update Information",
      message: isArabic ? "هل أنت متأكد؟" : "Are you sure?",
      icon: "question",
      variant: "danger",
    });

    if (!ok) return;

    setSaveLoading(true);
    try {
      const res = await updateInstructorProfile({
        name: fullName,
        full_name: fullName,
        gender,
        phone,
        field,
        bio,
        insta_url: instaUrl,
        linkedin_url: linkedinUrl,
        facebook_url: facebookUrl,
      });
      const updatedData = res?.data?.data || res?.data;
      toastSuccess(isArabic ? "تم التحديث بنجاح" : "Updated successfully");
      setIsInfoUpdated(false);
      if (updateUser) updateUser(updatedData);
    } catch (error) {
      toastError(error?.response?.data?.message || "Error");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPwdLoading(true);
    try {
      await updateInstructorPassword({
        current_password: currentPwd,
        password: newPwd,
        password_confirmation: confirmPwd,
      });
      toastSuccess(isArabic ? "تم تغيير كلمة المرور" : "Password updated");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
    } catch (error) {
      toastError(error?.response?.data?.message || "Error");
    } finally {
      setPwdLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="dash-profile p-5 text-center">
        {isArabic ? "جاري التحميل..." : "Loading..."}
      </div>
    );
  }

  return (
    <div className="dash-profile">
      <input
        type="file"
        id="avatar-upload"
        className="d-none"
        accept="image/*"
        onChange={handleFileChange}
      />

      <div className="profile-grid">
        <div className="profile-left-col">
          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.personal_info")}
            </h6>
            <div className="profile-head-row">
              <div
                className="profile-avatar position-relative overflow-hidden"
                style={{
                  cursor: hasAvatar ? "pointer" : "default",
                }}
                onClick={() => {
                  if (hasAvatar) {
                    setLightboxSlides([{ src: avatarUrl }]);
                    setLightboxIndex(0);
                  }
                }}
              >
                {saveLoading && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(255,255,255,0.7)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 2,
                    }}
                  >
                    <div className="spinner-border spinner-border-sm text-danger"></div>
                  </div>
                )}

                {hasAvatar ? (
                  <>
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      onError={() => setImageError(true)}
                    />
                    <div
                      className="position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        backgroundColor: "rgba(190, 21, 34, 0.85)",
                        opacity: 0,
                        transition: "opacity 0.3s ease",
                        zIndex: 3,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
                    >
                      <i
                        className="bi bi-eye-fill text-white"
                        style={{ fontSize: "1.1rem" }}
                      ></i>
                    </div>
                  </>
                ) : (
                  <span className="avatar-initials">{initials}</span>
                )}
              </div>
              <div>
                <div className="profile-name">
                  {user?.instructor?.full_name || user?.name}
                </div>
                <div className="profile-email-sub">{user?.email}</div>
              </div>
              <button
                className="btn-edit-photo"
                onClick={() => document.getElementById("avatar-upload").click()}
                disabled={saveLoading}
              >
                {t("profile_page.edit_photo")}
              </button>
            </div>

            <div className="profile-fields">
              <div className="profile-field">
                <label>{t("profile_page.full_name")}</label>
                <input
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    markUpdated();
                  }}
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
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.gender")}</label>
                <select
                  className="profile-input"
                  value={gender || ""}
                  onChange={(e) => {
                    setGender(e.target.value);
                    markUpdated();
                  }}
                >
                  <option value="">{t("profile_page.select_gender")}</option>
                  <option value="male">{t("profile_page.male")}</option>
                  <option value="female">{t("profile_page.female")}</option>
                </select>
              </div>
              <div className="profile-field">
                <label>{t("profile_page.field")}</label>
                <input
                  value={field}
                  onChange={(e) => {
                    setField(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.bio")}</label>
                <textarea
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                  rows={4}
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.insta_url")}</label>
                <input
                  type="url"
                  value={instaUrl}
                  onChange={(e) => {
                    setInstaUrl(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.linkedin_url")}</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => {
                    setLinkedinUrl(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.facebook_url")}</label>
                <input
                  type="url"
                  value={facebookUrl}
                  onChange={(e) => {
                    setFacebookUrl(e.target.value);
                    markUpdated();
                  }}
                  className="profile-input"
                  placeholder="https://facebook.com/..."
                />
              </div>
              {isInfoUpdated && (
                <div className="profile-field-actions">
                  <button
                    className="btn-update-pwd"
                    onClick={handleUpdateInformation}
                    disabled={saveLoading}
                  >
                    {saveLoading ? "..." : t("profile_page.update_data")}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="profile-card">
            <h6 className="profile-card-title">
              {t("profile_page.change_password")}
            </h6>
            <form onSubmit={handlePasswordUpdate} className="profile-fields">
              <ProfilePasswordField
                label={t("profile_page.current_password")}
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
              />
              <ProfilePasswordField
                label={t("profile_page.new_password")}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
              />
              <ProfilePasswordField
                label={t("profile_page.confirm_new_password")}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
              <div className="profile-field-actions">
                <button
                  type="submit"
                  className="btn-update-pwd"
                  disabled={pwdLoading}
                >
                  {pwdLoading ? "..." : t("profile_page.update_password")}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="profile-right-col">
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
                  const lang = e.target.value;
                  i18n.changeLanguage(lang);
                  localStorage.setItem("i18nextLng", lang);
                  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
                }}
              >
                <option value="en">English (US)</option>
                <option value="ar">العربية</option>
              </select>
            </div>
          </div>
        </div>
      </div>

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

export default InstructorProfile;
