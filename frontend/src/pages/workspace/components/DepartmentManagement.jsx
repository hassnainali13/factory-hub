//frontend\src\pages\workspace\components\DepartmentManagement.jsx
import React, { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from "recharts";
import StatusPill from "../../../components/StatusPill";
import AddDepartmentModal from "./AddDepartmentModal";
import axiosInstance from "../../../api/axiosInstance";

export default function DepartmentManagement({
  data = [],
  onView,
  workspaceId, // received from parent
  setDepartments, // function to update parent state
}) {
  const initialLimit = 5;
  const [showAll, setShowAll] = useState(false);
  const [departments, setLocalDepartments] = useState(Array.isArray(data) ? data : []);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 🚀 Fetch departments only when workspaceId exists
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!workspaceId) return;

      try {
        const response = await axiosInstance.get(`/departments?workspaceId=${workspaceId}`);
        const deptData = Array.isArray(response.data) ? response.data : response.data.departments;

        setLocalDepartments(deptData);
        setDepartments?.(deptData);
      } catch (err) {
        console.error("Error fetching departments:", err);
        setLocalDepartments([]);
        setDepartments?.([]);
      }
    };

    fetchDepartments();
  }, [workspaceId]);

  // ✅ Only enable Add Department button if workspaceId is ready
  const handleOpenModal = () => {
    if (!workspaceId) {
      console.warn("Workspace ID not ready yet.");
      return;
    }
    setIsModalOpen(true);
  };

  const displayedData = showAll ? departments : departments.slice(0, initialLimit);

  const chartData = departments.map((dept) => ({
    department: dept.department,
    employees: dept.employees,
  }));

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Department Management</h2>
          <p className="text-sm text-slate-500">Manage departments, heads and status</p>
        </div>

        <button
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          onClick={handleOpenModal}
          disabled={!workspaceId} // disabled until workspaceId is ready
        >
          <Plus className="h-4 w-4" />
          Add Department
        </button>
      </div>

      {/* Department Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {displayedData.map((dept) => {
          const headName =
            dept.status === "pending"
              ? "Not Assigned Yet"
              : dept.status === "disabled"
              ? "—"
              : dept.head || "—";

          return (
            <div
              key={dept._id || dept.id}
              onClick={() => onView?.(dept)}
              className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{dept.department}</h3>
                  <p className="text-sm text-slate-500 mt-1">
                    {dept.role || "department_head"} —{" "}
                    <span
                      className={
                        dept.status === "pending"
                          ? "text-orange-700 font-medium"
                          : "text-slate-700 font-medium"
                      }
                    >
                      {headName}
                    </span>
                  </p>
                </div>
                <StatusPill status={dept.status} />
              </div>

              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 text-slate-400" />
                {dept.employees} Staff Limit
              </div>
            </div>
          );
        })}

        {departments.length > initialLimit && (
          <div
            onClick={() => setShowAll(!showAll)}
            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col items-center justify-center text-blue-600 font-medium hover:bg-slate-50 transition-all h-[140px]"
          >
            {showAll ? "Show Less" : "Show More"}
          </div>
        )}
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        workspace={{ id: workspaceId }}
        onSubmit={async (formData) => {
          if (!workspaceId) {
            alert("Workspace not found. Cannot create department.");
            return;
          }

          const payload = {
            department: formData.departmentName,
            head: formData.hodRole,
            employees: Number(formData.employeesLimit),
            status: "disabled",
            workspaceId,
          };

          try {
            const response = await axiosInstance.post("/departments/create", payload);
            const newDept = response.data;

            setLocalDepartments((prev) => [newDept, ...prev]);
            setDepartments?.((prev) => [newDept, ...prev]);
            setIsModalOpen(false);
          } catch (err) {
            console.error(err.message);
            alert("Department creation failed");
          }
        }}
      />
    </section>
  );
}
