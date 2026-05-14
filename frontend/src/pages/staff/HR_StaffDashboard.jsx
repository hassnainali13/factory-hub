// frontend/src/pages/HR_staff/HR_StaffDashboard.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import useDropdown from "../../hooks/useDropdown";
import useAuthActions from "../../hooks/useAuthActions";
import axiosInstance from "../../api/axiosInstance";

import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import ProfileView from "../../components/ProfileView";
import WorkspaceUsersSection from "../department/components/WorkspaceUsersSection";
import ReportTableSection from "../department/components/ReportTableSection";
import CustomLineChart from "../../components/LineChart";
import Attendance from "../../components/Attendance";
import { getWorkspaceLogo } from "../../utils/logoHelper";
import Setting from "./components/CustomSettingsForStaff";

import {
  Bell,
  Search,
  LayoutDashboard,
  Users,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  Shield,
  Settings,
} from "lucide-react";

export default function HR_StaffDashboard() {
  const { logout, loading } = useAuthActions();
  const navigate = useNavigate();
  const { open, toggle, ref: dropdownRef } = useDropdown();

  const [profile, setProfile] = useState(
    JSON.parse(localStorage.getItem("user")) || { name: "User", email: "" },
  );
  const [department, setDepartment] = useState(null);
  const [workspaceUsers, setWorkspaceUsers] = useState([]);
  const [reportItems, setReportItems] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  // ✅ Search + Filter state
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] =
    useState("all");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [activeUserGroup, setActiveUserGroup] = useState("staff");
  const [activeReportGroup, setActiveReportGroup] = useState("all");

  const attendanceData = [
    { month: "Jan", attendance: 85 },
    { month: "Feb", attendance: 90 },
    { month: "Mar", attendance: 92 },
    { month: "Apr", attendance: 88 },
    { month: "May", attendance: 94 },
  ];

  const myTasks = [
    {
      id: "t1",
      title: "Onboard new employee",
      status: "In Progress",
      priority: "High",
    },
    {
      id: "t2",
      title: "Update HR records",
      status: "Pending",
      priority: "Medium",
    },
    {
      id: "t3",
      title: "Prepare offer letters",
      status: "Not Started",
      priority: "Urgent",
    },
    {
      id: "t4",
      title: "Coordinate interviews",
      status: "Completed",
      priority: "Low",
    },
  ];

  useEffect(() => {
    if (profile?.profileImage) {
      setProfileImage(profile.profileImage);
    }
  }, [profile]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/users/me");
        setProfile(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } catch (err) {
        console.error("Profile fetch error:", err?.message);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axiosInstance.get("/departments/my-department");
        setDepartment(res.data.department || null);
      } catch (err) {
        console.error("Department fetch error:", err?.message);
      }
    };
    fetchDepartment();
  }, []);

  const fetchWorkspaceUsers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/users/workspace-users");
      const users = Array.isArray(res.data?.users)
        ? res.data.users
        : Array.isArray(res.data)
          ? res.data
          : [];
      setWorkspaceUsers(users);
    } catch (err) {
      console.error("Error fetching workspace users:", err?.message);
      setWorkspaceUsers([]);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaceUsers();
  }, [fetchWorkspaceUsers]);

  useEffect(() => {
    if (activePage === "reports") {
      const fetchReports = async () => {
        setLoadingReports(true);
        try {
          const res = await axiosInstance.get("/attendance/reports");
          setReportItems(res.data.reports || []);
        } catch (err) {
          console.error(
            "Error fetching my assigned reports:",
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

  const allEmployees = Array.isArray(workspaceUsers) ? workspaceUsers : [];
  const activeEmployees = allEmployees.filter(
    (emp) => emp.status?.toLowerCase() === "active",
  );

  // ✅ Staff users — originalRole se filter
  const staffUsers = allEmployees.filter(
    (u) =>
      u.originalRole?.toLowerCase() === "staff" ||
      u.role?.toLowerCase() === "staff",
  );

  // ✅ Unique departments — departmentInfo se (staff ke liye staffDepartment resolve ho chuka hai backend mein)
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
      staffUsers
        .map((u) => {
          const id = getDepartmentId(u);
          const name = getDepartmentName(u);
          return id && name ? [String(id), { _id: String(id), name }] : null;
        })
        .filter(Boolean),
    ).values(),
  );

  // ✅ Filtered staff — search + department filter
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
    if (activeUserGroup === "staff") {
      setSelectedUserDetails(null);
    }
  }, [activeUserGroup]);

  const dummyDept = {
    department: "HR Department",
    workspaceId: { name: "FactoryHub Workspace", logo: "" },
    attendanceRate: 92,
  };
  const departmentData = department || dummyDept;

  const kpiCards = [
    {
      title: "Total Employees",
      value: allEmployees.length,
      delta: "+ Updated",
      icon: Users,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Active Employees",
      value: activeEmployees.length,
      delta: "Currently active",
      icon: ClipboardList,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "My Tasks",
      value: myTasks.length,
      delta: "Assigned to me",
      icon: Shield,
      accent: "text-orange-700",
      bg: "bg-orange-50",
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

  const userInitial = profile?.name?.charAt(0)?.toUpperCase() || "U";

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
                    {departmentData.department || "HR Department"}
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
                  icon={Users}
                  label="Employees"
                  active={activePage === "employees"}
                  onClick={() => setActivePage("employees")}
                />
                <SidebarItem
                  icon={Shield}
                  label="My Tasks"
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
                {departmentData.department || "HR Department"}, Staff Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {profile.name}
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
                      {userInitial}
                    </div>
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-slate-900">
                      {profile.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {profile.email}
                    </p>
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
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm min-h-[300px] w-full">
                  <h2 className="text-base font-semibold text-slate-900">
                    My Monthly Attendance
                  </h2>
                  <div className="w-full h-[250px]">
                    <CustomLineChart
                      data={attendanceData}
                      lines={[{ dataKey: "attendance", color: "#6366f1" }]}
                    />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900 mb-4">
                    My Tasks
                  </h2>
                  <div className="space-y-3">
                    {myTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {task.title}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {task.status}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded-full
                            ${task.priority === "Urgent" ? "bg-red-100 text-red-600" : ""}
                            ${task.priority === "High" ? "bg-orange-100 text-orange-600" : ""}
                            ${task.priority === "Medium" ? "bg-yellow-100 text-yellow-600" : ""}
                            ${task.priority === "Low" ? "bg-green-100 text-green-600" : ""}
                          `}
                        >
                          {task.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Employees Page */}
          {activePage === "employees" && (
            <WorkspaceUsersSection
              title="Workspace Staff"
              subtitle="View staff details."
              groupOptions={[{ id: "staff", label: "Staff" }]}
              activeUserGroup={activeUserGroup}
              onGroupChange={setActiveUserGroup}
              loadingUsers={false}
              workspaceAdminUser={null}
              departmentHeadUsers={[]}
              filteredStaffUsers={filteredStaffUsers}
              selectedUserDetails={selectedUserDetails}
              setSelectedUserDetails={setSelectedUserDetails}
              staffSearch={staffSearch}
              onStaffSearchChange={(value) => {
                setStaffSearch(value);
                setSelectedUserDetails(null);
              }}
              selectedDepartmentFilter={selectedDepartmentFilter}
              onDepartmentFilterChange={(value) => {
                setSelectedDepartmentFilter(value);
                setSelectedUserDetails(null);
              }}
              uniqueDepartments={uniqueDepartments}
            />
          )}

          {activePage === "settings" && (
            <div className="mt-6">
              <Setting />
            </div>
          )}

          {activePage === "tasks" && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                My Tasks
              </h2>
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {task.status}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full
                        ${task.priority === "Urgent" ? "bg-red-100 text-red-600" : ""}
                        ${task.priority === "High" ? "bg-orange-100 text-orange-600" : ""}
                        ${task.priority === "Medium" ? "bg-yellow-100 text-yellow-600" : ""}
                        ${task.priority === "Low" ? "bg-green-100 text-green-600" : ""}
                      `}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === "attendance" && (
            <div className="mt-6">
              <Attendance />
            </div>
          )}

          {activePage === "reports" && (
            <ReportTableSection
              title="My Assigned Reports"
              subtitle="This list is distributed across HR staff by load."
              loadingReports={loadingReports}
              reportItems={reportItems}
              onApproveReport={handleApproveReport}
              onRejectReport={handleRejectReport}
              emptyMessage="No assigned attendance reports available."
              groupOptions={[
                { id: "all", label: "All" },
                { id: "workspaceAdmin", label: "Admin" },
                { id: "departmentHead", label: "Dept. Heads" },
                { id: "staff", label: "Staff" },
              ]}
              activeGroup={activeReportGroup}
              onGroupChange={setActiveReportGroup}
            />
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
                <ProfileView
                  name={profile.name}
                  email={profile.email}
                  profileImage={profile.profileImage}
                  initials={userInitial}
                />
              </div>
            </div>
          )}

          <Outlet />
        </main>
      </div>
    </div>
  );
}
