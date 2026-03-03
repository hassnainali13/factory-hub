import React, { useState } from "react";
import useDropdown from "../../hooks/useDropdown";
import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import { useNavigate } from "react-router-dom";

import AttendanceSummaryCard from "../../components/AttendanceSummaryCard";
import CustomLineChart from "../../components/LineChart";
import MyTasksCard from "./components/MyTasksCard";
import SalaryInfoCard from "./components/SalaryInfoCard";

import {
  Bell,
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardList,
  TrendingUp,
  FileBarChart2,
  Shield,
  Settings,
  DollarSign,
} from "lucide-react";

export default function DepartmentHeadDashboard() {
  const { open, toggle, ref } = useDropdown();
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("dashboard");

  /* =======================
     DUMMY USER (PROFILE)
  ======================= */
  const user = {
    name: "John Smith",
    email: "john.smith@factoryhub.com",
  };

  /* =======================
     DUMMY WORKSPACE/DEPT
  ======================= */
  const departmentData = {
    department: "HR Department",
    workspaceId: {
      name: "FactoryHub Workspace",
      logo: "", // empty -> fallback image
    },
    pendingApprovals: 4,
    activeTasks: 12,
    attendanceRate: 92,
  };

  /* =======================
     DUMMY EMPLOYEES
  ======================= */
  const displayEmployees = [
    { _id: "emp1", name: "Ahmed Khan", age: 28, joinedDate: "2022-03-15", status: "active" },
    { _id: "emp2", name: "Sara Ali", age: 26, joinedDate: "2023-01-12", status: "active" },
    { _id: "emp3", name: "Hassan Raza", age: 31, joinedDate: "2021-10-05", status: "pending" },
  ];

  /* =======================
     DUMMY ATTENDANCE CHART
  ======================= */
  const displayAttendance = [
    { month: "Jan", attendance: 85 },
    { month: "Feb", attendance: 90 },
    { month: "Mar", attendance: 92 },
    { month: "Apr", attendance: 88 },
    { month: "May", attendance: 94 },
  ];

  /* =======================
     DUMMY TASKS (MY TASKS)
  ======================= */
  const dummyMyTasks = [
    { id: "t1", title: "Complete monthly production report", date: "Mar 5, 2026", status: "In Progress", priority: "High" },
    { id: "t2", title: "Review safety compliance checklist", date: "Mar 3, 2026", status: "Pending", priority: "Urgent" },
    { id: "t3", title: "Team performance evaluation", date: "Mar 8, 2026", status: "Not Started", priority: "Medium" },
    { id: "t4", title: "Update equipment maintenance log", date: "Mar 4, 2026", status: "In Progress", priority: "Low" },
    { id: "t5", title: "Prepare weekly status presentation", date: "Mar 6, 2026", status: "Completed", priority: "Medium" },
  ];

  /* =======================
     KPI CARDS (DUMMY)
  ======================= */
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
      bg: "bg-violet-50",
      accent: "text-violet-600",
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
                <div className="h-10 w-10 overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                  <img
                    src={
                      departmentData.workspaceId?.logo
                        ? departmentData.workspaceId.logo
                        : "/default-workspace.png"
                    }
                    alt="Workspace Logo"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {departmentData.workspaceId?.name}
                  </p>
                  <p className="text-xs text-slate-500">{departmentData.department}</p>
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
                  icon={DollarSign}
                  label="Salary"
                  active={activePage === "salary"}
                  onClick={() => setActivePage("salary")}
                />

                <SidebarItem
                  icon={Shield}
                  label="My Tasks"
                  active={activePage === "my_tasks"}
                  onClick={() => setActivePage("my_tasks")}
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Staff, Dashboard
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user.name}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
              <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition">
                <Bell className="h-4 w-4 text-slate-700" />
              </button>

              {/* Profile Dropdown (DUMMY) */}
              <div ref={ref} className="relative ml-2">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                    {user.name.charAt(0)}
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">{user.name}</p>
                    <p className="text-[10px] text-slate-500">{user.email}</p>
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
                    <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                      Profile View
                    </button>

                    <button
                      onClick={() => {
                        // dummy logout
                        navigate("/login");
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ================= Dashboard Page ================= */}
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

                <AttendanceSummaryCard
                  status="Present"
                  checkIn="08:15 AM"
                  workingHours="8h 45m"
                  monthPercent={96}
                  presentDays={23}
                  totalDays={24}
                />
              </section>

              <div className="mt-6">
                <MyTasksCard
                  title="My Tasks"
                  activeCount={5}
                  tasks={dummyMyTasks}
                  onTaskClick={(t) => console.log("Open task:", t)}
                />
              </div>
            </>
          )}

          {/* ================= My Tasks Page ================= */}
          {activePage === "my_tasks" && (
            <MyTasksCard
              title="My Tasks"
              activeCount={5}
              tasks={dummyMyTasks}
              onTaskClick={(t) => console.log("Open task:", t)}
            />
          )}

          {/* ================= Salary Page ================= */}
          {activePage === "salary" && (
            <SalaryInfoCard
              amount="$5,450"
              lastPaymentDate="Feb 28, 2026"
              nextPaymentDate="Mar 31, 2026"
            />
          )}
        </main>
      </div>
    </div>
  );
}