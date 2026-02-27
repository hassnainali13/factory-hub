
const User = require("../models/User");
const Department = require("../models/Department");
// ✅ Get departments by workspace
exports.getDepartments = async (req, res) => {
  try {
    const { workspaceId } = req.query;

    if (!workspaceId) {
      return res.status(400).json({
        message: "workspaceId is required",
      });
    }

    // ✅ Populate department head
    const departments = await Department.find({ workspaceId })
      .populate("deptHeadId", "name")
      .lean();

    // ✅ Create headName field for frontend
    const formattedDepartments = departments.map((d) => ({
      ...d,
      headName: d.deptHeadId?.name || null,
    }));

    res.status(200).json(formattedDepartments);
  } catch (err) {
    console.error("Get departments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Create a new department
exports.createDepartment = async (req, res) => {
  const { department, head, employees, status, workspaceId } = req.body;

  if (!department || !workspaceId || employees === undefined) {
    return res.status(400).json({
      message: "Department, workspaceId, and employees are required",
    });
  }

  try {
    const newDept = await Department.create({
      department,
      head, // (role string) ex: "department_head"
      employees,
      status: status || "disabled",
      workspaceId,

      // ✅ new fields
      deptHeadId: null,
      headsRequestedBy: [],
    });

    res.status(201).json(newDept);
  } catch (err) {
    console.error("Create department error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Approve department (ONLY status change, no head assign)
exports.approveDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept) return res.status(404).json({ message: "Department not found" });

    // ❌ If head not assigned, keep it pending (GM will approve user later)
    if (!dept.deptHeadId) {
      dept.status = "pending";
    } else {
      dept.status = "active";
    }

    await dept.save();

    res.json(dept);
  } catch (err) {
    console.error("approveDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reject department (disable + remove head)
exports.rejectDepartment = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);

    if (!dept) return res.status(404).json({ message: "Department not found" });

    dept.status = "disabled";

    // ✅ Remove head if any
    dept.deptHeadId = null;
    dept.headsRequestedBy = [];

    await dept.save();

    res.json(dept);
  } catch (err) {
    console.error("rejectDepartment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Approve Department Head Request (NEW - does not break old system)
exports.approveHeadRequest = async (req, res) => {
  try {
    const { userId } = req.params;

    // 1️⃣ Find user
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.departmentId)
      return res.status(400).json({ message: "User has no department request" });

    const deptId = user.departmentId;

    // 2️⃣ Approve selected user
    user.requestStatus = "approved";
    user.role = "department_head";
    await user.save();

    // 3️⃣ Assign department head
    const department = await Department.findByIdAndUpdate(
      deptId,
      {
        deptHeadId: user._id,
        status: "active",
      },
      { new: true }
    );

    if (!department)
      return res.status(404).json({ message: "Department not found" });

    // 4️⃣ Reset ALL other pending users of same department
    const resetResult = await User.updateMany(
      {
        departmentId: deptId,
        requestStatus: "pending",
        _id: { $ne: user._id },
      },
      {
        $set: {
          departmentId: null,
          requestStatus: null,
          role: "user",
        },
      }
    );

    console.log("Reset Users Count:", resetResult.modifiedCount);

    res.json({
      message: "Department head approved successfully",
      resetCount: resetResult.modifiedCount,
      user,
      department,
    });
  } catch (error) {
    console.error("Error approving head request:", error);
    res.status(500).json({ message: "Server error" });
  }
};