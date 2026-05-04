// frontend\src\pages\department\DepartmentHeadDashboard.jsx
import React, { useEffect, useState } from "react";
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
  const [activeUserGroup, setActiveUserGroup] = useState("workspaceAdmin");
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
          const res = await axiosInstance.get("/hr-department/users");
          setAllUsers(res.data.users || []);
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

  const departmentHeadUsers = allUsers.filter(
    (u) => u.originalRole?.toLowerCase() === "department_head",
  );

  const staffUsers = allUsers.filter(
    (u) =>
      u.originalRole?.toLowerCase() === "staff" ||
      u.role?.toLowerCase() === "staff",
  );

  // Get unique departments for filter (from departmentInfo in all users)
  const uniqueDepartments = Array.from(
    new Map(
      allUsers
        .filter((u) => u.departmentInfo && u.departmentInfo._id)
        .map((u) => [u.departmentInfo._id, u.departmentInfo]),
    ).values(),
  );

  // Filtered staff list
  const filteredStaffUsers = staffUsers.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(staffSearch.toLowerCase());
    const matchesDepartment =
      selectedDepartmentFilter === "all" ||
      u.departmentInfo?._id === selectedDepartmentFilter;
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
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              {/* Header */}
              <div className="border-b border-slate-100 px-6 py-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Workspace Users
                    </h2>
                    <p className="mt-0.5 text-sm text-slate-500">
                      Select a user type to view details and list.
                    </p>
                  </div>

                  <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
                    {[
                      { id: "workspaceAdmin", label: "Admin" },
                      { id: "departmentHead", label: "Dept. Heads" },
                      { id: "staff", label: "Staff" },
                    ].map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setActiveUserGroup(group.id)}
                        className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                          activeUserGroup === group.id
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {group.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6">
                {loadingUsers ? (
                  <div className="flex items-center gap-3 py-8 text-sm text-slate-400">
                    <svg
                      className="h-4 w-4 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Loading users...
                  </div>
                ) : (
                  <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
                    {/* Left Panel */}
                    <div>
                      {activeUserGroup === "workspaceAdmin" ? (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Workspace Admin
                          </p>
                          {workspaceAdminUser ? (
                            <div className="flex items-center gap-4">
                              <div
                                className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-purple-100"
                                style={{
                                  background: workspaceAdminUser.profileImage
                                    ? "transparent"
                                    : "#7c3aed",
                                }}
                              >
                                {workspaceAdminUser.profileImage ? (
                                  <img
                                    src={workspaceAdminUser.profileImage}
                                    alt={workspaceAdminUser.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-lg font-semibold text-white">
                                    {workspaceAdminUser.name
                                      ?.charAt(0)
                                      .toUpperCase() || "A"}
                                  </span>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">
                                  {workspaceAdminUser.name}
                                </p>
                                <p className="truncate text-sm text-slate-500">
                                  {workspaceAdminUser.email}
                                </p>
                                <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                                  {workspaceAdminUser.role}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-400">
                              No workspace admin found.
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {activeUserGroup === "departmentHead"
                              ? "Department Heads"
                              : "Staff Members"}
                          </p>

                          {activeUserGroup === "staff" && (
                            <div className="mb-4 space-y-2">
                              <input
                                type="text"
                                placeholder="Search staff..."
                                value={staffSearch}
                                onChange={(e) => setStaffSearch(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <select
                                value={selectedDepartmentFilter}
                                onChange={(e) =>
                                  setSelectedDepartmentFilter(e.target.value)
                                }
                                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="all">All Departments</option>
                                {uniqueDepartments.map((dept) => (
                                  <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {(activeUserGroup === "departmentHead"
                            ? departmentHeadUsers
                            : filteredStaffUsers
                          ).length === 0 ? (
                            <p className="py-4 text-center text-sm text-slate-400">
                              No users found.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                              {(activeUserGroup === "departmentHead"
                                ? departmentHeadUsers
                                : filteredStaffUsers
                              ).map((u) => (
                                <div
                                  key={u._id}
                                  onClick={() => setSelectedUserDetails(u)}
                                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm ${
                                    selectedUserDetails?._id === u._id
                                      ? "border-blue-200 bg-blue-50"
                                      : "border-slate-200 bg-white hover:border-slate-300"
                                  }`}
                                >
                                  <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                                    style={{
                                      background: u.profileImage
                                        ? "transparent"
                                        : "#7c3aed",
                                    }}
                                  >
                                    {u.profileImage ? (
                                      <img
                                        src={u.profileImage}
                                        alt={u.name}
                                        className="h-full w-full object-cover"
                                      />
                                    ) : (
                                      <span className="text-sm font-semibold text-white">
                                        {u.name?.charAt(0).toUpperCase()}
                                      </span>
                                    )}
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-slate-900">
                                      {u.name}
                                    </p>
                                    <p className="truncate text-xs text-slate-500">
                                      {u.email}
                                    </p>
                                    {u.departmentInfo && (
                                      <p className="truncate text-xs text-slate-400">
                                        {u.departmentInfo.name}
                                      </p>
                                    )}
                                  </div>

                                  {selectedUserDetails?._id === u._id && (
                                    <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Panel — User Detail */}
                    {selectedUserDetails &&
                      activeUserGroup !== "workspaceAdmin" && (
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                          <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                            {selectedUserDetails.originalRole ===
                            "department_head"
                              ? "Department Head"
                              : "Staff"}{" "}
                            Detail
                          </p>

                          <div className="flex flex-col items-center gap-4 text-center">
                            <div
                              className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-4 ring-purple-50"
                              style={{
                                background: selectedUserDetails.profileImage
                                  ? "transparent"
                                  : "#7c3aed",
                              }}
                            >
                              {selectedUserDetails.profileImage ? (
                                <img
                                  src={selectedUserDetails.profileImage}
                                  alt={selectedUserDetails.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <span className="text-2xl font-semibold text-white">
                                  {selectedUserDetails.name
                                    ?.charAt(0)
                                    .toUpperCase() || "U"}
                                </span>
                              )}
                            </div>

                            <div className="w-full space-y-1">
                              <p className="text-base font-semibold text-slate-900">
                                {selectedUserDetails.name}
                              </p>
                              <p className="text-sm text-slate-500">
                                {selectedUserDetails.email}
                              </p>
                              {/* ✅ department_head ke liye departmentId.head show karo */}
                              <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                                {selectedUserDetails.originalRole ===
                                "department_head"
                                  ? selectedUserDetails.departmentId?.head ||
                                    selectedUserDetails.role
                                  : selectedUserDetails.role}
                              </span>
                            </div>

                            {selectedUserDetails.departmentId && (
                              <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-xs text-slate-400">
                                  Department
                                </p>
                                <p className="mt-0.5 text-sm font-medium text-slate-700">
                                  {selectedUserDetails.departmentInfo?.name ||
                                    selectedUserDetails.departmentId?.name}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                )}
              </div>
            </div>
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
