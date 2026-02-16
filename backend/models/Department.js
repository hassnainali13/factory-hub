const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    department: { type: String, required: true },
    head: { type: String, required: true },
    employees: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "active", "disabled"],
      default: "disabled",
    },
    workspaceId: {          // Workspace join / create
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workspace",
          default: null,
        },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Department", departmentSchema);
