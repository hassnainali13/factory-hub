  //frontend\src\App.jsx

  import { Routes, Route, Navigate } from "react-router-dom";
  import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
  import WorkspaceManagerDashboard from "./pages/workspace/WorkspaceManagerDashboard";
  import Login from "./pages/auth/Login";
  import Signup from "./pages/auth/Signup";
  import WorkspaceOptions from "./pages/auth/WorkspaceOptions";
  import CreateWorkspace from "./pages/auth/CreateWorkspace";
  import ProcessingPage from "./pages/auth/workspaceProcessingPage";
  import SignupSuccess from "./pages/auth/SignupSuccess";
  import DepartmentHeadDashboard from "./pages/department/DepartmentHeadDashboard";
  import JoinWorkspace from "./pages/auth/JoinWorkspace"; // ✅ Capital
  import DepartmentProcessPage from "./pages/auth/DepartmentProcessPage";
  import GMRequests from "./pages/workspace/components/GMRequests";

  export default function App() {
    return (
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/workspace-options" element={<WorkspaceOptions />} />
        <Route path="/workspace/create" element={<CreateWorkspace />} />
        <Route path="/workspace/processing/:id" element={<ProcessingPage />} />
        <Route path="/signup-success" element={<SignupSuccess />} />
        <Route path="/join-workspace" element={<JoinWorkspace />} />{" "}
        {/* ✅ Fixed */}
        <Route
          path="/workspace/department-processing"
          element={<DepartmentProcessPage />}
        />{" "}
        {/* ✅ New route */}
        <Route path="/workspace/requests" element={<GMRequests />} />
        {/* Dashboards */}
        <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />
        <Route
          path="/workspace/dashboard"
          element={<WorkspaceManagerDashboard />}
        />
        <Route
          path="/department/dashboard"
          element={<DepartmentHeadDashboard />}
        />
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<div>404 | Page Not Found</div>} />
      </Routes>
    );
  }
