

const express = require("express");

const {
  joinWorkspacePreview,
  sendDepartmentRequest,
  sendDepartmentHeadRequest,
  dashboardStatus,
  approveRequest,
  rejectRequest,
  getPendingRequests,
} = require("../controllers/joinController");

const authenticate = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Workspace preview
router.post("/preview", authenticate, joinWorkspacePreview);

// Join workspace request
router.post("/request", authenticate, sendDepartmentRequest);

// ✅ Department head request page
router.post(
  "/send-department-request",
  authenticate,
  sendDepartmentHeadRequest,
);

// Dashboard status
router.get("/dashboard-status", authenticate, dashboardStatus);

// ✅ GM approve/reject (ONLY GM)
router.patch(
  "/requests/:userId/approve",
  authenticate,
  allowRoles("general_manager"),
  approveRequest,
);

router.patch(
  "/requests/:userId/reject",
  authenticate,
  allowRoles("general_manager"),
  rejectRequest,
);

// Get pending requests (GM)
router.get(
  "/pending-requests",
  authenticate,
  allowRoles("general_manager"),
  getPendingRequests,
);

module.exports = router;
