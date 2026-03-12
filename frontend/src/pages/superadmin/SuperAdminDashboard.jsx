//frontend\src\pages\superadmin\SuperAdminDashboard.jsx
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import useAllWorkspaces from "../../hooks/useViewWorkspaces";
import WorkspacesOverviewTable from "./components/WorkspacesOverviewTable";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import WorkspaceDetailModal from "./components/WorkspaceDetailModal";
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

  const toggleDropdown = () => setOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };
  const [activePage, setActivePage] = useState("dashboard");

  const {
    workspaces,
    users,
    loading,
    error,
    approveWorkspace,
    rejectWorkspace,
  } = useAllWorkspaces();

  const [workspaceLimit, setWorkspaceLimit] = useState(10);

  // ✅ Hooks ALWAYS here (no condition)
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

  // ✅ Ab returns
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
    // unique admin count
    return acc + (w.createdBy ? 1 : 0);
  }, 0);

  const totalEmployees = users?.length || 0;

  const pendingApprovals =
    workspaces?.filter((w) => w.status === "pending")?.length || 0;

  // ✅ KpiCards define karna
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
        {/* Sidebar */}
        <aside className="hidden w-[260px] shrink-0 md:block">
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
                  label="Admin Management"
                  active={activePage === "admins"}
                  onClick={() => setActivePage("admins")}
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Topbar (same) */}
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

          {/* ========================= */}
          {/* DASHBOARD PAGE */}
          {/* ========================= */}
          {activePage === "dashboard" && (
            <>
              {/* KPI Cards */}
              <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {kpiCards.map((c) => (
                  <KpiCard key={c.title} {...c} />
                ))}
              </section>

              {/* Charts */}
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
              {/* Workspaces Overview (ONLY 5) */}
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

          {/* ========================= */}
          {/* WORKSPACES PAGE */}
          {/* ========================= */}
          {activePage === "workspaces" && (
            <>
              <WorkspacesOverviewTable
                title="Active Workspaces"
                workspaces={activeWorkspaces} // ✅ only active
                approveWorkspace={approveWorkspace}
                rejectWorkspace={rejectWorkspace}
                openWorkspace={openWorkspace}
                setOpenWorkspace={setOpenWorkspace}
                onCloseModal={() => setOpenWorkspace(null)}
                WorkspaceDetailModal={WorkspaceDetailModal}
                apiBaseUrl="http://localhost:5000"
              />

              {/* Show More */}
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
          {/* ========================= */}
          {/* Aprovals PAGE */}
          {/* ========================= */}
          {activePage === "approvals" && (
            <WorkspacesOverviewTable
              title="Pending Approvals"
              workspaces={pendingWorkspaces} // ✅ only pending
              approveWorkspace={approveWorkspace}
              rejectWorkspace={rejectWorkspace}
              openWorkspace={openWorkspace}
              setOpenWorkspace={setOpenWorkspace}
              onCloseModal={() => setOpenWorkspace(null)}
              WorkspaceDetailModal={WorkspaceDetailModal}
              apiBaseUrl="http://localhost:5000"
            />
          )}

          {/* Baaki pages future me */}
          {activePage !== "dashboard" &&
            activePage !== "workspaces" &&
            activePage !== "approvals" && (
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
