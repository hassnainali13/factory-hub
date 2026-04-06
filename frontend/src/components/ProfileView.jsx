// src/components/ProfileView.jsx
import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProfileImage from "./ProfileImage";
import useUserProfile from "../hooks/useUserProfile";
import { toast } from "react-toastify";

const ProfileView = () => {
  const { user, userName, userEmail, role, updateProfileImage } =
    useUserProfile();

  const [profileImage, setProfileImage] = useState(
    "/images/default-profile.png",
  );
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user?.profileImage) setProfileImage(user.profileImage);
  }, [user]);

  const handleImageChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("profile", file); // ✅ MUST MATCH BACKEND

  try {
    setUploading(true);

    const res = await axiosInstance.put("/users/me", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // ✅ Cloudinary URL directly use karo
    const newImage = res.data.user.profileImage + "?t=" + Date.now();

    setProfileImage(newImage);
    updateProfileImage(newImage);

  } catch (err) {
    console.error("Error uploading image:", err);
  } finally {
    setUploading(false);
  }
};

  if (!user) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-3xl shadow-2xl">
      <div className="flex flex-col items-center">
        <div className="relative w-[140px] h-[140px] mb-4">
          <ProfileImage
            src={profileImage}
            initials={userName?.charAt(0).toUpperCase() || "U"}
            size={140}
          />
          <label
            htmlFor="profile-upload"
            className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition transform hover:scale-110"
            title="Change Profile Image"
          >
            {uploading ? (
              <svg
                className="w-5 h-5 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
          </label>
          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={uploading}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-1">{userName}</h2>
        <p className="text-sm text-gray-500 mb-4">{role}</p>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <span className="font-medium text-gray-700">Email</span>
            <span className="text-gray-900 font-semibold">{userEmail}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition">
            <span className="font-medium text-gray-700">Role</span>
            <span className="text-gray-900 font-semibold">{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
