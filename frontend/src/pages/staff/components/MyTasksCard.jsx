import React from "react";
import { CheckSquare, Clock, Flag } from "lucide-react";

const statusStyles = {
  "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
  Pending: "bg-orange-50 text-orange-700 border-orange-200",
  "Not Started": "bg-slate-100 text-slate-700 border-slate-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const priorityStyles = {
  Low: "bg-slate-50 text-slate-700 border-slate-200",
  Medium: "bg-blue-50 text-blue-700 border-blue-200",
  High: "bg-orange-50 text-orange-700 border-orange-200",
  Urgent: "bg-red-50 text-red-700 border-red-200",
};

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export default function MyTasksCard({
  title = "My Tasks",
  activeCount = 5,
  tasks = [],
  onTaskClick,
}) {
  const safeTasks = Array.isArray(tasks) ? tasks : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100">
            <CheckSquare className="h-4 w-4 text-slate-700" />
          </span>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        </div>

        <Pill className="bg-blue-50 text-blue-700 border-blue-200">
          {activeCount} Active
        </Pill>
      </div>

      {/* List */}
      <div className="p-5 space-y-3">
        {safeTasks.map((t) => {
          const statusClass =
            statusStyles[t.status] || "bg-slate-100 text-slate-700 border-slate-200";
          const priorityClass =
            priorityStyles[t.priority] ||
            "bg-slate-50 text-slate-700 border-slate-200";

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onTaskClick?.(t)}
              className="w-full text-left rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {t.title}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{t.date}</span>
                    </div>

                    <Pill className={statusClass}>{t.status}</Pill>
                  </div>
                </div>

                <Pill className={priorityClass}>
                  <Flag className="h-3.5 w-3.5" />
                  {t.priority}
                </Pill>
              </div>
            </button>
          );
        })}

        {safeTasks.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
            <p className="text-sm font-semibold text-slate-900">No tasks yet</p>
            <p className="mt-1 text-xs text-slate-500">
              Tasks will appear here once assigned.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}