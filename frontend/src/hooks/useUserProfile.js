// frontend/src/hooks/useUserProfile.js
import { useState, useEffect } from "react";
import useAuth from "./useAuth";
import axiosInstance from "../api/axiosInstance";

export default function useUserProfile() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(authUser || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axiosInstance.get("/users/me");
        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [authUser]);

  const updateProfileImage = (newImageUrl) => {
    setUser((prev) => ({ ...prev, profileImage: newImageUrl }));
  };

  const userName = user?.name || "Manager";
  const userEmail = user?.email || "email@example.com";
  const role = user?.role || "User Role";
  const userInitial = userName?.trim()?.charAt(0).toUpperCase() || "M";

  return { user, loading, userName, userEmail, role, userInitial, updateProfileImage };
}