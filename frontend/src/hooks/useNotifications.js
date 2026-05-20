import { useState, useEffect } from "react";
import io from "socket.io-client";

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(API_BASE, {
      auth: { token },
    });

    socket.on("notification", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    // Fetch initial notifications
    fetchNotifications();

    return () => socket.disconnect();
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return { notifications, unreadCount, markAsRead, fetchNotifications };
};

export default useNotifications;
