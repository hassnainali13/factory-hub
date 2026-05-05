// frontend\src\pages\department\DepartmentHeadDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import useDropdown from "../../hooks/useDropdown";
import useUserProfile from "../../hooks/useUserProfile";
import useAuthActions from "../../hooks/useAuthActions";
import useStaffOverview from "../../hooks/useStaffOverview";
import axiosInstance from "../../api/axiosInstance";
import Setting from "./components/CustomSettingsForDepartments";
import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import DepartmentStaffTable from "./components/DepartmentStaffTable";
import ProfileView from "../../components/ProfileView";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import Attendance from "../../components/Attendance";
import { getWorkspaceLogo } from "../../utils/logoHelper";

import {
  Bell,
  Search,
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  Shield,
  Settings,
  Boxes,
} from "lucide-react";

export default function DepartmentHeadDashboard() {
  const { userName, userEmail, role, userInitial, user } = useUserProfile();
  const { logout, loading } = useAuthActions();
  const { staff: staffRequests = [], refetch } = useStaffOverview();
  const { open, toggle, ref: dropdownRef } = useDropdown();
  const navigate = useNavigate();

  const [showProfile, setShowProfile] = useState(false);
  const [department, setDepartment] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");
  const [showSidebar, setShowSidebar] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  useEffect(() => {
    if (user?.profileImage) {
      setProfileImage(user.profileImage);
    }
  }, [user]);
  // Fetch department data
  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axiosInstance.get("/departments/my-department");
        setDepartment(res.data.department || null);
      } catch (err) {
        console.error("Error fetching department:", err?.message);
      }
    };
    fetchDepartment();
  }, []);

  // Dummy fallback data
  const dummyDepartment = {
    department: "HR Department",
    workspaceId: { name: "FactoryHub Workspace", logo: "" },
    pendingApprovals: 4,
    activeTasks: 12,
    attendanceRate: 92,
  };

  const departmentData = department || dummyDepartment;
  const displayRole = user?.departmentId?.head || role;

  const displayEmployees = Array.isArray(staffRequests) ? staffRequests : [];
  const dummyAttendanceData = [
    { month: "Jan", attendance: 85 },
    { month: "Feb", attendance: 90 },
    { month: "Mar", attendance: 92 },
    { month: "Apr", attendance: 88 },
    { month: "May", attendance: 94 },
  ];
  const dummyTaskData = [
    { month: "Jan", completed: 20 },
    { month: "Feb", completed: 35 },
    { month: "Mar", completed: 40 },
    { month: "Apr", completed: 55 },
    { month: "May", completed: 60 },
  ];

  const displayAttendance = dummyAttendanceData;
  const displayTasks = dummyTaskData;

  const kpiCards = [
    {
      title: "Total Employees",
      value: displayEmployees.length,
      delta: "+ Updated",
      icon: Users,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Pending Approvals",
      value: departmentData.pendingApprovals || 0,
      delta: "Requires action",
      icon: CheckSquare,
      accent: "text-orange-700",
      bg: "bg-orange-50",
    },
    {
      title: "Active Tasks",
      value: departmentData.activeTasks || 0,
      delta: "Current",
      icon: ClipboardList,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Attendance Rate",
      value: `${departmentData.attendanceRate || 0}%`,
      delta: "This month",
      icon: TrendingUp,
      accent: "text-violet-600",
      bg: "bg-violet-50",
    },
  ];

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/departments/staff/${id}/approve`);
      await refetch();
    } catch (err) {
      console.error("Approve error:", err.response?.data || err.message);
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.patch(`/departments/staff/${id}/reject`);
      await refetch();
    } catch (err) {
      console.error("Reject error:", err.response?.data || err.message);
    }
  };

  const handleView = (emp) => {
    console.log("View employee:", emp);
  };

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
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 bg-white border-r border-slate-200 p-4 shadow-lg transition-transform
  md:static md:translate-x-0 md:block
  ${showSidebar ? "translate-x-0" : "-translate-x-full"}
`}
        >
          <div className="sticky top-6">
            {/* Workspace info + SidebarItems */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img
                    src={getWorkspaceLogo(departmentData.workspaceId?.logo)}
                    alt="Workspace Logo"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {departmentData.workspaceId?.name || "Workspace Name"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {departmentData.department || "Department Name"}
                  </p>
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
                  label="Employees"
                  active={activePage === "employees"}
                  onClick={() => setActivePage("employees")}
                />
                <SidebarItem
                  icon={CheckSquare}
                  label="Approvals"
                  active={activePage === "approvals"}
                  onClick={() => setActivePage("approvals")}
                />

                <SidebarItem
                  icon={Shield}
                  label="Tasks"
                  active={activePage === "tasks"}
                  onClick={() => setActivePage("tasks")}
                />
                <SidebarItem
                  icon={Users}
                  label="Attendance"
                  active={activePage === "attendance"}
                  onClick={() => setActivePage("attendance")}
                />
                <SidebarItem
                  icon={FileBarChart2}
                  label="Reports"
                  active={activePage === "reports"}
                  onClick={() => setActivePage("reports")}
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
                {departmentData.department || "Department Name"}, Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {userName} — {displayRole}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
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
                  placeholder="Search employees..."
                />
              </div>

              <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition">
                <Bell className="h-4 w-4 text-slate-700" />
              </button>

              <div
                ref={dropdownRef}
                className="relative inline-block text-left"
              >
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-3 py-1.5 hover:bg-gray-100 transition-colors"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full overflow-hidden">
                    <div className="grid h-8 w-8 place-items-center rounded-full overflow-hidden">
                      {profileImage ? (
                        <img
                          src={profileImage + "?t=" + Date.now()}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none"; // image hide
                            e.target.nextSibling.style.display = "flex"; // fallback show
                          }}
                        />
                      ) : null}

                      {/* ✅ Fallback (First Letter) */}
                      <div
                        className="bg-violet-600 text-xs font-semibold text-white flex items-center justify-center h-full w-full"
                        style={{ display: profileImage ? "none" : "flex" }}
                      >
                        {userName?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    </div>
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

          {/* Dashboard Page */}
          {activePage === "dashboard" && (
            <>
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((card) => (
                  <KpiCard key={card.title} {...card} />
                ))}
              </section>

              <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    Monthly Attendance
                  </h2>
                  <CustomLineChart
                    data={displayAttendance}
                    lines={[{ dataKey: "attendance", color: "#6366f1" }]}
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    Task Completion
                  </h2>
                  <CustomBarChart
                    data={displayTasks}
                    xKey="month"
                    yKey="completed"
                    barColor="#3b82f6"
                  />
                </div>
              </section>

              <DepartmentStaffTable
                title="Staff Overview Table"
                employees={displayEmployees}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
                initialLimit={5}
                showMoreEnabled={false}
              />
            </>
          )}

          {activePage === "employees" && (
            <DepartmentStaffTable
              title="Active Employees"
              employees={displayEmployees.filter(
                (emp) => emp.status?.toLowerCase() === "active",
              )}
              onView={handleView}
              initialLimit={10}
              showMoreEnabled={true}
            />
          )}

          {activePage === "approvals" && (
            <DepartmentStaffTable
              title="Pending Approvals"
              employees={displayEmployees.filter(
                (emp) => emp.status?.toLowerCase() === "pending",
              )}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          )}
          {activePage === "attendance" && (
            <div className="mt-6">
              <Attendance />
            </div>
          )}
          {activePage === "settings" && (
            <div className="mt-6">
              <Setting />
            </div>
          )}

          {/* Profile Modal */}
          {showProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white p-6 rounded-2xl w-[400px] max-w-full">
                <button
                  className="mb-4 text-red-600 font-semibold"
                  onClick={() => setShowProfile(false)}
                >
                  Close
                </button>
                <ProfileView />
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
