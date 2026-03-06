import React from "react";
import { useNavigate } from "react-router-dom";

export default function WorkspacePreviewCard({
  workspace,
  departments,
  selectedDept,
  setSelectedDept,
  setError,
}) {
  const navigate = useNavigate();

  const handleSelectDepartment = (dept) => {
    if (!dept?._id) return;

    const status = (dept.status || "").toLowerCase();

    if (status === "active") {
      setSelectedDept(dept);
      return;
    }

    if (status === "pending" || status === "disabled") {
      navigate("/department-head-request", {
        state: {
          workspaceId: workspace?._id,
          departmentId: dept._id,
          departmentName: dept.department || dept.name,
        },
      });
    }
  };

  return (
    <div className="mt-6 border border-slate-200 rounded-2xl p-5 bg-slate-50/60">

      <div className="flex items-center gap-4 mb-5">
        {workspace?.logo ? (
          <img
            src={`http://localhost:5000/${workspace.logo.replaceAll(
              "\\",
              "/"
            )}`}
            alt="Workspace Logo"
            className="w-14 h-14 rounded-2xl object-cover shadow"
          />
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
            W
          </div>
        )}

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            {workspace?.name}
          </h3>

          <p className="text-sm text-slate-500">
            Workspace Admin:{" "}
            <span className="font-medium text-slate-700">
              {workspace?.generalManager}
            </span>
          </p>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-700 mb-3">
        Select Department
      </h4>

      {departments?.length === 0 ? (
        <p className="text-sm text-slate-500">
          No departments created yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {departments?.map((dept) => {
            const headName = dept.headName;
            const status = (dept.status || "").toLowerCase();
            const isSelected = selectedDept?._id === dept._id;

            return (
              <button
                key={dept._id}
                onClick={() => {
                  setError("");
                  handleSelectDepartment(dept);
                }}
                className={`p-4 rounded-xl border text-left transition-all duration-300
                ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                    : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
                }`}
              >
                <p className="font-semibold text-slate-900">
                  {dept.department || dept.name}
                </p>

                <p className="text-xs text-slate-500 mt-1">
                  {headName
                    ? `Department Head: ${headName}`
                    : "No Department Head Assigned"}
                </p>

                {status === "active" ? (
                  <p className="text-xs text-blue-600 mt-2 font-medium">
                    Click to Join as Staff
                  </p>
                ) : (
                  <p className="text-xs text-green-600 mt-2 font-medium">
                    Become Department Head
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selectedDept && (
        <button
          onClick={() =>
            navigate("/staff-join-confirm", {
              state: { department: selectedDept },
            })
          }
          className="mt-6 w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:opacity-95 transition"
        >
          Send Request
        </button>
      )}

      <button
        onClick={() => navigate("/login")}
        className="mt-4 w-full py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition font-medium"
      >
        Back
      </button>
    </div>
  );
}