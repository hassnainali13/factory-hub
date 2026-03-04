// frontend\src\pages\department\components\DepartmentStaffTable.jsx
import React, { useState } from "react";
import StatusPill from "../../../components/StatusPill";
import { Eye } from "lucide-react";

const DepartmentStaffTable = ({
  title = "Department Staff",
  employees = [],
  onApprove,
  onReject,
  onView,
  initialLimit = 5,
}) => {
  const [showAll, setShowAll] = useState(false);

  // ⭐ SAFE ARRAY (IMPORTANT FIX)
  const safeEmployees = Array.isArray(employees) ? employees : [];

  const displayedEmployees = showAll
    ? safeEmployees
    : safeEmployees.slice(0, initialLimit);

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed min-w-[700px] border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 px-4 text-xs uppercase text-slate-400">
                Name
              </th>
              <th className="pb-3 px-4 text-xs uppercase text-slate-400">
                Age
              </th>
              <th className="pb-3 px-4 text-xs uppercase text-slate-400">
                Joined Date
              </th>
              <th className="pb-3 px-4 text-xs uppercase text-slate-400">
                Status
              </th>
              <th className="pb-3 px-4 text-xs uppercase text-slate-400 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {displayedEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-5 text-center text-sm text-slate-500"
                >
                  Staff not found.
                </td>
              </tr>
            ) : (
              displayedEmployees.map((emp) => {
                const status = emp?.status?.toLowerCase();

                return (
                  <tr
                    key={emp._id || Math.random()}
                    className="hover:bg-slate-50 transition"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-slate-900">
                      {emp.userId?.name || "—"}{" "}
                    </td>

                    <td className="py-4 px-4 text-sm text-slate-600">
                      {emp.userId?.age || "—"}{" "}
                    </td>

                    <td className="py-4 px-4 text-sm text-slate-600">
                      {emp.userId?.createdAt
                        ? new Date(emp.userId.createdAt).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="py-4 px-4">
                      <StatusPill status={emp?.status} />
                    </td>

                    <td className="py-4 px-4 text-center">
                      {status === "pending" && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => onApprove?.(emp?._id)}
                            className="px-3 py-1.5 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() => onReject?.(emp?._id)}
                            className="px-3 py-1.5 text-xs font-medium bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {status === "active" && (
                        <button
                          onClick={() => onView?.(emp)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition"
                        >
                          <Eye className="h-4 w-4" />
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

      {safeEmployees.length > initialLimit && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
};
export default DepartmentStaffTable;
