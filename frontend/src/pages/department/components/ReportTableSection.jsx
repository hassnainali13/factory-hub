import React, { useState } from "react";

export default function ReportTableSection({
  title,
  subtitle,
  loadingReports = false,
  reportItems = [],
  onApproveReport = () => {},
  onRejectReport = () => {},
  emptyMessage = "No reports available.",
  showAssignedHR = false,
  groupOptions = [],
  activeGroup = "",
  onGroupChange = () => {},
}) {
  const [selectedReport, setSelectedReport] = useState(null);

  const activeGroupFilter = (item) => {
    if (!groupOptions?.length || !activeGroup || activeGroup === "all") {
      return true;
    }

    const role = (
      item.user?.role ||
      item.user?.originalRole ||
      ""
    ).toLowerCase();
    const groupRoleMap = {
      workspaceAdmin: [
        "general_manager",
        "industry_head",
        "workspace_admin",
        "admin",
      ],
      departmentHead: ["department_head"],
      staff: ["staff"],
    };

    const expectedRoles = groupRoleMap[activeGroup] || [
      activeGroup.toLowerCase(),
    ];
    return expectedRoles.includes(role);
  };

  const filteredReportItems = reportItems.filter(activeGroupFilter);

  return (
    <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        {groupOptions.length > 0 && (
          <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
            {groupOptions.map((group) => (
              <button
                key={group.id}
                onClick={() => onGroupChange(group.id)}
                className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                  activeGroup === group.id
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {group.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loadingReports ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-16 rounded-2xl bg-slate-100 animate-pulse"
            />
          ))}
        </div>
      ) : filteredReportItems.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          {emptyMessage}
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Employee
                </th>
                {showAssignedHR && (
                  <th className="px-4 py-3 font-semibold text-slate-700">
                    Assigned HR
                  </th>
                )}
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Report
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Status
                </th>
                <th className="px-4 py-3 font-semibold text-slate-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredReportItems.map((item) => (
                <tr key={item._id} className="border-t border-slate-200">
                  <td className="px-4 py-4 text-slate-600">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {item.user?.name || item.user?.email || "Unknown"}
                  </td>
                  {showAssignedHR && (
                    <td className="px-4 py-4 text-slate-600">
                      {item.assignedToName || "Unassigned"}
                    </td>
                  )}
                  <td className="px-4 py-4 text-slate-600 max-w-[320px]">
                    <button
                      onClick={() => setSelectedReport(item)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      View Report
                    </button>
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    <span className="inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                      {item.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-4 space-x-2">
                    <button
                      onClick={() => onApproveReport(item._id)}
                      className="rounded-2xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => onRejectReport(item._id)}
                      className="rounded-2xl bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Report Detail
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Read the full report message below.
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Close
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {new Date(selectedReport.date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Employee
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedReport.user?.name ||
                      selectedReport.user?.email ||
                      "Unknown"}
                  </p>
                </div>
                {showAssignedHR && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Assigned HR
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedReport.assignedToName || "Unassigned"}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Status
                </p>
                <p className="mt-1 inline-flex rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800">
                  {selectedReport.status || "Pending"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Message
                </p>
                <div className="mt-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 whitespace-pre-line">
                  {selectedReport.report}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
