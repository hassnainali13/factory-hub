//backend\controllers\departmentController.js

const Department = require("../models/Department"); // Department model

// Get all departments
// Get departments by workspace
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


// Create a new department
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
      head,
      employees,
      status,
      workspaceId, // Match frontend
    });
    res.status(201).json(newDept);
  } catch (err) {
    console.error("Create department error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Approve a department
exports.approveDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true },
    );
    res.json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Reject a department
exports.rejectDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { status: "disabled" },
      { new: true },
    );
    res.json(dept);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
