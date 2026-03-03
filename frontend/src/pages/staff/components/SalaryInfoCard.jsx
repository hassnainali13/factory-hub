import React from "react";
import { DollarSign, CheckCircle2 } from "lucide-react";

export default function SalaryInfoCard({
  title = "Salary Information",
  currentMonthLabel = "Current Month",
  amount = "$5,450",
  paidLabel = "Paid",
  lastPaymentLabel = "Last Payment",
  lastPaymentDate = "Feb 28, 2026",
  nextPaymentLabel = "Next Payment",
  nextPaymentDate = "Mar 31, 2026",
}) {
  return (
    <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-emerald-200">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100">
          <DollarSign className="h-4 w-4 text-emerald-700" />
        </span>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2 md:items-center">
        {/* Left */}
        <div>
          <p className="text-xs font-medium text-slate-500">{currentMonthLabel}</p>

          <div className="mt-2 flex items-end gap-3">
            <p className="text-3xl font-semibold tracking-tight text-slate-900">
              {amount}
            </p>
          </div>

          <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-100/60 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {paidLabel}
          </div>
        </div>

        {/* Right */}
        <div className="space-y-3 md:justify-self-end md:w-[320px]">
          <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-[11px] font-semibold text-slate-500">
              {lastPaymentLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {lastPaymentDate}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-[11px] font-semibold text-slate-500">
              {nextPaymentLabel}
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {nextPaymentDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}