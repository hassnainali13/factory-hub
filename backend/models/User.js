// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },

//     role: {
//       type: String,
//       enum: ["user", "general_manager", "department_head", "staff", "industry_head"],
//       default: "user",
//     },

//     workspaceId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Workspace",
//       default: null,
//     },

//     departmentId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Department",
//       default: null,
//     },

//     requestStatus: {
//       type: String,
//       enum: ["pending", "approved", "rejected", null],
//       default: null,
//     },

//     // ✅ NEW: Profile Image
//     profileImage: {
//       type: String,   // store URL or file path
//       default: null,  // optional
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "user",
        "general_manager",
        "department_head",
        "staff",
        "industry_head",
      ],
      default: "user",
      index: true,
    },

    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Workspace",
      default: null,
      index: true,
    },

    departmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
      index: true,
    },

    requestStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: null,
      index: true,
    },

    profileImage: {
      type: String, // store URL or file path
      default: null,
    },

    resetToken: {
      type: String,
      default: null,
    },

    resetTokenExpiry: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
