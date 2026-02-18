//backend\controllers\joinController.js
const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Department = require("../models/Department");

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

    // ✅ IMPORTANT: headsRequestedBy include karna zaroori hai
    const departments = await Department.find({
      workspaceId: workspace._id,
      status: { $in: ["active", "pending", "disabled"] },
    })
      .select("name department status head headsRequestedBy")
      .populate("head", "name email role requestStatus");

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

// 2️⃣ Send request to join a department (existing)
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

    const userIdStr = user._id.toString();

    // ✅ If department already active and head assigned
    if (department.status === "active" && department.head) {
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

    // ✅ Make department pending (only if not active)
    if (department.status !== "active") {
      department.status = "pending";
    }

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

    if (!user || !department)
      return res.status(404).json({ message: "User or Department not found" });

    if (user.requestStatus === "pending") {
      return res
        .status(400)
        .json({ message: "Aapki request already pending hai" });
    }

    user.departmentId = department._id;
    user.requestStatus = "pending";
    user.role = "user";
    await user.save();

    if (department.status === "disabled" || department.status === "pending") {
      department.status = "pending";
      await department.save();
    }

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
      "department status workspaceId",
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

// 4️⃣ GM approves request
exports.approveRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.departmentId) {
      return res
        .status(400)
        .json({ message: "User has no department request" });
    }

    const department = await Department.findById(user.departmentId);

    if (!department)
      return res.status(404).json({ message: "Department not found" });

    // ❌ If already active
    if (department.status === "active" && department.head) {
      return res
        .status(400)
        .json({ message: "Department head already assigned" });
    }

    // ✅ Approve this user
    user.requestStatus = "approved";
    user.role = "department_head";
    await user.save();

    // ✅ Activate department
    department.head = user._id;
    department.status = "active";
    department.headsRequestedBy = []; // clear all requests
    await department.save();

    // ✅ Reject all other pending users (make null)
    await User.updateMany(
      {
        _id: { $ne: user._id },
        departmentId: department._id,
        requestStatus: "pending",
      },
      {
        $set: {
          requestStatus: null,
          departmentId: null,
          role: "user",
        },
      },
    );

    res.json({ message: "Request approved", department, user });
  } catch (err) {
    console.error("approveRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 5️⃣ GM rejects request
exports.rejectRequest = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    const departmentId = user.departmentId;

    // ✅ Reject user -> make null
    user.departmentId = null;
    user.requestStatus = null;
    user.role = "user";
    await user.save();

    // ✅ If department exists and no more pending users -> disable it
    if (departmentId) {
      const department = await Department.findById(departmentId);

      if (department && !department.head) {
        const stillPending = await User.findOne({
          departmentId: department._id,
          requestStatus: "pending",
        });

        if (!stillPending) {
          department.status = "disabled";
          department.headsRequestedBy = [];
          await department.save();
        }
      }
    }

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

    // ✅ GM ka workspaceId user me already hota hai
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
