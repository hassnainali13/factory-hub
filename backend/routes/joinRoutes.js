//backend\routes\joinRoutes.js

const express = require("express");
const {
  joinWorkspacePreview,
  sendDepartmentRequest,
  dashboardStatus,
  approveRequest,
  rejectRequest,
  getPendingRequests,
} = require("../controllers/joinController");

const authenticate = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Step 1: Workspace preview
router.post("/preview", authenticate, joinWorkspacePreview);

// Step 2: Send request
router.post("/request", authenticate, sendDepartmentRequest);

// Step 3: Dashboard status
router.get("/dashboard-status", authenticate, dashboardStatus);

// Step 4: GM approves request
router.patch(
  "/requests/:userId/approve",
  authenticate,
  allowRoles("general_manager"),
  approveRequest,
);

// Step 5: GM rejects request
router.patch(
  "/requests/:userId/reject",
  authenticate,
  allowRoles("general_manager"),
  rejectRequest,
);
// Get all pending requests (GM only)
router.get(
  "/pending-requests",
  authenticate,
  allowRoles("general_manager"),
  getPendingRequests
);

module.exports = router;
