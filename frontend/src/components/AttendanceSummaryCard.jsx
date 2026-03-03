import React from "react";
import { Check, Clock } from "lucide-react";

export default function AttendanceSummaryCard({
  status = "Present",
  checkIn = "08:15 AM",
  workingHours = "8h 45m",
  monthPercent = 96,
  presentDays = 23,
  totalDays = 24,
}) {
  const safePercent = Math.max(0, Math.min(100, Number(monthPercent) || 0));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Attendance</h2>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {status}
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-800">Today's Status</p>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-100">
                <Check className="h-3.5 w-3.5 text-emerald-600" />
              </span>
              <span>Check-in</span>
            </div>

            <span className="text-sm font-semibold text-slate-900">{checkIn}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-100">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
              </span>
              <span>Working Hours</span>
            </div>

            <span className="text-sm font-semibold text-slate-900">
              {workingHours}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">This Month</p>
          <p className="mt-1 text-xs text-slate-500">
            {presentDays} of {totalDays} days present
          </p>
        </div>

        <div className="text-2xl font-semibold text-slate-900">{safePercent}%</div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-slate-900"
          style={{ width: `${safePercent}%` }}
        />
      </div>
    </div>
  );
}