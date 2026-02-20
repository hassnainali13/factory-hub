// backend/controllers/joinController.js
const mongoose = require("mongoose");

// const User = require("../models/User");
const Workspace = require("../models/Workspace");
// const Department = require("../models/Department");

// backend/controllers/joinController.js
const User = require("../models/User");
const Department = require("../models/Department");

// 1️⃣ Workspace preview
exports.joinWorkspacePreview = async (req, res) => {
  try {
    const { workspaceCode } = req.body;

    const workspace = await Workspace.findOne({ code: workspaceCode }).populate(
      "createdBy",
      "name email",
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not exists" });
    }

    // ✅ Departments
    const departments = await Department.find({
      workspaceId: workspace._id,
      status: { $in: ["active", "pending", "disabled"] },
    }).select("department status head deptHeadId headsRequestedBy employees");

    res.json({
      workspaceId: workspace._id,
      name: workspace.name,
      logo: workspace.logo,
      generalManager: workspace.createdBy?.name || "—",
      departments,
    });
  } catch (err) {
    console.error("joinWorkspacePreview error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣ Send request to join a department
exports.sendDepartmentRequest = async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department Id required" });
    }

    const user = await User.findById(req.userId);
    const department = await Department.findById(departmentId);

    if (!user || !department) {
      return res.status(404).json({ message: "User or Department not found" });
    }

    // ✅ If department already active and head assigned
    if (department.status === "active" && department.deptHeadId) {
      return res
        .status(400)
        .json({ message: "Department head already assigned" });
    }

    // ✅ If user already has pending request anywhere
    if (user.requestStatus === "pending") {
      return res
        .status(400)
        .json({ message: "Aapki request already pending hai" });
    }

    // ✅ Ensure headsRequestedBy exists
    if (!department.headsRequestedBy) department.headsRequestedBy = [];

    const userIdStr = user._id.toString();

    // ✅ Check if same user already requested this department
    const alreadyRequested = department.headsRequestedBy
      .map((id) => id.toString())
      .includes(userIdStr);

    if (alreadyRequested) {
      return res
        .status(400)
        .json({ message: "Aapki request already pending hai" });
    }

    // ✅ Push user in requested list
    department.headsRequestedBy.push(user._id);

    // ✅ Make department pending
    department.status = "pending";

    await department.save();

    // ✅ Update user status
    user.departmentId = department._id;
    user.requestStatus = "pending";
    user.role = "user";
    await user.save();

    res.json({ message: "Tumhari request General Manager ko chali gai hai" });
  } catch (err) {
    console.error("sendDepartmentRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 2️⃣a Send request from DepartmentHeadRequestPage.jsx
exports.sendDepartmentHeadRequest = async (req, res) => {
  try {
    const { workspaceId, departmentId } = req.body;

    if (!workspaceId || !departmentId) {
      return res
        .status(400)
        .json({ message: "workspaceId & departmentId required" });
    }

    const user = await User.findById(req.userId);
    const department = await Department.findById(departmentId);

    if (!user || !department) {
      return res.status(404).json({ message: "User or Department not found" });
    }

    // ✅ If department already active and head assigned
    if (department.status === "active" && department.deptHeadId) {
      return res
        .status(400)
        .json({ message: "Department head already assigned" });
    }

    // ✅ If user already pending anywhere
    if (user.requestStatus === "pending") {
      return res
        .status(400)
        .json({ message: "Aapki request already pending hai" });
    }

    // ✅ Ensure headsRequestedBy exists
    if (!department.headsRequestedBy) department.headsRequestedBy = [];

    const userIdStr = user._id.toString();

    // ✅ Check if same user already requested this department
    const alreadyRequested = department.headsRequestedBy
      .map((id) => id.toString())
      .includes(userIdStr);

    if (alreadyRequested) {
      return res
        .status(400)
        .json({ message: "Aapki request already pending hai" });
    }

    // ✅ Push user in requested list
    department.headsRequestedBy.push(user._id);

    // ✅ Make department pending
    department.status = "pending";
    await department.save();

    // ✅ Update user
    user.departmentId = department._id;
    user.requestStatus = "pending";
    user.role = "user";
    await user.save();

    res.json({ message: "Department head request sent successfully" });
  } catch (err) {
    console.error("sendDepartmentHeadRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Dashboard status
exports.dashboardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "departmentId",
      "department status workspaceId deptHeadId",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.departmentId) return res.json({ type: "noDepartment" });

    if (user.requestStatus === "pending")
      return res.json({ type: "pending", department: user.departmentId });

    if (user.requestStatus === "approved")
      return res.json({ type: "assigned", department: user.departmentId });

    if (user.requestStatus === "rejected")
      return res.json({ type: "independent" });

    return res.json({ type: "independent" });
  } catch (err) {
    console.error("dashboardStatus error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Approve a user's department head request
exports.approveRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { userId } = req.params;

    // ✅ Get user to approve
    const user = await User.findById(userId).session(session);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.departmentId)
      return res.status(400).json({ message: "No department request found" });

    // ✅ Get department
    const department = await Department.findById(user.departmentId).session(
      session,
    );
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    const departmentId = department._id;

    // ✅ Approve selected user
    user.requestStatus = "approved";
    user.role = "department_head";
    await user.save({ session });

    // ✅ Reset all other pending users of same department
    // Using $expr + $eq + ObjectId to avoid type mismatch
    const result = await User.updateMany(
      {
        _id: { $ne: user._id },
        requestStatus: "pending",
        $expr: { $eq: ["$departmentId", departmentId] }, // THIS ensures ObjectId match
      },
      {
        $set: {
          requestStatus: null,
          departmentId: null,
          role: "user",
        },
      },
      { session },
    );

    console.log("Pending users reset:", result.modifiedCount);

    // ✅ Update department
    department.deptHeadId = user._id;
    department.status = "active";
    department.headsRequestedBy = [];
    await department.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({ message: "Request approved successfully" });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("approveRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ Reject a user's department head request
exports.rejectRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.departmentId)
      return res
        .status(400)
        .json({ message: "User has no department request" });

    // Reset only this user's request
    requestStatus = null;
    user.departmentId = null;
    user.role = "user";
    await user.save();

    res.json({ message: "Request rejected successfully" });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 6️⃣ Get all pending requests for GM
exports.getPendingRequests = async (req, res) => {
  try {
    const gm = await User.findById(req.userId);

    if (!gm) return res.status(404).json({ message: "User not found" });

    const workspaceId = gm.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({ message: "GM workspace not found" });
    }

    // ✅ Get all departments of this workspace
    const departments = await Department.find({ workspaceId }).select(
      "_id department",
    );

    const departmentIds = departments.map((d) => d._id);

    // ✅ Get all users who are pending for these departments
    const pendingUsers = await User.find({
      departmentId: { $in: departmentIds },
      requestStatus: "pending",
    }).populate("departmentId", "department status");

    // ✅ Format for table
    const formatted = pendingUsers.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      departmentId: u.departmentId?._id,
      departmentName: u.departmentId?.department || "—",
      requestStatus: u.requestStatus,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
