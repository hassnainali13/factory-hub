// frontend/src/components/ProfileImage.jsx
import React, { useState, useEffect } from "react";

const ProfileImage = ({ src, size = 150, initials }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [error, setError] = useState(false);

  // Update imgSrc if src prop changes (e.g., after upload)
  useEffect(() => {
    setImgSrc(src);
    setError(false);
  }, [src]);

  return imgSrc && !error ? (
    <img
      src={imgSrc}
      alt="Profile"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        border: "2px solid #ccc",
      }}
      onError={() => {
        setError(true);
      }}
    />
  ) : (
    // Show initials fallback if no image yet
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: "#8b5cf6", // violet
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: size / 2.5,
        border: "2px solid #ccc",
      }}
    >
      {initials || "U"}
    </div>
  );
};

export default ProfileImage;