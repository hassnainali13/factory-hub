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

  const [error, setError] = useState("");

  // 🔹 Workspace preview check
  useEffect(() => {
    if (!workspaceCode || workspaceCode.length < 4) {
      setExists(null);
      setWorkspace(null);
      setDepartments([]);
      setError("");
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setChecking(true);
        setError("");

        const token = localStorage.getItem("token");

        const res = await axiosInstance.post(
          "/join/preview",
          { workspaceCode },
          { headers: { Authorization: `Bearer ${token}` } }
        );

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

        setError(err.response?.data?.message || "Workspace not found");
      } finally {
        setChecking(false);
      }
    }, 800);

    return () => clearTimeout(timeout);
  }, [workspaceCode]);

  // ✅ Department select logic (NEW)
  const handleSelectDepartment = (dept) => {
    if (!dept?._id) return;

    const status = (dept.status || "").toLowerCase();

    // ✅ If department disabled OR pending → open request page
    if (status === "disabled" || status === "pending") {
      navigate("/department-head-request", {
        state: {
          workspaceId: workspace?._id,
          departmentId: dept._id,
          departmentName: dept.department || dept.name,
        },
      });
      return;
    }

    // ✅ If active → already assigned
    if (status === "active") {
      setError("This department already has a head assigned.");
      return;
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

        {/* Workspace code input */}
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

        {/* Workspace preview */}
        {exists && workspace && (
          <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50">
            <div className="flex items-center gap-4 mb-4">
              {workspace.logo ? (
                <img
                  src={`http://localhost:5000/${workspace.logo.replaceAll(
                    "\\",
                    "/"
                  )}`}
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

            {/* Departments */}
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
                  const status = (dept.status || "").toLowerCase();

                  const isActive = status === "active";
                  const isPending = status === "pending";
                  const isDisabled = status === "disabled";

                  return (
                    <button
                      key={dept._id}
                      disabled={false} // 👈 allow click always (we handle logic)
                      onClick={() => {
                        setError("");
                        handleSelectDepartment(dept);
                      }}
                      className={`p-3 rounded-xl border text-left transition
                      ${
                        isActive
                          ? "bg-slate-100 border-slate-200 text-slate-400"
                          : "bg-white border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <p className="font-semibold">
                        {dept.department || dept.name}
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        Status:{" "}
                        <span className="font-semibold">{dept.status}</span>
                      </p>

                      {isActive && (
                        <p className="text-xs text-red-500 mt-1">
                          Department head already assigned
                        </p>
                      )}

                      {(isPending || isDisabled) && (
                        <p className="text-xs text-green-600 mt-1">
                          Available for request
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-500 mt-4 font-medium">{error}</p>
            )}

            {/* Back button */}
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
