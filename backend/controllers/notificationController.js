const Notification = require("../models/Notification");
const User = require("../models/User");

// Create notification (flexible for all types)
const createNotification = async (type, title, message, options = {}) => {
  const {
    workspaceId,
    workspaceName,
    workspaceLogo,
    departmentId,
    departmentName,
    userId,
    userName,
    userRole,
    recipients = [],
    isSystem = false,
  } = options;

  const notification = new Notification({
    type,
    title,
    message,
    workspaceId,
    workspaceName,
    workspaceLogo,
    departmentId,
    departmentName,
    userId,
    userName,
    userRole,
    recipients,
    isSystem,
  });

  await notification.save();

  const { getIo } = require("../socket");
  const io = getIo();
  if (io) {
    if (isSystem) {
      io.to("superadmin_system").emit("notification", notification);
    } else {
      if (workspaceId) {
        io.to(`workspace_${workspaceId}_general_manager`).emit(
          "notification",
          notification,
        );
        io.to(`workspace_${workspaceId}_industry_head`).emit(
          "notification",
          notification,
        );
      }
      if (departmentId) {
        io.to(`workspace_${workspaceId}_department_${departmentId}_head`).emit(
          "notification",
          notification,
        );
        io.to(`workspace_${workspaceId}_department_${departmentId}_staff`).emit(
          "notification",
          notification,
        );
      }
      recipients.forEach((recipientId) => {
        io.to(`user_${recipientId}`).emit("notification", notification);
      });
    }
  }

  return notification;
};

// Get notifications for current user
const getNotifications = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "superadmin") {
      query = { isSystem: true };
    } else {
      const user = await User.findById(req.userId).lean();
      if (!user) return res.status(404).json({ message: "User not found" });

      const orConditions = [{ recipients: user._id }, { userId: user._id }];

      if (user.workspaceId) {
        orConditions.push({ workspaceId: user.workspaceId });
      }
      if (user.departmentId) {
        orConditions.push({ departmentId: user.departmentId });
      }

      query = {
        isSystem: false,
        $or: orConditions,
      };
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = notifications.length;
    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notification fetch error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mark as read
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.json({ message: "Marked as read" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createNotification, getNotifications, markAsRead };
