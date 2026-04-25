import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import useUserProfile from "../../hooks/useUserProfile";
import { toast } from "react-toastify";
import { Edit2, User, Mail, Briefcase } from "lucide-react";

// NEW IMPORTS (crop feature)
import ImageCropper from "../../components/ImageCropper";
import { getCroppedImg } from "../../utils/cropImage";

// =======================
// INPUT COMPONENT (FIXED)
// =======================
const InputField = ({
  label,
  name,
  value,
  icon: Icon,
  type = "text",
  readOnly = false,
  editMode,
  handleChange,
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
      {label}
    </label>

    <div
      className={`relative flex items-center rounded-xl border transition-all duration-200 ${
        editMode && !readOnly
          ? "bg-white border-blue-300 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400"
          : "bg-gray-50 border-gray-200"
      }`}
    >
      {Icon && (
        <div className="pl-3.5 pr-2 text-gray-400">
          <Icon size={16} />
        </div>
      )}

      {editMode && !readOnly ? (
        <input
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          autoComplete="off"
          spellCheck={false}
          className="flex-1 py-3 pr-4 text-sm font-medium text-gray-800 bg-transparent outline-none placeholder-gray-300"
          placeholder={`Enter ${label.toLowerCase()}`}
        />
      ) : (
        <span className="flex-1 py-3 pr-4 text-sm font-semibold text-gray-700 select-text">
          {value || <span className="text-gray-400 font-normal">—</span>}
        </span>
      )}
    </div>
  </div>
);

// =======================
// MAIN COMPONENT
// =======================
const ProfileSettings = () => {
  const { user, updateProfileImage } = useUserProfile();

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [showCrop, setShowCrop] = useState(false);

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });

    setProfileImage(user.profileImage || null);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = useCallback(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });

    setProfileImage(user.profileImage || null);
    setEditMode(false);
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);

      const res = await axiosInstance.put("/users/me", {
        name: form.name,
        email: form.email,
        role: form.role,
      });

      toast.success("Profile updated successfully ✅");
      setEditMode(false);

      if (res.data.user?.profileImage) {
        updateProfileImage(res.data.user.profileImage);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCrop(true);
  };

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

      toast.success("Profile image updated ✅");
      setShowCrop(false);
    } catch (err) {
      console.error(err);
      toast.error("Image upload failed ❌");
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-10 text-gray-500">
        Loading profile settings...
      </div>
    );
  }

  const avatarLetter = form.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6">
      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl p-5 sm:p-6">

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-[120px] h-[120px] sm:w-[130px] sm:h-[130px]">
            {profileImage ? (
              <img
                src={profileImage}
                alt="profile"
                className="w-full h-full rounded-full object-cover border-4 border-blue-100 shadow-lg"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-purple-700 flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                {avatarLetter}
              </div>
            )}

            <label
              htmlFor="profile-upload"
              className="absolute bottom-1 right-1 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full cursor-pointer shadow-md hover:bg-blue-700 transition"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Edit2 size={16} />
              )}
            </label>

            <input
              id="profile-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Click + to update profile image
          </p>
        </div>

        {/* FIELDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <InputField
            label="Full Name"
            name="name"
            value={form.name}
            icon={User}
            editMode={editMode}
            handleChange={handleChange}
          />

          <InputField
            label="Email"
            name="email"
            value={form.email}
            icon={Mail}
            type="email"
            handleChange={handleChange}
          />

          <div className="sm:col-span-2">
            <InputField
              label="Role"
              name="role"
              value={form.role}
              icon={Briefcase}
              readOnly={true}
              editMode={editMode}
              handleChange={handleChange}
            />
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end mt-6">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition text-sm sm:text-base"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition text-sm sm:text-base"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50 text-sm sm:text-base"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CROPPER */}
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

export default ProfileSettings;