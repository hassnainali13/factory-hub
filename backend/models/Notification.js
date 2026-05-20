const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'new_workspace_request', 'absent_alert', 'welcome'
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // For specific users
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Workspace",
    required: false,
  },
  workspaceName: { type: String, default: "" },
  workspaceLogo: { type: String, default: "" },
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department",
    required: false,
  },
  departmentName: { type: String, default: "" },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  }, // Triggering user
  userName: { type: String }, // User name for display
  userRole: { type: String }, // User role for display
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
  isSystem: { type: Boolean, default: false }, // True for superadmin system notifications
});

module.exports = mongoose.model("Notification", notificationSchema);
