//backend\controllers\joinController.js

const User = require("../models/User");
const Workspace = require("../models/Workspace");
const Department = require("../models/Department");

// 1️⃣ Workspace preview
exports.joinWorkspacePreview = async (req, res) => {
  try {
    const { workspaceCode } = req.body;

    const workspace = await Workspace.findOne({ code: workspaceCode }).populate(
      "createdBy",
      "name email workspacerole",
    );

    if (!workspace) {
      return res.status(404).json({ message: "Workspace not exists" });
    }

    // show only Active + Pending departments
    const departments = await Department.find({
      workspaceId: workspace._id,
      status: { $in: ["active", "pending"] },
    }).select("name role status head");

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

// 2️⃣ Send request to become department head
exports.sendDepartmentRequest = async (req, res) => {
  try {
    const { departmentId } = req.body;

    if (!departmentId) {
      return res.status(400).json({ message: "Department Id required" });
    }

    const user = await User.findById(req.userId);
    const department = await Department.findById(departmentId);

    if (!user || !department)
      return res.status(404).json({ message: "User or Department not found" });

    // ✅ If department head already assigned
    if (department.head) {
      return res.status(400).json({
        message: "Is department ka head already assigned hai",
      });
    }

    // ✅ If user already has pending request
    if (user.requestStatus === "pending") {
      return res.status(400).json({
        message: "Aapki request already pending hai",
      });
    }

    // ✅ Update user
    user.workspaceId = department.workspaceId;
    user.departmentId = department._id; // future staff feature ready
    user.requestStatus = "pending";
    user.role = "user"; // default until approved
    await user.save();

    res.json({
      message: "Tumhari request General Manager ko chali gai hai",
    });
  } catch (err) {
    console.error("sendDepartmentRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 3️⃣ Dashboard status (Login ke baad redirect logic)
exports.dashboardStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate(
      "departmentId",
      "name role workspaceId",
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.workspaceId) return res.json({ type: "noWorkspace" });

    if (user.requestStatus === "pending") {
      return res.json({
        type: "pending",
        department: user.departmentId,
      });
    }

    if (user.requestStatus === "Approved") {
      return res.json({
        type: "assigned",
        department: user.departmentId,
      });
    }

    if (user.requestStatus === "Rejected") {
      return res.json({ type: "independent" });
    }

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
    if (!user.departmentId)
      return res
        .status(400)
        .json({ message: "User has no department request" });

    const department = await Department.findById(user.departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    if (department.head) {
      return res
        .status(400)
        .json({ message: "Department head already assigned" });
    }

    // ✅ Approve user
    user.requestStatus = "Approved";
    user.role = "department_head";
    await user.save();

    // ✅ Assign department head
    department.head = user._id;
    department.status = "active";
    await department.save();

    // ✅ Reject other pending requests for same department
    await User.updateMany(
      {
        _id: { $ne: user._id },
        departmentId: department._id,
        requestStatus: "pending",
      },
      { $set: { requestStatus: "Rejected", departmentId: null, role: "user" } },
    );

    res.json({ message: "Request approved successfully" });
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

    user.workspaceId = null;
    user.departmentId = null;
    user.requestStatus = "Rejected";
    user.role = "user"; // back to default
    await user.save();

    res.json({ message: "Request rejected" });
  } catch (err) {
    console.error("rejectRequest error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
// 6️⃣ Get all pending department requests for GM
exports.getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user.workspaceId)
      return res.status(400).json({ message: "No workspace assigned" });

    const pendingUsers = await User.find({
      workspaceId: user.workspaceId,
      requestStatus: "Pending",
    }).populate("departmentId", "name role");

    const formatted = pendingUsers.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      departmentName: u.departmentId?.name || "—",
    }));

    res.json(formatted);
  } catch (err) {
    console.error("getPendingRequests error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
