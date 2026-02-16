//backend\routes\departmentRoutes.js

const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/authMiddleware"); // ✅ import

const {
  getDepartments,
  createDepartment,
  approveDepartment,
  rejectDepartment,
} = require("../controllers/departmentController");

// GET all departments (optional: secure or public)
router.get("/", authenticate, getDepartments);

// POST create a new department
router.post("/create", authenticate, createDepartment); // ✅ protect endpoint

// PATCH approve a department
router.patch("/approve/:id", authenticate, approveDepartment);

// PATCH reject a department
router.patch("/reject/:id", authenticate, rejectDepartment);

module.exports = router;
