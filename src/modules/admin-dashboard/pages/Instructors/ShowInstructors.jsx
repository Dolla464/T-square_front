import ComingSoon from "../../components/ComingSoon/ComingSoon";
import { useTranslation } from "react-i18next";
import React from "react";
import "./Instructors.css";
import { Link } from "react-router-dom";

export default function ShowInstructors() {
  const { t, i18n } = useTranslation("Instructors");
  const isArabic = i18n?.language === "ar";

  return (
    <div className="add-container" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="header">
        <Link to="/admin/instructors" className="text-dark fw-bold fs-5">
          {isArabic ? "→" : "←"} {t("viewinstructors")}
        </Link>
      </div>

      {/* Form */}
      <form className="form-box">
        <div className="m-auto text-center my-3">
          <img src="/site-media/about1.webp" alt="" />
        </div>

        <div className="form-group">
          <label>{t("fullName")}</label>
          <input disabled type="text" name="full_name" value={"Ahmed Hatem"} />
        </div>

        <div className="form-group">
          <label>{t("phone")}</label>
          <input disabled type="text" name="phone" value={"010000000000"} />
        </div>

        <div className="form-group">
          <label>{t("field")}</label>
          <input disabled type="text" name="field" value={"Full Stack"} />
        </div>

        <div className="form-group">
          <label>{t("bio")}</label>
          <textarea
            disabled
            name="bio"
            value={
              "Lorem ipsum, dolor sit amet consectetur adipisicing elit. Cupiditate quia aut aliquam enim incidunt accusantium voluptas. Velit eaque, amet modi ipsum odit repudiandae deleniti quibusdam dicta nulla in rerum inventore beatae perferendis dolores blanditiis laborum."
            }
          ></textarea>
        </div>

        <div className="row">
          <div className="form-group">
            <label>{t("gender")}</label>
            <select disabled value={"male"} name="gender">
              <option value="">{t("selectGender")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("status")}</label>
            <select disabled value={"active"} name="status">
              <option value="active">{t("active")}</option>
              <option value="inactive">{t("inactive")}</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>{t("instagram")}</label>
          <input
            disabled
            type="text"
            name="insta_url"
            value={"https://www.instagram.com"}
          />
        </div>

        <div className="form-group">
          <label>{t("linkedin")}</label>
          <input
            disabled
            type="text"
            name="linkedin_url"
            value={"https://www.linkedin.com"}
          />
        </div>

        <div className="form-group">
          <label>{t("facebook")}</label>
          <input
            disabled
            type="text"
            name="facebook_url"
            value={"https://www.facebook.com"}
          />
        </div>
      </form>
    </div>
  );
}
