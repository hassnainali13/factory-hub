const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io;

const initSocket = (server) => {
  io = socketIo(server, { cors: { origin: "*" } });

  // Auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("No token"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const { role, workspaceId, departmentId, userId } = socket.user;

    // Superadmin
    if (role === "superadmin") {
      socket.join("superadmin_system");
    }

    // Workspace roles
    if (["general_manager", "industry_head"].includes(role) && workspaceId) {
      socket.join(`workspace_${workspaceId}_${role}`);
    }

    // Department roles
    if (role === "department_head" && workspaceId && departmentId) {
      socket.join(`workspace_${workspaceId}_department_${departmentId}_head`);
    }

    if (role === "staff" && workspaceId && departmentId) {
      socket.join(`workspace_${workspaceId}_department_${departmentId}_staff`);
    }

    // HR roles (assuming similar structure)
    if (role === "hr_department" && workspaceId) {
      socket.join(`workspace_${workspaceId}_hr_department`);
    }

    if (role === "hr_staff" && workspaceId) {
      socket.join(`workspace_${workspaceId}_hr_staff`);
    }

    // User-specific
    if (userId) {
      socket.join(`user_${userId}`);
    }

    socket.on("disconnect", () => {
      // Auto-leave rooms
    });
  });

  return io;
};

const getIo = () => {
  return io || null;
};

module.exports = { initSocket, getIo };
