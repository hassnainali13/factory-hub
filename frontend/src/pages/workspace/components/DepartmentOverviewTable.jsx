//frontend\src\pages\workspace\components\DepartmentOverviewTable.jsx

import React, { useState, useEffect } from "react";
import StatusPill from "../../../components/StatusPill";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DepartmentOverviewTable = ({
  title = "Departments Overview",
  departments = [],
  users = [], // All users including pending/approved
  initialLimit = 5,
  approveDepartment,
  rejectDepartment,
  onViewDetails,
  disableShowMore = false,
}) => {
  const [showAll, setShowAll] = useState(false);
  const [localDepartments, setLocalDepartments] = useState([]);

  useEffect(() => {
    setLocalDepartments(departments);
  }, [departments]);

  const displayedDepartments = disableShowMore
    ? localDepartments.slice(0, initialLimit)
    : showAll
      ? localDepartments
      : localDepartments.slice(0, initialLimit);

  // Approve request
 const handleApprove = async (userId) => {
  if (!approveDepartment) return;
  try {
    await approveDepartment(userId);
  } catch (err) {
    console.error(err);
  }
};


  // Reject request
  const handleReject = async (userId) => {
  if (!rejectDepartment) return;
  try {
    await rejectDepartment(userId);
  } catch (err) {
    console.error(err);
  }
};

  const getDepartmentUsers = (deptId) => {
    const deptUsers = users.filter(u => String(u.departmentId) === String(deptId));
    if (deptUsers.length === 0) return "—";
    return deptUsers.map(u => u.name).join(", ");
  };

  const getDepartmentHead = (dept) => {
    // Find user whose _id matches dept.head
    const headUser = users.find(u => String(u._id) === String(dept.head));
    if (headUser) return headUser.name;
    return dept.head || "—";
  };

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="w-1/5 pb-3 text-xs font-semibold uppercase text-slate-400">Department</th>
              <th className="w-1/5 pb-3 text-xs font-semibold uppercase text-slate-400">Head</th>
              <th className="w-1/5 pb-3 text-xs font-semibold uppercase text-slate-400">Users</th>
              <th className="w-1/5 pb-3 text-xs font-semibold uppercase text-slate-400">Status</th>
              <th className="w-1/5 pb-3 text-xs font-semibold uppercase text-slate-400 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {displayedDepartments.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-4 text-center text-sm text-slate-500">
                  No departments found.
                </td>
              </tr>
            ) : (
              displayedDepartments.map(d => {
                const status = d.status?.toLowerCase() || "";
                const requestStatus = d.requestStatus?.toLowerCase() || "";
                const isPending = status === "pending" || requestStatus === "pending";
                const isActive = status === "active" || requestStatus === "approved";
                const isDisabled = status === "disabled";

                return (
                  <tr key={d._id} className="group">
                    <td className="py-4 text-sm font-medium text-slate-900">{d.department}</td>
                    <td className="py-4 text-sm text-slate-600">{getDepartmentHead(d)}</td>
                    <td className="py-4 text-sm text-slate-600">{getDepartmentUsers(d._id)}</td>
                    <td className="py-4">
                      <StatusPill status={isPending ? "pending" : isActive ? "active" : "disabled"} />
                    </td>
                    <td className="py-4 text-center">
                      {isPending && (
                        <div className="inline-flex gap-2 justify-center">
                          <button onClick={() => handleApprove(d._id)} className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition">Approve</button>
                          <button onClick={() => handleReject(d._id)} className="px-3 py-1 text-sm font-medium bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 transition">Reject</button>
                        </div>
                      )}
                      {isActive && (
                        <button onClick={() => onViewDetails?.(d)} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition inline-flex items-center justify-center">
                          <FaEye className="h-4 w-4" />
                        </button>
                      )}
                      {isDisabled && (
                        <button className="p-2 rounded-lg text-slate-300 cursor-not-allowed inline-flex items-center justify-center" disabled>
                          <FaEyeSlash className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!disableShowMore && departments.length > initialLimit && (
        <div className="mt-4 text-center">
          <button onClick={() => setShowAll(!showAll)} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default DepartmentOverviewTable;
