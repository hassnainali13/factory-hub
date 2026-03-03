const mongoose = require("mongoose");

const departmentJoinRequestSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);

// 1 user cannot request same dept multiple times
departmentJoinRequestSchema.index({ departmentId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("DepartmentJoinRequest", departmentJoinRequestSchema);