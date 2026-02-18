// frontend/src/pages/department/DepartmentHeadDashboard.jsx

import React from "react";
import useDropdown from "../../hooks/useDropdown";
import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import StatusPill from "../../components/StatusPill";

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
  Eye,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
} from "recharts";

/* ===============================
   Department Data
================================= */

const department = {
  name: "Production",
  totalEmployees: 45,
  attendanceRate: 92,
  activeTasks: 18,
  pendingApprovals: 6,
};

const kpiCards = [
  {
    title: "Total Employees",
    value: department.totalEmployees,
    delta: "+3 this month",
    icon: Users,
    accent: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    title: "Pending Approvals",
    value: department.pendingApprovals,
    delta: "2 urgent",
    icon: CheckSquare,
    accent: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
  },
  {
    title: "Active Tasks",
    value: department.activeTasks,
    delta: "+4 this week",
    icon: ClipboardList,
    accent: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    title: "Attendance Rate",
    value: `${department.attendanceRate}%`,
    delta: "This month",
    icon: TrendingUp,
    accent: "text-violet-600",
    bg: "bg-violet-50",
  },
];

const attendanceData = [
  { month: "Jan", attendance: 88 },
  { month: "Feb", attendance: 91 },
  { month: "Mar", attendance: 87 },
  { month: "Apr", attendance: 93 },
  { month: "May", attendance: 90 },
  { month: "Jun", attendance: 92 },
];

const taskData = [
  { month: "Jan", completed: 14 },
  { month: "Feb", completed: 18 },
  { month: "Mar", completed: 16 },
  { month: "Apr", completed: 22 },
  { month: "May", completed: 19 },
  { month: "Jun", completed: 25 },
];

const employees = [
  { id: 1, name: "Ali Khan", role: "Supervisor", status: "Active", attendance: "95%" },
  { id: 2, name: "Ahmed Raza", role: "Operator", status: "Active", attendance: "89%" },
  { id: 3, name: "Usman Tariq", role: "Technician", status: "On Leave", attendance: "—" },
  { id: 4, name: "Bilal Ahmed", role: "Operator", status: "Active", attendance: "91%" },
];

/* ===============================
   User Info
================================= */

const userName = "John Doe";
const userEmail = "john@example.com";
const userInitial = "J";

export default function DepartmentHeadDashboard() {
  const { open, toggle, ref } = useDropdown();

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto flex max-w-[1440px] gap-6 p-4 md:p-6">
        
        {/* ================= Sidebar ================= */}
        <aside className="hidden w-[260px] shrink-0 md:block">
          <div className="sticky top-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              
              <div className="flex items-center gap-3 px-2">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white border border-slate-200 shadow-sm">
                  <LayoutDashboard className="h-4 w-4 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {department.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    Department Head
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <SidebarItem icon={LayoutDashboard} label="Dashboard" active />
                <SidebarItem icon={Users} label="Employees" />
                <SidebarItem icon={CheckSquare} label="Approvals" />
                <SidebarItem icon={ClipboardList} label="Tasks" />
                <SidebarItem icon={Shield} label="Attendance" />
                <SidebarItem icon={FileBarChart2} label="Reports" />
                <SidebarItem icon={Settings} label="Settings" />
              </div>

            </div>
          </div>
        </aside>

        {/* ================= Main ================= */}
        <main className="flex-1 min-w-0">

          {/* ================= Topbar ================= */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {department.name} Department
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {userName}
              </p>
            </div>

            <div className="flex items-center gap-3">

              <div className="relative flex-1 sm:min-w-[300px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Search employees..."
                />
              </div>

              <button className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition">
                <Bell className="h-4 w-4" />
              </button>

              {/* Profile */}
              <div ref={ref} className="relative">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                    {userInitial}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">{userName}</p>
                    <p className="text-[10px] text-slate-500">{userEmail}</p>
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
                    <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                      Profile View
                    </button>
                    <button className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50">
                      Logout
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* ================= KPI ================= */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {kpiCards.map((card) => (
              <KpiCard key={card.title} {...card} />
            ))}
          </section>

          {/* ================= Charts ================= */}
          <section className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">

            {/* Attendance Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Monthly Attendance
              </h2>
              <div className="h-[260px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                    <Legend iconType="circle" />
                    <Line type="monotone" dataKey="attendance" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Task Chart */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Task Completion
              </h2>
              <div className="h-[260px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskData} barSize={38}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "12px", border: "none" }} />
                    <Bar dataKey="completed" fill="#3b82f6" radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </section>

          {/* ================= Employees Table ================= */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">
                Department Employees
              </h2>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View all
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 text-left">
                    <th className="pb-3 text-xs font-semibold uppercase text-slate-400">Name</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-slate-400">Role</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-slate-400">Attendance</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-slate-400">Status</th>
                    <th className="pb-3 text-xs font-semibold uppercase text-slate-400">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td className="py-4 text-sm font-medium text-slate-900">{emp.name}</td>
                      <td className="py-4 text-sm text-slate-600">{emp.role}</td>
                      <td className="py-4 text-sm text-slate-600">{emp.attendance}</td>
                      <td className="py-4"><StatusPill status={emp.status} /></td>
                      <td className="py-4">
                        <button className="p-2 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-600 transition">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
