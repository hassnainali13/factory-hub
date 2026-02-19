// //backend\controllers\departmentController.js

// const Department = require("../models/Department"); // Department model

// // Get all departments
// // Get departments by workspace
// exports.getDepartments = async (req, res) => {
//   try {
//     const { workspaceId } = req.query;

//     if (!workspaceId) {
//       return res.status(400).json({
//         message: "workspaceId is required",
//       });
//     }

//     const departments = await Department.find({ workspaceId });

//     res.status(200).json(departments);
//   } catch (err) {
//     console.error("Get departments error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


// // Create a new department
// exports.createDepartment = async (req, res) => {
//   const { department, head, employees, status, workspaceId } = req.body;

//   if (!department || !workspaceId || employees === undefined) {
//     return res.status(400).json({
//       message: "Department, workspaceId, and employees are required",
//     });
//   }

//   try {
//     const newDept = await Department.create({
//       department,
//       head,
//       employees,
//       status,
//       workspaceId, // Match frontend
//     });
//     res.status(201).json(newDept);
//   } catch (err) {
//     console.error("Create department error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Approve a department
// exports.approveDepartment = async (req, res) => {
//   try {
//     const dept = await Department.findByIdAndUpdate(
//       req.params.id,
//       { status: "active" },
//       { new: true },
//     );
//     res.json(dept);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // Reject a department
// exports.rejectDepartment = async (req, res) => {
//   try {
//     const dept = await Department.findByIdAndUpdate(
//       req.params.id,
//       { status: "disabled" },
//       { new: true },
//     );
//     res.json(dept);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// backend/controllers/departmentController.js

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

    const departments = await Department.find({ workspaceId });

    res.status(200).json(departments);
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

    // 1️⃣ Find the user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Find the department
    const department = await Department.findById(user.departmentId);
    if (!department)
      return res.status(404).json({ message: "Department not found" });

    // 3️⃣ Update user
    user.requestStatus = "approved"; // request approved
    user.role = "department_head"; // set role as department head
    await user.save();

    // 4️⃣ Update department
    department.deptHeadId = user._id; // assign user as department head
    department.status = "active"; // set department status active
    await department.save();

    res.json({
      message: "Department head approved successfully",
      user,
      department,
    });
  } catch (error) {
    console.error("Error approving head request:", error);
    res.status(500).json({ message: "Server error" });
  }
};