//frontend\src\pages\workspace\components\DepartmentManagement.jsx
import React, { useState, useEffect } from "react";
import { Plus, Users, Edit } from "lucide-react";
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
  const [departments, setLocalDepartments] = useState(
    Array.isArray(data) ? data : [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState(null);

  // 🚀 Fetch departments only when workspaceId exists
  useEffect(() => {
    const fetchDepartments = async () => {
      if (!workspaceId) return;

      try {
        const response = await axiosInstance.get(
          `/departments?workspaceId=${workspaceId}`,
        );
        const deptData = Array.isArray(response.data)
          ? response.data
          : response.data.departments;

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

  const displayedData = showAll
    ? departments
    : departments.slice(0, initialLimit);

  const chartData = departments.map((dept) => ({
    department: dept.department,
    employees: dept.employeesLimit,
  }));

  return (
    <section className="mt-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Department Management
          </h2>
          <p className="text-sm text-slate-500">
            Manage departments, heads and status
          </p>
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
          return (
            <div
              key={dept._id || dept.id}
              onClick={() => onView?.(dept)}
              className="group relative cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {dept.department}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Head: {dept.headName || "Not Assigned"}
                  </p>
                  <p className="text-sm text-slate-500 mt-1">
                    Role: {dept.head || "department_head"}
                  </p>
                </div>
                <StatusPill status={dept.status} />
              </div>

              <div className="mt-4 flex items-center justify-between gap-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-slate-400" />
                  <span>{dept.employeesLimit} Staff Limit</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditDepartment(dept);
                    setIsModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Edit className="h-3.5 w-3.5" />
                  Edit
                </button>
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
        onClose={() => {
          setIsModalOpen(false);
          setEditDepartment(null);
        }}
        workspace={{ id: workspaceId }}
        mode={editDepartment ? "edit" : "create"}
        initialValues={
          editDepartment
            ? {
                departmentName: editDepartment.department,
                hodRole: editDepartment.head,
                employeesLimit: editDepartment.employeesLimit,
                currentEmployees: editDepartment.currentEmployees || 0,
              }
            : undefined
        }
        title={editDepartment ? "Update Staff Limit" : "Add New Department"}
        submitLabel={editDepartment ? "Update" : "Add Department"}
        onSubmit={async (formData) => {
          if (!workspaceId) {
            alert("Workspace not found. Cannot submit department form.");
            return;
          }

          if (editDepartment) {
            try {
              const response = await axiosInstance.patch(
                `/departments/limit/${editDepartment._id}`,
                {
                  employeesLimit: Number(formData.employeesLimit),
                },
              );

              const updatedLimit = response.data.department
                ? response.data.department.employeesLimit
                : Number(formData.employeesLimit);

              setLocalDepartments((prev) =>
                prev.map((dept) =>
                  dept._id === editDepartment._id
                    ? { ...dept, employeesLimit: updatedLimit }
                    : dept,
                ),
              );
              setDepartments?.((prev) =>
                prev?.map((dept) =>
                  dept._id === editDepartment._id
                    ? { ...dept, employeesLimit: updatedLimit }
                    : dept,
                ),
              );
              setIsModalOpen(false);
              setEditDepartment(null);
              return {};
            } catch (err) {
              console.error(err);
              return {
                error:
                  err.response?.data?.message ||
                  "Staff limit update failed. Please try again.",
              };
            }
          }

          const payload = {
            department: formData.departmentName,
            head: formData.hodRole,
            employeesLimit: Number(formData.employeesLimit),
            status: "disabled",
            workspaceId,
          };

          try {
            const response = await axiosInstance.post(
              "/departments/create",
              payload,
            );
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
