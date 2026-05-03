import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";
import React from "react";
import "./Instructors.css";
import { Link } from "react-router-dom";

export default function AddInstructor() {
  const { t, i18n } = useTranslation("Instructors");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="add-container" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="header">
        <Link to="/admin/instructors" className="text-dark fw-bold fs-5">
          {isArabic ? "→" : "←"} {t("addInstructorTitle")}
        </Link>
        <button className="create-btn">{t("createInstructor")}</button>
      </div>

      {/* Form */}
      <form className="form-box">
        <div className="form-group">
          <label>{t("fullName")}</label>
          <input 
            type="text"
            name="full_name"
            placeholder={t("enterFullName")}
          />
        </div>
        

        <div className="form-group">
          <label>{t("phone")}</label>
          <input type="text" name="phone" placeholder={t("enterPhone")} />
        </div>

        <div className="form-group">
          <label>{t("avatar")}</label>
          <input type="file" name="avatar" />
        </div>

        <div className="form-group">
          <label>{t("field")}</label>
          <input type="text" name="field" placeholder={t("enterField")} />
        </div>

        <div className="form-group">
          <label>{t("bio")}</label>
          <textarea name="bio" placeholder={t("enterBio")}></textarea>
        </div>

        <div className="row">
          <div className="form-group">
            <label>{t("gender")}</label>
            <select name="gender">
              <option value="">{t("selectGender")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("status")}</label>
            <select name="status">
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t("instagram")}</label>
          <input
            type="text"
            name="insta_url"
            placeholder={t("enterInstagram")}
          />
        </div>

        <div className="form-group">
          <label>{t("linkedin")}</label>
          <input
            type="text"
            name="linkedin_url"
            placeholder={t("enterLinkedin")}
          />
        </div>

        <div className="form-group">
          <label>{t("facebook")}</label>
          <input
            type="text"
            name="facebook_url"
            placeholder={t("enterFacebook")}
          />
        </div>

        {/* Submit */}
        <div className="submit-wrap">
          <button type="submit" className="submit-btn">
            + {t("addInstructor")}
          </button>
        </div>
      </form>
    </div>
  );
}
