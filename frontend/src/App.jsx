//frontend\src\App.jsx
import { Routes, Route, Navigate } from "react-router-dom";

/* Auth Pages */
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import SignupSuccess from "./pages/auth/SignupSuccess";

/* Workspace Flow */
import WorkspaceOptions from "./pages/auth/WorkspaceOptions";
import CreateWorkspace from "./pages/auth/CreateWorkspace";
import ProcessingPage from "./pages/auth/workspaceProcessingPage";
import DepartmentProcessPage from "./pages/auth/DepartmentProcessPage";
// import JoinWorkspaceCodeInput from "./pages/auth/JoinWorkspaceCodeInput";
/* Requests Flow */
import GMRequests from "./pages/workspace/components/GMRequests";
import DepartmentHeadRequestsListWrapper from "./pages/workspace/components/DepartmentHeadRequestsList";
import DepartmentHeadRequestPage from "./pages/auth/DepartmentHeadRequestPage";
import StaffJoinConfirm from "./pages/auth/StaffJoinConfirm";
import StaffProcessingPage from "./pages/auth/StaffProcessingPage";

/* Dashboards */
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import WorkspaceManagerDashboard from "./pages/workspace/WorkspaceManagerDashboard";
import DepartmentHeadDashboard from "./pages/department/DepartmentHeadDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
/* Profile Component */
import ProfileView from "./components/ProfileView";
/* joining pages*/
import JoinWorkspace from "./pages/auth/JoinWorkspace";

export default function App() {
  return (
    <Routes>
      {/* ================= AUTH ROUTES ================= */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/signup-success" element={<SignupSuccess />} />

      {/*=================profile component=================*/}
      <Route path="/profile" element={<ProfileView />} />

      {/* ================= WORKSPACE & REQUESTS ROUTES ================= */}
      {/* Workspace Entry */}
      <Route path="/workspace-options" element={<WorkspaceOptions />} />
      <Route path="/workspace/create" element={<CreateWorkspace />} />
      <Route path="/workspace/processing/:id" element={<ProcessingPage />} />

      {/* Join Workspace Flow */}
      <Route path="/join-workspace" element={<JoinWorkspace />} />

      {/* Request Pages */}
      <Route
        path="/department-head-requests-list"
        element={<DepartmentHeadRequestsListWrapper />}
      />

      <Route
        path="/workspace/department-processing"
        element={<DepartmentProcessPage />}
      />

      <Route path="/staff/staff-processing" element={<StaffProcessingPage />} />

      <Route
        path="/department-head-request"
        element={<DepartmentHeadRequestPage />}
      />

      <Route path="/workspace/requests" element={<GMRequests />} />

      <Route path="/staff-join-confirm" element={<StaffJoinConfirm />} />

      {/* ================= DASHBOARDS ================= */}

      <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

      <Route
        path="/workspace/dashboard"
        element={<WorkspaceManagerDashboard />}
      >
        <Route path="profile" element={<ProfileView />} />
      </Route>

      <Route path="/department/dashboard" element={<DepartmentHeadDashboard />}>
        <Route path="profile" element={<ProfileView />} />
      </Route>

      <Route path="/staff/dashboard" element={<StaffDashboard />}>
        <Route path="profile" element={<ProfileView />} />
      </Route>

      {/* ================= DEFAULT ================= */}

      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="*"
        element={
          <div className="p-10 text-center text-xl">404 | Page Not Found</div>
        }
      />
    </Routes>
  );
}
