//frontend\src\pages\auth\JoinWorkspace.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function JoinWorkspace() {
  const navigate = useNavigate();

  const [workspaceCode, setWorkspaceCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [exists, setExists] = useState(null); // null | true | false

  const [workspace, setWorkspace] = useState(null);
  const [departments, setDepartments] = useState([]);

  const [selectedDept, setSelectedDept] = useState(null);
  const [sending, setSending] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const [error, setError] = useState("");

  // 🔹 Workspace preview check
  useEffect(() => {
    if (!workspaceCode || workspaceCode.length < 4) {
      setExists(null);
      setWorkspace(null);
      setDepartments([]);
      setSelectedDept(null);
      setRequestSent(false);
      setError("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setChecking(true);
        setError("");

        const res = await axiosInstance.post("/join/preview", {
          workspaceCode,
        });

        // ✅ updated workspace data
        const workspaceData = {
          _id: res.data.workspaceId,
          name: res.data.name,
          logo: res.data.logo,
          generalManager: res.data.generalManager,
          departments: Array.isArray(res.data.departments)
            ? res.data.departments
            : [],
        };

        setWorkspace(workspaceData);
        setDepartments(workspaceData.departments);

        setExists(true);
      } catch (err) {
        setExists(false);
        setWorkspace(null);
        setDepartments([]);
        setSelectedDept(null);

        setError(err.response?.data?.message || "Workspace not found");
      } finally {
        setChecking(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [workspaceCode]);

  // 🔹 Send department join request
  const handleSendRequest = async () => {
    if (!selectedDept) {
      setError("Please select a department");
      return;
    }

    try {
      setSending(true);
      setError("");

      await axiosInstance.post("/join/request", {
        departmentId: selectedDept._id,
      });

      setRequestSent(true);

      // ✅ redirect to pending page
      navigate("/workspace/department-processing");
    } catch (err) {
      setError(err.response?.data?.message || "Request failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Join Workspace
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Enter workspace code to join an existing workspace.
        </p>

        {/* 🔹 Workspace code input */}
        <div className="mb-4">
          <label className="text-sm font-medium text-slate-700">
            Workspace Code
          </label>
          <div className="mt-2 flex items-center gap-3">
            <input
              value={workspaceCode}
              onChange={(e) =>
                setWorkspaceCode((e.target.value || "").toLowerCase())
              }
              placeholder="Enter workspace code"
              className="w-full border border-slate-300 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {checking && (
              <span className="text-sm text-slate-500">Checking...</span>
            )}
            {!checking && exists === true && (
              <span className="text-green-600 font-bold text-lg">✔</span>
            )}
            {!checking && exists === false && (
              <span className="text-red-600 font-bold text-lg">✖</span>
            )}
          </div>
          {exists === false && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* 🔹 Workspace preview */}
        {exists && workspace && (
          <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
            <div className="flex items-center gap-4 mb-4">
              {workspace.logo ? (
                <img
                  src={workspace.logo}
                  alt="Workspace Logo"
                  className="w-14 h-14 rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                  W
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  {workspace.name}
                </h3>
                <p className="text-sm text-slate-500">
                  Workspace Admin:{" "}
                  <span className="font-medium text-slate-700">
                    {workspace.generalManager}
                  </span>
                </p>
              </div>
            </div>

            {/* 🔹 Departments */}
            <h4 className="text-sm font-semibold text-slate-700 mb-2">
              Select Department
            </h4>
            {departments.length === 0 ? (
              <p className="text-sm text-slate-500">
                No departments created yet.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {departments.map((dept) => {
                  const isSelected = selectedDept?._id === dept._id;
                  const alreadyAssigned = !!dept.head;

                  return (
                    <button
                      key={dept._id}
                      disabled={alreadyAssigned}
                      onClick={() => setSelectedDept(dept)}
                      className={`p-3 rounded-xl border text-left transition
                        ${
                          alreadyAssigned
                            ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                            : isSelected
                              ? "bg-blue-50 border-blue-500"
                              : "bg-white border-slate-200 hover:border-blue-300"
                        }`}
                    >
                      <p className="font-semibold">{dept.department}</p>
                      <p className="text-xs text-slate-500">
                        Role: {dept.role || "Department"}
                      </p>
                      {alreadyAssigned && (
                        <p className="text-xs text-red-500 mt-1">
                          Department head already assigned
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* 🔹 Request button */}
            {!requestSent && (
              <div className="mt-6">
                {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
                <button
                  onClick={handleSendRequest}
                  disabled={sending || !selectedDept}
                  className={`w-full py-2 rounded-xl font-semibold transition
                    ${
                      sending || !selectedDept
                        ? "bg-slate-300 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                >
                  {sending ? "Sending Request..." : "Send Request"}
                </button>
              </div>
            )}

            {/* 🔹 Back button */}
            <button
              onClick={() => navigate("/login")}
              className="mt-4 w-full py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
