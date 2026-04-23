// frontend/pages/auth/staffProcessingPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ArrowLeft, Building2 } from "lucide-react";
import { buildApiUrl } from "../../config/api";
import { getWorkspaceLogo } from "../../utils/logoHelper";

export default function StaffProcessingPage() {
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const checkStaffStatus = async () => {
      try {
        const res = await axiosInstance.get("/join/staff-status");
        const data = res.data;
        if (!active) return;
        if (data.type === "pending") {
          setDepartment(data.department);
          setWorkspace(data.workspace);
        } else if (data.type === "approved") {
          navigate("/staff/dashboard", { replace: true });
        } else {
          navigate("/join-workspace", { replace: true });
        }
      } catch (err) {
        console.error(err);
        navigate("/join-workspace", { replace: true });
      } finally {
        if (active) setLoading(false);
      }
    };
    checkStaffStatus();
    return () => { active = false; };
  }, [navigate]);

  const logoSrc = useMemo(() => {
    if (!workspace?.logo) return null;
    return buildApiUrl(workspace.logo.replace(/\\/g, "/"));
  }, [workspace]);

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4ff]">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-blue-200 blur-2xl rounded-full animate-pulse" />
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative" />
        </div>
        <p className="mt-6 text-base font-semibold text-slate-800">Checking Staff Status</p>
        <p className="text-xs font-mono text-slate-400 mt-1 tracking-wider">PLEASE WAIT...</p>
      </div>
    );
  }

  const steps = [
    { label: "Requested", state: "done" },
    { label: "Review",    state: "active" },
    { label: "Approved",  state: "idle" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f4ff] p-8 font-sans">
      <div className="w-full max-w-[420px] bg-white border border-[#d6e0ff] rounded-3xl overflow-hidden">

        {/* Top accent bar */}
        <div className="h-[5px] bg-gradient-to-r from-blue-700 to-blue-400" />

        <div className="px-8 pt-9 pb-8">

          {/* Header row */}
          <div className="flex items-center gap-3.5 mb-7">
            <div className="relative w-14 h-14 rounded-[14px] bg-slate-900 border border-slate-200 flex items-center justify-center text-white text-xl font-semibold shrink-0 overflow-hidden">
              {logoSrc ? (
                <img src={getWorkspaceLogo(workspace.logo)} alt="logo" className="w-full h-full object-cover" />
              ) : (
                workspace?.name?.charAt(0) || <Building2 size={22} />
              )}
              <span className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-amber-400 border-2 border-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-[1rem] font-semibold text-slate-900 leading-tight tracking-tight">
                {workspace?.name || "Workspace Name"}
              </h2>
              <p className="text-[11px] font-mono text-slate-400 tracking-widest uppercase mt-0.5">
                Staff Request · Under Review
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="w-9 h-0.5 bg-blue-100 rounded-full mx-auto mb-5" />

          <h1 className="text-[1.25rem] font-semibold text-slate-900 tracking-tight leading-snug text-center mb-1">
            Your Request is<br />Being Reviewed
          </h1>
          <p className="text-[11px] font-mono text-slate-400 tracking-wider text-center mb-5">
            ref · STAFF-{new Date().toISOString().slice(0, 10).replace(/-/g, "")}
          </p>

          {/* Status box */}
          <div className="bg-[#f8faff] border border-[#e0eaff] rounded-[14px] px-5 py-4 text-center mb-5">
            <p className="text-sm text-slate-500 leading-relaxed">
              Your staff join request for department{" "}
              <span className="font-semibold text-blue-700">
                "{department?.department || "Department"}"
              </span>{" "}
              is under review by the department head.
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex justify-center mb-7">
            {steps.map((step, i) => (
              <div key={i} className="relative flex flex-col items-center w-20">
                {i < steps.length - 1 && (
                  <span className="absolute top-[10px] left-1/2 w-16 h-px bg-slate-200" />
                )}
                <div className={`relative z-10 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-semibold mb-1.5
                  ${step.state === "done"   ? "bg-blue-600 text-white" : ""}
                  ${step.state === "active" ? "bg-white border-2 border-amber-400 text-amber-500 animate-pulse" : ""}
                  ${step.state === "idle"   ? "bg-slate-100 border border-slate-200 text-slate-300" : ""}
                `}>
                  {step.state === "done" ? "✓" : step.state === "active" ? "●" : i + 1}
                </div>
                <span className={`text-[9.5px] font-mono tracking-wide whitespace-nowrap
                  ${step.state === "done"   ? "text-blue-500" : ""}
                  ${step.state === "active" ? "text-amber-500" : ""}
                  ${step.state === "idle"   ? "text-slate-300" : ""}
                `}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Button */}
          <button
            onClick={handleBackToLogin}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 active:scale-95 transition tracking-tight"
          >
            <ArrowLeft size={15} />
            Back to Login
          </button>
        </div>

        {/* Footer */}
        <div className="bg-[#f8faff] border-t border-[#e0eaff] py-3 px-8 text-center text-[10.5px] font-mono text-slate-400 tracking-wide">
          session cleared on logout · token removed
        </div>
      </div>
    </div>
  );
}