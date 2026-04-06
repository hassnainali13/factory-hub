// src/pages/workspace/WorkspaceManagerDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useUserProfile from "../../hooks/useUserProfile";
import useWorkspaceDetails from "../../hooks/useWorkspaceDetails";
import useAuthActions from "../../hooks/useAuthActions";
import useDropdown from "../../hooks/useDropdown";
import axiosInstance from "../../api/axiosInstance";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import DepartmentOverviewTable from "./components/DepartmentOverviewTable";
import DepartmentHeadRequestsList from "./components/DepartmentHeadRequestsList";
import DepartmentManagement from "./components/DepartmentManagement";
import ProfileView from "../../components/ProfileView";
import { Outlet } from "react-router-dom";
import DepartmentDetailModal from "./components/DepartmentDetailModal"; // Updated import

import {
  Bell,
  Search,
  LayoutDashboard,
  Boxes,
  CheckSquare,
  Shield,
  Users,
  FileBarChart2,
  Building2,
  ClipboardList,
  TrendingUp,
  Settings,
} from "lucide-react";

// KPI Cards data
const kpiCards = [
  {
    title: "Total Departments",
    value: 8,
    delta: "+2 this month",
    icon: Building2,
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Department Heads",
    value: 24,
    delta: "+3 this month",
    icon: Users,
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    title: "Total Employees",
    value: 476,
    delta: "+42 this month",
    icon: TrendingUp,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Pending Approvals",
    value: 11,
    delta: "Requires attention",
    icon: CheckSquare,
    accent: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
];

const departmentsData = [
  { name: "Production", employees: 45 },
  { name: "Quality Control", employees: 12 },
  { name: "Maintenance", employees: 18 },
  { name: "Logistics", employees: 15 },
  { name: "Administration", employees: 8 },
];

const monthlyGrowthData = [
  { month: "Jan", users: 82, approvals: 12 },
  { month: "Feb", users: 88, approvals: 15 },
  { month: "Mar", users: 92, approvals: 10 },
  { month: "Apr", users: 98, approvals: 14 },
  { month: "May", users: 105, approvals: 11 },
  { month: "Jun", users: 112, approvals: 16 },
];

export default function WorkspaceManagerDashboard() {
  const { user, userName, userEmail, role, userInitial } = useUserProfile();
  const [workspaceDetails, setWorkspaceDetails] = useState({
    workspaceName: "",
    logo: "",
  });
  const { logout, loading } = useAuthActions();
  const { open, toggle, ref: dropdownRef } = useDropdown();
  const [activePage, setActivePage] = useState("dashboard");
  const navigate = useNavigate();

  const [workspaceId, setWorkspaceId] = useState(null);
  useEffect(() => {
    const fetchWorkspace = async () => {
      if (!workspaceId) return;
      try {
        const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
        setWorkspaceDetails(res.data || { workspaceName: "", logo: "" });
      } catch (err) {
        console.error("Error fetching workspace details:", err);
        setWorkspaceDetails({ workspaceName: "", logo: "" });
      }
    };
    fetchWorkspace();
  }, [workspaceId]);
  useEffect(() => {
    if (user?.workspaceId) {
      setWorkspaceId(user.workspaceId._id || user.workspaceId);
      localStorage.setItem(
        "workspaceId",
        user.workspaceId._id || user.workspaceId,
      );
    } else {
      const storedId = localStorage.getItem("workspaceId");
      if (storedId) setWorkspaceId(storedId);
    }
  }, [user]);
  const [showSidebar, setShowSidebar] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [showProfile, setShowProfile] = useState(false);

  // 🔥 Fetch all departments and pending users
  const fetchDepartments = async () => {
    if (!workspaceId) return;

    try {
      const res = await axiosInstance.get(
        `/departments?workspaceId=${workspaceId}`,
      );
      setDepartments(res.data);

      const allPending = res.data.flatMap((d) =>
        Array.isArray(d.users)
          ? d.users.filter((u) => u.requestStatus === "pending")
          : [],
      );
      setPendingRequests(allPending);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setPendingRequests([]);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [workspaceId]);

  // ✅ Approve request
  const handleApprove = async (userId) => {
    try {
      await axiosInstance.patch(`/departments/approve/${userId}`);
      // Refetch departments
      await fetchDepartments();
    } catch (err) {
      console.error("Error approving:", err);
    }
  };

  // ✅ Reject request
  const handleReject = async (userId) => {
    try {
      await axiosInstance.patch(`/departments/reject/${userId}`);
      // Refetch departments
      await fetchDepartments();
    } catch (err) {
      console.error("Error rejecting:", err);
    }
  };

  // 👇 Add at the top of the component along with other useState
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);
  // 🔹 Profile Upload Handler

  // Modal state
  const [isDepartmentDetailModalOpen, setIsDepartmentDetailModalOpen] =
    useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const handleOpenRequests = (department) => {
    setSelectedDepartment(department);
    setIsRequestModalOpen(true);
  };

  const handleCloseRequests = () => {
    setIsRequestModalOpen(false);
    setSelectedDepartment(null);
    // 🔥 Refresh page after tick screen closes
    fetchDepartments();
  };

  const handleOpenDepartmentDetail = (department) => {
    setSelectedDepartment(department); // keep the object for reference if needed
    setIsDepartmentDetailModalOpen(true);
  };

  const handleCloseDepartmentDetail = () => {
    setIsDepartmentDetailModalOpen(false); // Modal ko close karte hain
    setSelectedDepartment(null); // Selected department ko clear karte hain
  };

  const pendingDepartments = departments.filter(
    (d) => d.status?.toLowerCase() === "pending",
  );
  const activeDepartments = departments.filter(
    (d) => d.status?.toLowerCase() === "active",
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-purple-200 blur-2xl rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative"></div>
        </div>

        <p className="mt-6 text-lg font-semibold text-gray-800">
          Loading Dashboard
        </p>

        <p className="text-xs text-gray-400 mt-1">Please wait...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1440px] gap-6 p-4 md:p-6">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 bg-white border-r border-slate-200 p-4 shadow-lg transition-transform
  md:static md:translate-x-0 md:block
${showSidebar ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        >
          <div className="sticky top-6">
            {/* Workspace info + SidebarItems */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 px-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
                  {workspaceDetails.logo ? (
                    <img
                      src={workspaceDetails.logo} // Cloudinary URL directly
                      alt="Workspace Logo"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"; // agar image load na ho to hide
                      }}
                    />
                  ) : (
                    <LayoutDashboard className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {workspaceDetails.workspaceName}
                  </p>
                  <p className="text-xs text-slate-500">{role}</p>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <SidebarItem
                  icon={LayoutDashboard}
                  label="Dashboard"
                  active={activePage === "dashboard"}
                  onClick={() => setActivePage("dashboard")}
                />
                <SidebarItem
                  icon={Boxes}
                  label="Departments"
                  active={activePage === "departments"}
                  onClick={() => setActivePage("departments")}
                />
                <SidebarItem
                  icon={CheckSquare}
                  label="Approvals"
                  active={activePage === "approvals"}
                  onClick={() => setActivePage("approvals")}
                />
                <SidebarItem
                  icon={Shield}
                  label="Department Management"
                  active={activePage === "department-management"}
                  onClick={() => setActivePage("department-management")}
                />
                <SidebarItem
                  icon={Users}
                  label="Staff"
                  active={activePage === "staff"}
                  onClick={() => setActivePage("staff")}
                />
                <SidebarItem
                  icon={FileBarChart2}
                  label="Reports"
                  active={activePage === "reports"}
                  onClick={() => setActivePage("reports")}
                />
                <SidebarItem
                  icon={ClipboardList}
                  label="Logs / Audit"
                  active={activePage === "logs"}
                  onClick={() => setActivePage("logs")}
                />
                <SidebarItem
                  icon={Settings}
                  label="System Settings"
                  active={activePage === "settings"}
                  onClick={() => setActivePage("settings")}
                />
              </div>
            </div>
          </div>
        </aside>
        {/* Overlay for mobile when sidebar is open */}
        {showSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}
        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Topbar */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {workspaceDetails.workspaceName}, Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome, {userName} — {role}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                className="md:hidden flex flex-col justify-center gap-1 p-2 rounded-md hover:bg-slate-200 transition"
                onClick={() => setShowSidebar((prev) => !prev)}
              >
                <span className="block w-6 h-0.5 bg-blue-500"></span>
                <span className="block w-6 h-0.5 bg-blue-500"></span>
                <span className="block w-6 h-0.5 bg-blue-500"></span>
              </button>

              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Search..."
                />
              </div>

              <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
                <Bell className="h-4 w-4" />
              </button>

              <div
                ref={dropdownRef}
                className="relative inline-block text-left"
              >
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-100 transition-colors"
                >
                  {/* Topbar profile button */}
                  <div className="grid h-8 w-8 place-items-center rounded-full overflow-hidden">
                    {profileImage ? (
                      <img
                        src={
                          profileImage ? profileImage + "?t=" + Date.now() : ""
                        }
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="bg-violet-600 text-xs font-semibold text-white flex items-center justify-center h-full w-full">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {userName}
                    </p>
                    <p className="text-[10px] text-slate-500">{userEmail}</p>
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-gray-300 bg-white shadow-lg z-10">
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-gray-100"
                      onClick={() => setShowProfile(true)}
                    >
                      Profile View
                    </button>
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {activePage === "dashboard" && (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((c) => (
                  <KpiCard key={c.title} {...c} />
                ))}
              </section>

              <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    Employees per Department
                  </h2>
                  <CustomBarChart
                    data={departmentsData}
                    xKey="name"
                    yKey="employees"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    Monthly Growth
                  </h2>
                  <CustomLineChart
                    data={monthlyGrowthData}
                    lines={[
                      { dataKey: "users", color: "#6366f1" },
                      { dataKey: "approvals", color: "#f59e0b" },
                    ]}
                  />
                </div>
              </section>

              <DepartmentOverviewTable
                departments={departments}
                initialLimit={5}
                disableShowMore={true}
                onOpenRequests={handleOpenRequests}
                onOpenDetails={handleOpenDepartmentDetail}
              />

              <DepartmentHeadRequestsList
                open={isRequestModalOpen}
                onClose={handleCloseRequests}
                department={selectedDepartment}
                pendingRequests={
                  Array.isArray(pendingRequests) ? pendingRequests : []
                }
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </>
          )}

          {/* Other active pages handling omitted for brevity */}

          {/* Department Detail Modal */}
          {isDepartmentDetailModalOpen && (
            <DepartmentDetailModal
              department={selectedDepartment}
              onClose={handleCloseDepartmentDetail}
            />
          )}

          {activePage === "departments" && (
            <DepartmentOverviewTable
              title="Active Departments"
              departments={activeDepartments}
              initialLimit={10}
              disableShowMore={true}
              onOpenRequests={handleOpenRequests}
            />
          )}

          {activePage === "approvals" && (
            <>
              <DepartmentOverviewTable
                title="Pending Department Approvals"
                departments={pendingDepartments}
                initialLimit={10}
                disableShowMore={true}
                onOpenRequests={handleOpenRequests}
              />

              <DepartmentHeadRequestsList
                open={isRequestModalOpen}
                onClose={handleCloseRequests}
                department={selectedDepartment}
                pendingRequests={
                  Array.isArray(pendingRequests) ? pendingRequests : []
                }
                onApprove={handleApprove}
                onReject={handleReject}
              />
            </>
          )}

          {activePage === "department-management" && (
            <DepartmentManagement
              data={departments}
              workspaceId={workspaceId}
              setDepartments={setDepartments}
            />
          )}

          {showProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded-2xl w-[400px]">
                <button
                  className="mb-4 text-red-600"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
                <ProfileView />
              </div>
            </div>
          )}
          {isDepartmentDetailModalOpen && (
            <DepartmentDetailModal
              departmentId={selectedDepartment?._id}
              onClose={handleCloseDepartmentDetail}
            />
          )}
          {/* ✅ Nested route content will render here */}
          <Outlet />
        </main>
      </div>
    </div>
  );
}
