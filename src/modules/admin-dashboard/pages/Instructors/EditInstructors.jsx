import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import "./Instructors.css";
import { Link } from "react-router-dom";

export default function EditInstructors() {
  const { t, i18n } = useTranslation("Instructors");
  const isArabic = i18n?.language === "ar";

  const [formData, setFormData] = useState({
    full_name: "Ahmed Hatem",
    phone: "010000000000",
    field: "Full Stack",
    bio: "Lorem ipsum, dolor sit amet consectetur adipisicing elit...",
    gender: "male",
    status: "active",
    insta_url: "https://www.instagram.com",
    linkedin_url: "https://www.linkedin.com",
    facebook_url: "https://www.facebook.com",
    avatar: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);
  };

  return (
    <div className="add-container" dir={isArabic ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="header">
        <Link to="/admin/instructors" className="text-dark fw-bold fs-5">
          {isArabic ? "→" : "←"} {t("editinstructors")}
        </Link>
        <button className="create-btn" onClick={handleSubmit}>
          {t("updateInstructor")}
        </button>
      </div>

      {/* Form */}
      <form className="form-box" onSubmit={handleSubmit}>
        <div className="m-auto text-center my-3">
          <img src="/site-media/about1.webp" alt="" />
        </div>

        <div className="form-group">
          <label>{t("fullName")}</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder={t("enterFullName")}
          />
        </div>

        <div className="form-group">
          <label>{t("phone")}</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t("enterPhone")}
          />
        </div>

        <div className="form-group">
          <label>{t("avatar")}</label>
          <input type="file" name="avatar" onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>{t("field")}</label>
          <input
            type="text"
            name="field"
            value={formData.field}
            onChange={handleChange}
            placeholder={t("enterField")}
          />
        </div>

        <div className="form-group">
          <label>{t("bio")}</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder={t("enterBio")}
          ></textarea>
        </div>

        <div className="row">
          <div className="form-group">
            <label>{t("gender")}</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              <option value="">{t("selectGender")}</option>
              <option value="male">{t("male")}</option>
              <option value="female">{t("female")}</option>
            </select>
          </div>

          <div className="form-group">
            <label>{t("status")}</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
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
            value={formData.insta_url}
            onChange={handleChange}
            placeholder={t("enterInstagram")}
          />
        </div>

        <div className="form-group">
          <label>{t("linkedin")}</label>
          <input
            type="text"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            placeholder={t("enterLinkedin")}
          />
        </div>

        <div className="form-group">
          <label>{t("facebook")}</label>
          <input
            type="text"
            name="facebook_url"
            value={formData.facebook_url}
            onChange={handleChange}
            placeholder={t("enterFacebook")}
          />
        </div>

        {/* Submit */}
        <div className="submit-wrap">
          <button type="submit" className="submit-btn">
            {t("updateInstructor")}
          </button>
        </div>
      </form>
    </div>
  );
}
