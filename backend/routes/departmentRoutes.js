// //backend\routes\departmentRoutes.js

// const express = require("express");
// const router = express.Router();
// const authenticate = require("../middleware/authMiddleware"); // ✅ import

// const {
//   getDepartments,
//   createDepartment,
//   approveDepartment,
//   rejectDepartment,
// } = require("../controllers/departmentController");

// // GET all departments (optional: secure or public)
// router.get("/", authenticate, getDepartments);

// // POST create a new department
// router.post("/create", authenticate, createDepartment); // ✅ protect endpoint

// // PATCH approve a department
// router.patch("/approve/:id", authenticate, approveDepartment);

// // PATCH reject a department
// router.patch("/reject/:id", authenticate, rejectDepartment);

// module.exports = router;



// backend/routes/departmentRoutes.js

const express = require("express");
const router = express.Router();

const authenticate = require("../middleware/authMiddleware");
const allowRoles = require("../middleware/roleMiddleware");

const {
  getDepartments,
  createDepartment,
  approveDepartment,
  rejectDepartment,
  approveHeadRequest,
} = require("../controllers/departmentController");

// ✅ GET departments (workspaceId required)
router.get("/", authenticate, getDepartments);

// ✅ POST create a new department (ONLY GM)
router.post(
  "/create",
  authenticate,
  allowRoles("general_manager"),
  createDepartment,
);

// ✅ PATCH approve a department (ONLY GM)
router.patch(
  "/approve/:id",
  authenticate,
  allowRoles("general_manager"),
  approveDepartment,
);

// ✅ PATCH reject a department (ONLY GM)
router.patch(
  "/reject/:id",
  authenticate,
  allowRoles("general_manager"),
  rejectDepartment,
);
// backend/routes/departmentRoutes.js
// backend/routes/departmentRoutes.js
router.patch(
  "/approve-head/:userId",
  authenticate,
  allowRoles("general_manager"),
  approveHeadRequest
);



module.exports = router;
