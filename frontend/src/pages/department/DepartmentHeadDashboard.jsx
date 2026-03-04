import React, { useEffect, useState } from "react";
import useDropdown from "../../hooks/useDropdown";
import SidebarItem from "../../components/SidebarItem";
import KpiCard from "../../components/KpiCard";
import DepartmentStaffTable from "./components/DepartmentStaffTable";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import CustomBarChart from "../../components/BarChart";
import CustomLineChart from "../../components/LineChart";
import useStaffOverview from "../../hooks/useStaffOverview";
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
  const { open, toggle, ref } = useDropdown();
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [taskData, setTaskData] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activePage, setActivePage] = useState("dashboard");

  const user = JSON.parse(localStorage.getItem("user"));
const { staff = [] } = useStaffOverview();
const { staff: staffRequests = [] } = useStaffOverview();
useEffect(() => {
  console.log("Staff Requests Data:", staffRequests);
}, [staffRequests]);
  const dummyDepartment = {
    department: "HR Department",
    workspaceId: {
      name: "FactoryHub Workspace",
      logo: "",
    },
    pendingApprovals: 4,
    activeTasks: 12,
    attendanceRate: 92,
  };

  const dummyEmployees = [
    {
      _id: "emp1",
      name: "Ahmed Khan",
      age: 28,
      joinedDate: "2022-03-15",
      status: "active",
    },
    {
      _id: "emp2",
      name: "Sara Ali",
      age: 32,
      joinedDate: "2021-11-08",
      status: "active",
    },
    {
      _id: "emp3",
      name: "Bilal Ahmed",
      age: 26,
      joinedDate: "2023-01-20",
      status: "pending",
    },
    {
      _id: "emp2",
      name: "Sara Ali",
      age: 32,
      joinedDate: "2021-11-08",
      status: "active",
    },
    {
      _id: "emp3",
      name: "Bilal Ahmed",
      age: 26,
      joinedDate: "2023-01-20",
      status: "pending",
    },
    {
      _id: "emp2",
      name: "Sara Ali",
      age: 32,
      joinedDate: "2021-11-08",
      status: "active",
    },
    {
      _id: "emp3",
      name: "Bilal Ahmed",
      age: 26,
      joinedDate: "2023-01-20",
      status: "pending",
    },
    {
      _id: "emp2",
      name: "Sara Ali",
      age: 32,
      joinedDate: "2021-11-08",
      status: "active",
    },
    {
      _id: "emp3",
      name: "Bilal Ahmed",
      age: 26,
      joinedDate: "2023-01-20",
      status: "pending",
    },
  ];

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

  /* Fetch Department */

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const res = await axiosInstance.get("/departments/my-department");

        setDepartment(res.data.department || null);
      } catch (error) {
        console.error("Error fetching department:", error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartment();
  }, []);

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

  const departmentData = department || dummyDepartment;

  const displayEmployees = employees.length ? employees : dummyEmployees;
  const displayAttendance = attendanceData.length
    ? attendanceData
    : dummyAttendanceData;

  const displayTasks = taskData.length ? taskData : dummyTaskData;

  /* KPI Cards */

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

  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/employees/${id}/approve`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await axiosInstance.patch(`/employees/${id}/reject`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleView = (emp) => {
    console.log("View employee:", emp);
  };
  const activeEmployees = displayEmployees.filter(
    (emp) => emp.status?.toLowerCase() === "active",
  );

  const pendingEmployees = displayEmployees.filter(
    (emp) => emp.status?.toLowerCase() === "pending",
  );

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
                        ? `${import.meta.env.VITE_API_URL}/${departmentData.workspaceId.logo}`
                        : "/default-workspace.png"
                    }
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

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Header */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {departmentData.department || "Department Name"}, Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Welcome back, {user?.name}
              </p>
            </div>

            <div className="flex items-center gap-3 ml-auto">
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

              {/* Profile Dropdown */}
              <div ref={ref} className="relative ml-2">
                <button
                  onClick={toggle}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 hover:bg-slate-50 transition"
                >
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-xs font-semibold text-white">
                    {user?.name?.charAt(0)}
                  </div>

                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.name}
                    </p>

                    <p className="text-[10px] text-slate-500">{user?.email}</p>
                  </div>
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg z-10">
                    <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50">
                      Profile View
                    </button>

                    <button
                      onClick={() => {
                        localStorage.clear();
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
                employees={staffRequests}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={handleView}
              />
            </>
          )}

          {/* ========================= */}
          {/* WORKSPACES PAGE */}
          {/* ========================= */}
          {activePage === "employees" && (
            <DepartmentStaffTable
              title="Active Employees"
              employees={activeEmployees}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          )}
          {activePage === "approvals" && (
            <DepartmentStaffTable
              title="Pending Approvals"
              employees={pendingEmployees}
              onApprove={handleApprove}
              onReject={handleReject}
              onView={handleView}
            />
          )}
        </main>
      </div>
    </div>
  );
}
