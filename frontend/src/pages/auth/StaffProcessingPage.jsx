import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { ArrowLeft, Building2 } from "lucide-react";

const API_BASE = "http://localhost:5000";

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
        } 
        else if (data.type === "approved") {
          navigate("/staff/dashboard", { replace: true });
        } 
        else {
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

    return () => {
      active = false;
    };
  }, [navigate]);

  const logoSrc = useMemo(() => {
    if (!workspace?.logo) return null;
    return `${API_BASE}/${workspace.logo.replace(/\\/g, "/")}`;
  }, [workspace]);

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  // =====================
  // Loading UI
  // =====================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-blue-200 blur-2xl rounded-full animate-pulse"></div>
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin relative"></div>
        </div>

        <p className="mt-6 text-lg font-semibold text-gray-800">
          Checking Staff Status
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Please wait...
        </p>
      </div>
    );
  }

  // =====================
  // Main UI
  // =====================
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-6">
      <div className="w-full max-w-md bg-white border border-gray-200 shadow-xl rounded-3xl p-7 space-y-7">

        {/* Header */}
        <div className="flex items-center gap-4">
          {logoSrc ? (
            <img
              src={logoSrc}
              alt="Workspace Logo"
              className="w-16 h-16 rounded-2xl object-cover border shadow-sm"
              onError={(e) => (e.target.src = "/default-workspace.png")}
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-gray-900 flex items-center justify-center text-white">
              {workspace?.name?.charAt(0) || <Building2 className="w-6 h-6" />}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate">
              {workspace?.name || "Workspace Name"}
            </h2>
            <p className="text-xs text-gray-500">
              Staff Request Under Review
            </p>
          </div>
        </div>

        {/* Status Card */}
        <div className="border border-gray-200 rounded-2xl p-6 text-center bg-gray-50">
          <p className="text-sm text-gray-600 leading-relaxed">
            Your staff join request for department{" "}
            <span className="font-semibold text-gray-900">
              "{department?.department || "Department"}"
            </span>{" "}
            is currently under review by the department head.
          </p>
        </div>

        {/* Back Button */}
        <button
          onClick={handleBackToLogin}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-black text-white text-sm font-semibold transition hover:bg-gray-800 active:scale-95 shadow-md"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

      </div>
    </div>
  );
}