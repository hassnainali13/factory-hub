import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../api/axiosInstance";
import useUserProfile from "../../hooks/useUserProfile";
import { toast } from "react-toastify";

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

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "",
    });

    setProfileImage(user.profileImage || null);
  }, [user]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

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

  const handleSave = useCallback(async () => {
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
  }, [form, updateProfileImage]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profile", file);

    try {
      setUploading(true);

      const res = await axiosInstance.put("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImage = res.data.user.profileImage + "?t=" + Date.now();

      setProfileImage(newImage);
      updateProfileImage(newImage);

      toast.success("Profile image updated ✅");
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

  const InputCard = ({ label, children }) => (
    <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <label className="text-sm text-gray-500">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6">

    

      {/* MAIN CARD */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-xl p-6">

        {/* AVATAR SECTION */}
        <div className="flex flex-col items-center mb-8">

          <div className="relative w-[130px] h-[130px]">

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
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "+"
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

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* NAME */}
          <InputCard label="Full Name">
            {editMode ? (
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-2 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="font-semibold">{form.name}</p>
            )}
          </InputCard>

          {/* EMAIL */}
          <InputCard label="Email">
            {editMode ? (
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-2 rounded-xl bg-gray-50 border focus:ring-2 focus:ring-blue-400"
              />
            ) : (
              <p className="font-semibold">{form.email}</p>
            )}
          </InputCard>

          {/* ROLE */}
          <div className="md:col-span-2">
            <InputCard label="Role">
              <p className="font-semibold text-gray-700">{form.role}</p>
            </InputCard>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end mt-6">

          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-3 bg-gray-100 rounded-xl hover:bg-gray-200 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;