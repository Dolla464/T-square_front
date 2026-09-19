import { useEffect, useState } from "react";
import {
  getNameInitials,
  shouldShowAvatarInitials,
} from "../../../utils/avatar";

function ProfileAvatar({
  name = "",
  avatarUrl = null,
  size = 38,
  className = "",
  style,
  fallbackInitials = "US",
  imgClassName = "",
  onImageError,
}) {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const initials = getNameInitials(name, fallbackInitials);
  const showInitials = shouldShowAvatarInitials(avatarUrl, imageError);
  const fontSize = size <= 35 ? "0.75rem" : size <= 55 ? "0.85rem" : "1rem";

  const handleImageError = () => {
    setImageError(true);
    onImageError?.();
  };

  return (
    <div
      className={`rounded-circle d-flex align-items-center justify-content-center fw-bold overflow-hidden flex-shrink-0 ${className}`.trim()}
      style={{
        width: size,
        height: size,
        fontSize,
        background: showInitials ? "#be1522" : "transparent",
        color: "#fff",
        ...style,
      }}
      aria-label={name || undefined}
    >
      {!showInitials ? (
        <img
          src={avatarUrl}
          alt={name || "avatar"}
          className={`w-100 h-100 ${imgClassName}`.trim()}
          style={{ objectFit: "cover" }}
          onError={handleImageError}
        />
      ) : (
        initials
      )}
    </div>
  );
}

export default ProfileAvatar;
