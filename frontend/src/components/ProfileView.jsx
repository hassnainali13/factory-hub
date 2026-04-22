import React, { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import ProfileImage from "./ProfileImage";
import useUserProfile from "../hooks/useUserProfile";
import ImageCropper from "./ImageCropper";
import { getCroppedImg } from "../utils/cropImage";
import {  Edit2 } from "lucide-react";


const ProfileView = () => {
  const { user, userName, userEmail, role, updateProfileImage } =
    useUserProfile();

  const [profileImage, setProfileImage] = useState(
    "/images/default-profile.png"
  );
  const [uploading, setUploading] = useState(false);

  // crop states
  const [selectedImage, setSelectedImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  useEffect(() => {
    if (user?.profileImage) setProfileImage(user.profileImage);
  }, [user]);

  // 👉 STEP 1: user selects image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setSelectedImage(imageUrl);
    setShowCrop(true);
  };

  // 👉 STEP 2: crop and upload
  const handleCropDone = async (croppedAreaPixels) => {
    try {
      const croppedBlob = await getCroppedImg(
        selectedImage,
        croppedAreaPixels
      );

      const formData = new FormData();
      formData.append("profile", croppedBlob);

      setUploading(true);

      const res = await axiosInstance.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImage = res.data.user.profileImage + "?t=" + Date.now();

      setProfileImage(newImage);
      updateProfileImage(newImage);

      setShowCrop(false);
    } catch (err) {
      console.error("Crop Upload Error:", err);
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
            className="absolute bottom-0 right-0 flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-full cursor-pointer"
          >
            {uploading ? "..." : <Edit2 size={16} />}
          </label>

          <input
            id="profile-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </div>

        <h2 className="text-xl font-bold">{userName}</h2>
        <p className="text-sm text-gray-500 mb-4">{role}</p>

        <div className="w-full space-y-3">
          <div className="flex justify-between p-3 bg-white rounded-xl">
            <span>Email</span>
            <span>{userEmail}</span>
          </div>
          <div className="flex justify-between p-3 bg-white rounded-xl">
            <span>Role</span>
            <span>{role}</span>
          </div>
        </div>
      </div>

      {/* 👉 Crop Modal */}
      {showCrop && (
        <ImageCropper
          image={selectedImage}
          onCropDone={handleCropDone}
          onCancel={() => setShowCrop(false)}
        />
      )}
    </div>
  );
};

export default ProfileView;