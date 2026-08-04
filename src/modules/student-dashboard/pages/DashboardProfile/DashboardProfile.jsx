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
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import ProfilePasswordField from "../../../../components/shared/ProfilePasswordField/ProfilePasswordField";
import {
  getNameInitials,
  getProfileAvatarUrl,
  getProfileDisplayName,
  isDefaultAvatarUrl,
} from "../../../../utils/avatar";
import { getApiErrorMessage } from "../../../../utils/apiErrors";

function DashboardProfile() {
  const { t, i18n } = useTranslation("studentDashboard");
  const { user, userProfile, updateUser } = useAuth();
  const isArabic = i18n.language === "ar";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [qualification, setQualification] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [isInfoUpdated, setIsInfoUpdated] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // States for Lightbox functionality
  const [lightboxSlides, setLightboxSlides] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await getStudentProfile();
        const profileData = res?.data?.data || res?.data;

        if (profileData) {
          setFullName(profileData.student?.full_name || profileData.name || "");
          setEmail(profileData.email || "");
          setPhone(profileData.student?.phone || "");
          setGender(profileData.student?.gender || "");
          setAge(
            profileData.student?.age !== null &&
              profileData.student?.age !== undefined
              ? String(profileData.student.age)
              : "",
          );
          setQualification(profileData.student?.qualification || "");
          setGuardianPhone(profileData.student?.guardian_phone || "");
          setNationalId(profileData.student?.national_id || "");
          setAddress(profileData.student?.address || "");
          setNotes(profileData.student?.notes || "");

          if (updateUser) {
            updateUser(profileData);
          }
        }
      } catch (err) {
        setProfileError(err);
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

    // بناء الـ FormData يدوياً لضمان الـ Binary
    const formData = new FormData();
    formData.append("avatar", file);

    setSaveLoading(true);
    try {
      // نرجع نستخدم الـ Service اللي معاه الـ Interceptors والـ Token جاهز
      const res = await updateStudentProfile(formData);
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
      toastError(
        getApiErrorMessage(
          error,
          isArabic ? "فشل رفع الصورة" : "Failed to upload photo",
        ),
      );
    } finally {
      setSaveLoading(false);
      e.target.value = "";
    }
  };

  const initials = getNameInitials(fullName || getProfileDisplayName(user, userProfile), "ST");
  const avatarUrl = getProfileAvatarUrl(user, userProfile);
  const hasAvatar = Boolean(avatarUrl) && !isDefaultAvatarUrl(avatarUrl) && !imageError;
  const displayName = getProfileDisplayName(user, userProfile) || fullName;

  const handleUpdateInformation = async () => {
    if (phone && phone.replace(/\D/g, "").length < 10) {
      toastError(
        isArabic
          ? "رقم الهاتف يجب أن يكون 10 أرقام على الأقل"
          : "Phone number must be at least 10 digits",
      );
      return;
    }

    if (age !== "") {
      const ageValue = Number(age);
      if (!Number.isInteger(ageValue) || ageValue < 1 || ageValue > 120) {
        toastError(
          isArabic
            ? "السن يجب أن يكون رقماً بين 1 و 120"
            : "Age must be a number between 1 and 120",
        );
        return;
      }
    }

    if (nationalId) {
      const normalizedNationalId = String(nationalId).replace(/\D/g, "");
      if (normalizedNationalId.length !== 14) {
        toastError(
          isArabic
            ? "الرقم القومي يجب أن يكون 14 رقمًا"
            : "National ID must be exactly 14 digits",
        );
        return;
      }
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
      const res = await updateStudentProfile({
        gender,
        phone,
        age: age === "" ? "" : Number(age),
        qualification,
        guardian_phone: guardianPhone,
        national_id: nationalId ? String(nationalId).replace(/\D/g, "") : "",
        address,
        notes,
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
      await updateStudentPassword({
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

  // console.log("Full User Object:", user);
  // console.log("Is Verified Type:", typeof user?.is_verified);
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

                {/* 
    المنطق الجديد: 
    لو مفيش avatar أو لو الصورة حاولت تحمل وفشلت (imageError)، اعرض الـ initials 
  */}
                {hasAvatar ? (
                  <>
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      onError={() => setImageError(true)} // لو الصورة مكسورة، اقلب على الـ initials
                    />
                    {/* Hover Overlay */}
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
                      <i className="bi bi-eye-fill text-danger" style={{ fontSize: "1.1rem" }}></i>
                    </div>
                  </>
                ) : (
                  <span className="avatar-initials">{initials}</span>
                )}
              </div>
              <div>
                <div className="profile-name">
                  {displayName || user?.name}
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
                  readOnly
                  className="profile-input profile-input-readonly"
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
                    setIsInfoUpdated(true);
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
                    setIsInfoUpdated(true);
                  }}
                >
                  <option value="">{t("profile_page.select_gender")}</option>
                  <option value="male">{t("profile_page.male")}</option>
                  <option value="female">{t("profile_page.female")}</option>
                </select>
              </div>
              <div className="profile-field">
                <label>{t("profile_page.age")}</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.age_placeholder")}
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.qualification")}</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => {
                    setQualification(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.qualification_placeholder")}
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.guardian_phone")}</label>
                <input
                  type="tel"
                  value={guardianPhone}
                  onChange={(e) => {
                    setGuardianPhone(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.guardian_phone_placeholder")}
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.national_id")}</label>
                <input
                  type="text"
                  maxLength={14}
                  inputMode="numeric"
                  value={nationalId}
                  onChange={(e) => {
                    setNationalId(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.national_id_placeholder")}
                />
                <small className="text-muted d-block mt-1">
                  {t("profile_page.national_id_hint")}
                </small>
              </div>
              <div className="profile-field">
                <label>{t("profile_page.address")}</label>
                <textarea
                  rows="2"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.address_placeholder")}
                />
              </div>
              <div className="profile-field">
                <label>{t("profile_page.notes")}</label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setIsInfoUpdated(true);
                  }}
                  className="profile-input"
                  placeholder={t("profile_page.notes_placeholder")}
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

export default DashboardProfile;
