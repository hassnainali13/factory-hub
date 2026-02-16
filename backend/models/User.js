//backend\models\User.js

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // By default user
    role: {
      type: String,
      enum: ["user", "general_manager", "department_head", "staff"],
      default: "user",
    },

    workspaceId: {          // Workspace join / create
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    departmentId: {         // Department join / approve
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    requestStatus: {        // Department request status
      type: String,
      enum: ["Pending", "Approved", "Rejected", null],
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
