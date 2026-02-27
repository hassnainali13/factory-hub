// frontend\src\pages\workspace\components\DepartmentOverviewTable.jsx

import React, { useState, useEffect } from "react";
import StatusPill from "../../../components/StatusPill";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const DepartmentOverviewTable = ({
  title = "Departments Overview",
  departments = [],
  initialLimit = 5,
  onOpenRequests, // ✅ for pending
  onOpenDetails, // ✅ for active
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

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="w-1/4 pb-3 text-xs font-semibold uppercase text-slate-400">
                Department
              </th>
              <th className="w-1/4 pb-3 text-xs font-semibold uppercase text-slate-400">
                {/* Status */}
                Head Name
              </th>
              <th className="w-1/4 pb-3 text-xs font-semibold uppercase text-slate-400">
                Status
              </th>
              <th className="w-1/4 pb-3 text-xs font-semibold uppercase text-slate-400 text-center">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {displayedDepartments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="py-4 text-center text-sm text-slate-500"
                >
                  No departments found.
                </td>
              </tr>
            ) : (
              displayedDepartments.map((d) => {
                const status = d.status?.toLowerCase() || "";

                const isPending = status === "pending";
                const isActive = status === "active";
                const isDisabled = status === "disabled";

                return (
                  <tr key={d._id} className="group">
                    <td className="py-4 text-sm font-medium text-slate-900">
                      {d.department}
                    </td>

                    <td className="py-4 text-sm text-slate-500">
                      {d.headName || "N/A"}
                    </td>

                    <td className="py-4">
                      <StatusPill
                        status={
                          isPending
                            ? "pending"
                            : isActive
                              ? "active"
                              : "disabled"
                        }
                      />
                    </td>

                    <td className="py-4 text-center">
                      {/* Pending -> View Requests */}
                      {isPending && (
                        <button
                          onClick={() => onOpenRequests?.(d)}
                          className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition"
                        >
                          View Requests
                        </button>
                      )}

                      {/* Active -> Eye */}
                      {isActive && (
                        <button
                          onClick={() => onOpenDetails?.(d)}
                          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition inline-flex items-center justify-center"
                        >
                          <FaEye className="h-4 w-4" />
                        </button>
                      )}

                      {/* Disabled */}
                      {isDisabled && (
                        <button
                          className="p-2 rounded-lg text-slate-300 cursor-not-allowed inline-flex items-center justify-center"
                          disabled
                        >
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
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showAll ? "Show Less" : "Show More"}
          </button>
        </div>
      )}
    </section>
  );
};

export default DepartmentOverviewTable;
