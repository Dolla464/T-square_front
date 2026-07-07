import { useState } from "react";

function ProfilePasswordField({ label, value, onChange }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="profile-field">
      <label>{label}</label>
      <div className="profile-password-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="profile-input profile-input-password"
        />
        <button
          type="button"
          className="profile-password-toggle"
          onClick={() => setVisible((prev) => !prev)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <i
            className={`bi ${visible ? "bi-eye-slash-fill" : "bi-eye-fill"} fs-5`}
          ></i>
        </button>
      </div>
    </div>
  );
}

export default ProfilePasswordField;
