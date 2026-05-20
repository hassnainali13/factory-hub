//frontend\src\pages\superadmin\SuperAdminDashboard.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import SidebarItem from "../../components/SidebarItem";
import StatusPill from "../../components/StatusPill";
import KpiCard from "../../components/KpiCard";
import useAllWorkspaces from "../../hooks/useViewWorkspaces";
import useNotifications from "../../hooks/useNotifications";
import WorkspacesOverviewTable from "./components/WorkspacesOverviewTable";
import WorkspaceEmployeesPanel from "./components/WorkspaceEmployeesPanel";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import WorkspaceDetailModal from "./components/WorkspaceDetailModal";
import NotificationDropdown from "../../components/NotificationDropdown";
import {
  Bell,
  Search,
  LayoutDashboard,
  Boxes,
  CheckSquare,
  Shield,
  Users,
  FileBarChart2,
  ClipboardList,
  Settings,
  Building2,
} from "lucide-react";

const employeesPerWorkspace = [
  { name: "Oil Factory", employees: 145 },
  { name: "Feed Mill", employees: 98 },
  { name: "Flour Mill", employees: 112 },
  { name: "Warehouse", employees: 66 },
  { name: "Logistics", employees: 55 },
];

const monthlyGrowth = [
  { month: "Jan", users: 310, approvals: 18 },
  { month: "Feb", users: 365, approvals: 22 },
  { month: "Mar", users: 405, approvals: 19 },
  { month: "Apr", users: 470, approvals: 27 },
  { month: "May", users: 525, approvals: 24 },
  { month: "Jun", users: 590, approvals: 31 },
];

export default function SuperAdminDashboard() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [openWorkspace, setOpenWorkspace] = useState(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };
  const [activePage, setActivePage] = useState("dashboard");

  const { notifications, unreadCount, markAsRead } = useNotifications();

  const {
    workspaces,
    users,
    departments,
    staffs,
    loading,
    error,
    approveWorkspace,
    rejectWorkspace,
    toggleWorkspaceStatus,
  } = useAllWorkspaces();

  const selectedWorkspace = useMemo(
    () => workspaces.find((w) => w._id === selectedWorkspaceId),
    [workspaces, selectedWorkspaceId],
  );

  const workspaceUsers = useMemo(() => {
    if (!selectedWorkspaceId) return [];

    const workspaceDepartmentIds = departments
      .filter((d) => String(d.workspaceId) === String(selectedWorkspaceId))
      .map((d) => String(d._id));

    const workspaceStaffIds = staffs
      .filter((s) =>
        workspaceDepartmentIds.includes(
          String(s.departmentId?._id || s.departmentId || ""),
        ),
      )
      .map((s) => String(s._id));

    const departmentById = new Map(departments.map((d) => [String(d._id), d]));
    const staffById = new Map(staffs.map((s) => [String(s._id), s]));

    const uniqueUsers = new Map();

    users.forEach((user) => {
      const userDeptId =
        user.departmentId?._id ||
        (typeof user.departmentId === "string" ? user.departmentId : null);
      const userStaffId =
        user.staffId?._id ||
        (typeof user.staffId === "string" ? user.staffId : null);

      const staffRecord = userStaffId && staffById.get(String(userStaffId));
      const staffDeptId =
        staffRecord?.departmentId?._id ||
        (typeof staffRecord?.departmentId === "string"
          ? staffRecord.departmentId
          : null);

      const resolvedDeptId = userDeptId || staffDeptId;

      const isDirect = String(user.workspaceId) === String(selectedWorkspaceId);
      const isDepartment =
        resolvedDeptId &&
        workspaceDepartmentIds.includes(String(resolvedDeptId));
      const isStaff =
        userStaffId && workspaceStaffIds.includes(String(userStaffId));

      if (isDirect || isDepartment || isStaff) {
        const dept = departmentById.get(String(resolvedDeptId));
        const displayRole = user.role || user.originalRole || "User";

        uniqueUsers.set(user._id, {
          ...user,
          displayRole,
          membershipType: isDirect
            ? "Direct Workspace"
            : isDepartment
              ? "Department"
              : "Staff",
          departmentName:
            dept?.name || dept?.department || dept?.departmentName || "N/A",
          departmentInfo: dept
            ? {
                _id: String(dept._id),
                name:
                  dept.name || dept.department || dept.departmentName || "N/A",
              }
            : null,
          staffName: staffRecord?.name || staffRecord?.staffName || "N/A",
        });
      }
    });

    return Array.from(uniqueUsers.values());
  }, [selectedWorkspaceId, users, departments, staffs]);

  // ── Fixed: selected workspace ke departments normalize karke pass karo ────
  const selectedWorkspaceDepartments = useMemo(() => {
    if (!selectedWorkspaceId) return [];
    return departments
      .filter(
        (d) =>
          String(d.workspaceId?._id || d.workspaceId) ===
          String(selectedWorkspaceId),
      )
      .map((d) => ({
        _id: String(d._id || d.id),
        name:
          d.name || d.department || d.departmentName || d.title || "Unnamed",
        deptHeadId: String(d.deptHeadId || ""),
      }));
  }, [departments, selectedWorkspaceId]);

  const [workspaceLimit, setWorkspaceLimit] = useState(10);

  const overviewWorkspaces = useMemo(() => {
    return Array.isArray(workspaces) ? workspaces.slice(0, 5) : [];
  }, [workspaces]);

  const workspacePageWorkspaces = useMemo(() => {
    return Array.isArray(workspaces) ? workspaces.slice(0, workspaceLimit) : [];
  }, [workspaces, workspaceLimit]);

  const activeWorkspaces = useMemo(
    () => workspaces?.filter((w) => w.status === "active") || [],
    [workspaces],
  );
  const pendingWorkspaces = useMemo(
    () => workspaces?.filter((w) => w.status === "pending") || [],
    [workspaces],
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
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const totalWorkspaces = workspaces?.length || 0;

  const totalAdmins = workspaces?.reduce((acc, w) => {
    return acc + (w.createdBy ? 1 : 0);
  }, 0);

  const totalEmployees = users?.length || 0;

  const pendingApprovals =
    workspaces?.filter((w) => w.status === "pending")?.length || 0;

  const kpiCards = [
    {
      title: "Total Workspaces",
      value: totalWorkspaces,
      delta: "+2 this month",
      icon: Boxes,
      accent: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      title: "Total Admins",
      value: totalAdmins,
      delta: "+3 this month",
      icon: Shield,
      accent: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      title: "Total Employees",
      value: totalEmployees,
      delta: "+42 this month",
      icon: Users,
      accent: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      delta: "Requires attention",
      icon: CheckSquare,
      accent: "text-orange-700",
      bg: "bg-orange-50",
      border: "border-orange-200",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1440px] gap-6 p-4 md:p-6">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[260px] shrink-0 bg-white border-r border-slate-200 p-4 shadow-lg transition-transform
  md:static md:translate-x-0 md:block
  ${showSidebar ? "translate-x-0" : "-translate-x-full"}
`}
        >
          <div className="sticky top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3 px-2">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    FactoryHub
                  </p>
                  <p className="text-xs text-slate-500">Super Admin</p>
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
                  label="Workspaces"
                  active={activePage === "workspaces"}
                  onClick={() => setActivePage("workspaces")}
                />
                <SidebarItem
                  icon={CheckSquare}
                  label="Approvals"
                  active={activePage === "approvals"}
                  onClick={() => setActivePage("approvals")}
                />
                <SidebarItem
                  icon={Shield}
                  label="Workspace Management"
                  active={activePage === "Manage_Workspaces"}
                  onClick={() => setActivePage("Manage_Workspaces")}
                />
                <SidebarItem
                  icon={Users}
                  label="Employees"
                  active={activePage === "employees"}
                  onClick={() => setActivePage("employees")}
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

        {showSidebar && (
          <div
            className="fixed inset-0 z-40 bg-black/30 md:hidden"
            onClick={() => setShowSidebar(false)}
          />
        )}

        <main className="flex-1 min-w-0">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                FactoryHub, Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back! Here's an overview of your Workspaces performance.
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

              <div className="relative">
                <button
                  onClick={() => setShowNotifications((prev) => !prev)}
                  className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                <NotificationDropdown
                  showNotifications={showNotifications}
                  setShowNotifications={setShowNotifications}
                  notifications={notifications}
                  unreadCount={unreadCount}
                  markAsRead={markAsRead}
                />
              </div>

              <div className="relative inline-block text-left">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition-colors"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                    SA
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-medium text-slate-900 leading-tight">
                      Super Admin
                    </p>
                    <p className="text-[10px] text-slate-500">
                      sa@factoryhub.com
                    </p>
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
                    <button
                      onClick={() => console.log("Profile View clicked")}
                      className="w-full px-4 py-2.5 text-left text-sm text-slate-900 hover:bg-slate-100 transition"
                    >
                      Profile View
                    </button>
                    <div className="h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DASHBOARD PAGE */}
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
                    Employees per Workspace
                  </h2>
                  <CustomBarChart
                    data={employeesPerWorkspace}
                    xKey="name"
                    yKey="employees"
                  />
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-base font-semibold text-slate-900">
                    Monthly Growth
                  </h2>
                  <CustomLineChart
                    data={monthlyGrowth}
                    lines={[
                      { dataKey: "users", color: "#6366f1" },
                      { dataKey: "approvals", color: "#f59e0b" },
                    ]}
                  />
                </div>
              </section>

              <WorkspacesOverviewTable
                title="Workspaces Overview"
                workspaces={overviewWorkspaces}
                approveWorkspace={approveWorkspace}
                rejectWorkspace={rejectWorkspace}
                openWorkspace={openWorkspace}
                setOpenWorkspace={setOpenWorkspace}
                onCloseModal={() => setOpenWorkspace(null)}
                WorkspaceDetailModal={WorkspaceDetailModal}
                onViewAll={() => {
                  setActivePage("workspaces");
                  setWorkspaceLimit(10);
                }}
                apiBaseUrl="http://localhost:5000"
              />
            </>
          )}

          {/* WORKSPACES PAGE */}
          {activePage === "workspaces" && (
            <>
              <WorkspacesOverviewTable
                title="Active Workspaces"
                workspaces={activeWorkspaces}
                approveWorkspace={approveWorkspace}
                rejectWorkspace={rejectWorkspace}
                openWorkspace={openWorkspace}
                setOpenWorkspace={setOpenWorkspace}
                onCloseModal={() => setOpenWorkspace(null)}
                WorkspaceDetailModal={WorkspaceDetailModal}
                apiBaseUrl="http://localhost:5000"
              />
              {workspaces.length > workspaceLimit && (
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => setWorkspaceLimit((prev) => prev + 10)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Show More
                  </button>
                </div>
              )}
            </>
          )}

          {/* APPROVALS PAGE */}
          {activePage === "approvals" && (
            <WorkspacesOverviewTable
              title="Pending Approvals"
              workspaces={pendingWorkspaces}
              approveWorkspace={approveWorkspace}
              rejectWorkspace={rejectWorkspace}
              openWorkspace={openWorkspace}
              setOpenWorkspace={setOpenWorkspace}
              onCloseModal={() => setOpenWorkspace(null)}
              WorkspaceDetailModal={WorkspaceDetailModal}
              apiBaseUrl="http://localhost:5000"
            />
          )}

          {/* MANAGE WORKSPACES PAGE */}
          {activePage === "Manage_Workspaces" && (
            <WorkspacesOverviewTable
              title="Workspace Management"
              workspaces={workspaces}
              toggleWorkspaceStatus={toggleWorkspaceStatus}
              approveWorkspace={approveWorkspace}
              rejectWorkspace={rejectWorkspace}
              openWorkspace={openWorkspace}
              setOpenWorkspace={setOpenWorkspace}
              onCloseModal={() => setOpenWorkspace(null)}
              WorkspaceDetailModal={WorkspaceDetailModal}
              apiBaseUrl="http://localhost:5000"
            />
          )}

          {/* EMPLOYEES PAGE */}
          {activePage === "employees" && (
            <WorkspaceEmployeesPanel
              workspaces={workspaces}
              selectedWorkspaceId={selectedWorkspaceId}
              setSelectedWorkspaceId={setSelectedWorkspaceId}
              selectedWorkspace={selectedWorkspace}
              workspaceUsers={workspaceUsers}
              loadingUsers={loading}
              // ── Fixed: normalized departments with name field ──
              uniqueDepartments={selectedWorkspaceDepartments}
            />
          )}

          {activePage !== "dashboard" &&
            activePage !== "workspaces" &&
            activePage !== "approvals" &&
            activePage !== "employees" && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-600">
                  This section will be implemented soon.
                </p>
              </div>
            )}
        </main>
      </div>
    </div>
  );
}
