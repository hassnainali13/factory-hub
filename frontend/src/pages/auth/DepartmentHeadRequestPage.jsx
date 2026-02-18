//frontend\src\pages\auth\DepartmentProcessPage.jsx

import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function DepartmentHeadRequestPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const { workspaceId, departmentId, departmentName } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const sendRequest = async () => {
    try {
      setLoading(true);
      setMsg("");

      const token = localStorage.getItem("token");

      const res = await axiosInstance.post(
        "/join/send-department-request",
        { workspaceId, departmentId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMsg(res.data.message || "Request sent successfully!");

      setTimeout(() => {
        navigate("/workspace/department-processing");
      }, 1200);
    } catch (err) {
      console.error(err);
      setMsg(err.response?.data?.message || "Request failed!");
    } finally {
      setLoading(false);
    }
  };

  // safety check
  if (!workspaceId || !departmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600">Invalid Access</h2>
          <p className="text-slate-600 mt-2">
            Workspace/Department missing.
          </p>

          <button
            onClick={() => navigate("/join-workspace")}
            className="mt-4 px-4 py-2 bg-black text-white rounded-xl"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white p-7 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold text-slate-900 text-center">
          Department Request
        </h1>

        <p className="text-slate-600 text-center mt-3">
          You can send request for department head
        </p>

        <div className="mt-5 bg-slate-100 p-4 rounded-xl">
          <p className="text-sm text-slate-700">
            <span className="font-semibold">Department:</span>{" "}
            {departmentName}
          </p>
        </div>

        {msg && (
          <p className="mt-4 text-center text-sm font-semibold text-blue-600">
            {msg}
          </p>
        )}

        <button
          onClick={sendRequest}
          disabled={loading}
          className={`mt-6 w-full py-3 rounded-xl text-white font-semibold transition ${
            loading
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-black hover:bg-slate-800"
          }`}
        >
          {loading ? "Sending..." : "Send Request"}
        </button>

        <button
          onClick={() => navigate('/login')}
          className="mt-3 w-full py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
        >
          Back
        </button>
      </div>
    </div>
  );
}
