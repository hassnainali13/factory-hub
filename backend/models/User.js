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
      enum: ["user", "general_manager", "department_head", "staff" , "industry_head"],
      default: "user",
    },

    workspaceId: {
      // Workspace join / create
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
    },

    departmentId: {
      // Department join / approve
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },

    requestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", null],
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
