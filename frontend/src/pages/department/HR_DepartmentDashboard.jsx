// frontend\src\pages\department\DepartmentHeadDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import useDropdown from "../../hooks/useDropdown";
import useUserProfile from "../../hooks/useUserProfile";
import useAuthActions from "../../hooks/useAuthActions";
import useStaffOverview from "../../hooks/useStaffOverview";
import axiosInstance from "../../api/axiosInstance";

import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import DepartmentStaffTable from "./components/DepartmentStaffTable";
import ProfileView from "../../components/ProfileView";
import WorkspaceUsersSection from "./components/WorkspaceUsersSection";
import ReportTableSection from "./components/ReportTableSection";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import Attendance from "../../components/Attendance";
import { getWorkspaceLogo } from "../../utils/logoHelper";
import Setting from "./components/CustomSettingsForDepartments";
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
  const [allUsers, setAllUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [reportItems, setReportItems] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeUserGroup, setActiveUserGroup] = useState("workspaceAdmin");
  const [activeReportGroup, setActiveReportGroup] = useState("all");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] =
    useState("all");

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

  // Fetch all users when employees page is active
  useEffect(() => {
    if (activePage === "employees") {
      const fetchAllUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await axiosInstance.get("/users/workspace-users");
          const users = Array.isArray(res.data?.users)
            ? res.data.users
            : Array.isArray(res.data)
              ? res.data
              : [];
          setAllUsers(users);
        } catch (err) {
          console.error(
            "Error fetching users:",
            err?.response?.data || err.message,
          );
          setAllUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchAllUsers();
    }
  }, [activePage]);

  useEffect(() => {
    if (activePage === "reports") {
      const fetchReports = async () => {
        setLoadingReports(true);
        try {
          const res = await axiosInstance.get("/attendance/reports");
          setReportItems(res.data.reports || []);
        } catch (err) {
          console.error(
            "Error fetching attendance reports:",
            err?.response?.data || err.message,
          );
          setReportItems([]);
        } finally {
          setLoadingReports(false);
        }
      };
      fetchReports();
    }
  }, [activePage]);

  // Dummy fallback data
  const dummyDepartment = {
    department: "HR Department",
    workspaceId: { name: "FactoryHub Workspace", logo: "" },
    pendingApprovals: 4,
    activeTasks: 12,
    attendanceRate: 92,
  };

  const departmentData = department || dummyDepartment;
  const displayEmployees = Array.isArray(staffRequests) ? staffRequests : [];
  const displayRole = user?.departmentId?.head || role;

  // ✅ originalRole se filter karo — role ab resolved hai (e.g. "Recuriter")
  const workspaceAdminUser = allUsers.find((u) =>
    ["general_manager", "industry_head", "workspace_admin", "admin"].includes(
      u.originalRole?.toLowerCase() || u.role?.toLowerCase(),
    ),
  );

  const workspaceAdminLabel = useMemo(() => {
    if (!workspaceAdminUser) {
      return "Workspace Admin";
    }
    const roleKey = (
      workspaceAdminUser?.originalRole ||
      workspaceAdminUser?.role ||
      ""
    ).toLowerCase();
    const roleLabelMap = {
      general_manager: "General Manager",
      industry_head: "Industry Head",
      workspace_admin: "Workspace Admin",
      admin: "Admin",
    };
    return (
      roleLabelMap[roleKey] ||
      workspaceAdminUser?.originalRole ||
      workspaceAdminUser?.role ||
      "Admin"
    );
  }, [workspaceAdminUser]);

  const departmentHeadUsers = allUsers.filter(
    (u) => u.role?.toLowerCase() === u.departmentInfo?.head?.toLowerCase(),
  );

  const staffUsers = allUsers.filter(
    (u) =>
      u.originalRole?.toLowerCase() === "staff" ||
      u.originalRole?.toLowerCase() === "employee" ||
      u.role?.toLowerCase() === "staff" ||
      u.role?.toLowerCase() === "employee",
  );

  // Get unique departments for filter (from departmentInfo in all users)
  const getDepartmentId = (u) =>
    u.departmentInfo?._id ||
    u.departmentId?._id ||
    (typeof u.departmentId === "string" ? u.departmentId : null);

  const getDepartmentName = (u) =>
    u.departmentInfo?.name ||
    u.departmentInfo?.department ||
    u.departmentInfo?.departmentName ||
    u.departmentId?.name ||
    u.departmentId?.department ||
    u.departmentId?.departmentName ||
    u.departmentName ||
    null;

  const uniqueDepartments = Array.from(
    new Map(
      allUsers
        .map((u) => {
          const id = getDepartmentId(u);
          const name = getDepartmentName(u);
          return id && name ? [String(id), { _id: String(id), name }] : null;
        })
        .filter(Boolean),
    ).values(),
  );

  // Filtered staff list
  const filteredStaffUsers = staffUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesDepartment =
      selectedDepartmentFilter === "all" ||
      String(getDepartmentId(u)) === selectedDepartmentFilter;
    return matchesSearch && matchesDepartment;
  });

  useEffect(() => {
    if (activeUserGroup === "workspaceAdmin") {
      setSelectedUserDetails(workspaceAdminUser || null);
    } else {
      setSelectedUserDetails(null);
    }
  }, [activeUserGroup, workspaceAdminUser]);

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

  const handleApproveReport = async (id) => {
    try {
      await axiosInstance.patch(`/attendance/report/${id}/approve`);
      setReportItems((prev) => prev.filter((report) => report._id !== id));
    } catch (err) {
      console.error("Approve report error:", err.response?.data || err.message);
    }
  };

  const handleRejectReport = async (id) => {
    try {
      await axiosInstance.patch(`/attendance/report/${id}/reject`);
      setReportItems((prev) => prev.filter((report) => report._id !== id));
    } catch (err) {
      console.error("Reject report error:", err.response?.data || err.message);
    }
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
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
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
            <WorkspaceUsersSection
              title="Workspace Users"
              subtitle="Select a user type to view details and list."
              workspaceAdminLabel={workspaceAdminLabel}
              groupOptions={[
                { id: "workspaceAdmin", label: workspaceAdminLabel },
                { id: "departmentHead", label: "Dept. Heads" },
                { id: "staff", label: "Staff" },
              ]}
              activeUserGroup={activeUserGroup}
              onGroupChange={setActiveUserGroup}
              loadingUsers={loadingUsers}
              workspaceAdminUser={workspaceAdminUser}
              departmentHeadUsers={departmentHeadUsers}
              filteredStaffUsers={filteredStaffUsers}
              selectedUserDetails={selectedUserDetails}
              setSelectedUserDetails={setSelectedUserDetails}
              staffSearch={staffSearch}
              onStaffSearchChange={(value) => setStaffSearch(value)}
              selectedDepartmentFilter={selectedDepartmentFilter}
              onDepartmentFilterChange={(value) =>
                setSelectedDepartmentFilter(value)
              }
              uniqueDepartments={uniqueDepartments}
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

          {activePage === "reports" && (
            <ReportTableSection
              title="Attendance Reports"
              subtitle="Review absent attendance reports and approve them for present status."
              loadingReports={loadingReports}
              reportItems={reportItems}
              onApproveReport={handleApproveReport}
              onRejectReport={handleRejectReport}
              emptyMessage="No pending absence reports found."
              showAssignedHR
              groupOptions={[
                { id: "all", label: "All" },
                { id: "workspaceAdmin", label: workspaceAdminLabel },
                { id: "departmentHead", label: "Dept. Heads" },
                { id: "staff", label: "Staff" },
              ]}
              activeGroup={activeReportGroup}
              onGroupChange={setActiveReportGroup}
            />
          )}

          {activePage === "settings" && (
            <div className="mt-6">
              <Setting />
            </div>
          )}

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
