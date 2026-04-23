// frontend/pages/auth/workspaceProcessingPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ArrowLeft, Building2 } from "lucide-react";

export default function ProcessingPage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    axiosInstance.get(`/workspaces/${id}`)
      .then((res) => { setWorkspace(res.data); setLoading(false); })
      .catch((err) => { console.error("Error:", err); setLoading(false); });
  }, [id]);

  const initials = workspace?.workspaceName?.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex justify-center items-center bg-[#f0f4ff] font-sans p-8">
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-[#d6e0ff] overflow-hidden">

        {/* Top accent bar */}
        <div className="h-[5px] bg-gradient-to-r from-blue-600 to-blue-400" />

        <div className="px-8 pt-10 pb-8 text-center">

          {/* Avatar with pulse dot */}
          <div className="relative w-[72px] h-[72px] rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-600 text-3xl font-semibold mx-auto mb-5">
            {loading ? (
              <div className="w-full h-full rounded-full bg-slate-100 animate-pulse" />
            ) : workspace?.logo ? (
              <img
                src={workspace.logo}
                alt={workspace.workspaceName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              initials || "?"
            )}
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
          </div>

          {/* Workspace name */}
          {!loading && workspace?.workspaceName && (
            <p className="text-[1rem] font-semibold text-blue-800 mb-2">
              {workspace.workspaceName}
            </p>
          )}

          {/* Badge */}
          {!loading && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium tracking-widest uppercase bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Pending Approval
            </span>
          )}

          {/* Divider */}
          <div className="w-10 h-0.5 bg-blue-100 rounded-full mx-auto mb-5" />

          <h1 className="text-[1.35rem] font-semibold text-slate-900 leading-snug tracking-tight mb-2">
            Workspace Creation<br />in Progress
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed mb-7">
            Your workspace is awaiting approval from<br />the Super Admin. We'll notify you once it's ready.
          </p>

          {/* Progress steps */}
          <div className="flex justify-center gap-0 mb-8">
            {[
              { label: "Submitted", state: "done" },
              { label: "Review",    state: "active" },
              { label: "Active",    state: "pending" },
            ].map((step, i) => (
              <div key={i} className="relative flex flex-col items-center w-20">
                {i < 2 && (
                  <span className="absolute top-[10px] left-1/2 w-16 h-px bg-slate-200" />
                )}
                <div className={`relative z-10 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-semibold mb-1.5
                  ${step.state === "done"    ? "bg-blue-600 text-white" : ""}
                  ${step.state === "active"  ? "bg-white border-2 border-amber-400 text-amber-500 animate-pulse" : ""}
                  ${step.state === "pending" ? "bg-slate-100 border border-slate-200 text-slate-400" : ""}
                `}>
                  {step.state === "done" ? "✓" : step.state === "active" ? "●" : i + 1}
                </div>
                <span className={`text-[10px] font-mono tracking-wide whitespace-nowrap
                  ${step.state === "done"    ? "text-blue-500" : ""}
                  ${step.state === "active"  ? "text-amber-500" : ""}
                  ${step.state === "pending" ? "text-slate-400" : ""}
                `}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => (window.location.href = "/login")}
             className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 transition tracking-tight"
          >
            <ArrowLeft size={15} />
            Back to Login
          </button>

        </div>

        {/* Footer ref line */}
        <div className="bg-[#f8faff] border-t border-[#e0eaff] py-3 px-8 text-center text-[11px] font-mono text-slate-400 tracking-wide">
          workspace · pending · ref #WS-{id?.slice(0, 8)?.toUpperCase() || "XXXXXXXX"}
        </div>
      </div>
    </div>
  );
}