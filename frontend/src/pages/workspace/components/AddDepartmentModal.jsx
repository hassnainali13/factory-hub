//frontend\src\pages\workspace\components\AddDepartmentModal.jsx
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

export default function AddDepartmentModal({
  isOpen,
  onClose,
  workspace,
  onSubmit, // ✅ receive from parent
  mode = "create",
  initialValues = {},
  title,
  submitLabel,
}) {
  const [departmentName, setDepartmentName] = useState("");
  const [hodRole, setHodRole] = useState("");
  const [employeesLimit, setEmployeesLimit] = useState("");
  const [errors, setErrors] = useState({});

  const minLimit =
    mode === "edit" && initialValues.currentEmployees !== undefined
      ? Number(initialValues.currentEmployees)
      : 1;

  useEffect(() => {
    if (!isOpen) return;

    const {
      departmentName = "",
      hodRole = "",
      employeesLimit = "",
    } = initialValues || {};

    setDepartmentName(departmentName);
    setHodRole(hodRole);
    setEmployeesLimit(
      employeesLimit !== undefined ? String(employeesLimit) : "",
    );
    setErrors({});
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!workspace?.id) {
      console.error("Workspace ID missing. Department create blocked.");
      return;
    }

    const newErrors = {};
    if (!departmentName.trim())
      newErrors.departmentName = "Department required";
    if (!hodRole.trim()) newErrors.hodRole = "HOD Role required";
    if (!employeesLimit || employeesLimit <= 0)
      newErrors.employeesLimit = "Employees limit must be positive";

    if (mode === "edit" && Number(employeesLimit) < minLimit) {
      newErrors.employeesLimit = ` ${minLimit} approved staff`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await onSubmit({
        departmentName,
        hodRole,
        employeesLimit,
        workspace,
      });

      if (result?.error) {
        setErrors({ employeesLimit: result.error });
        return;
      }
    } catch (err) {
      setErrors({
        employeesLimit:
          err?.message || "Unable to update staff limit. Please try again.",
      });
      return;
    }

    // Reset form
    setDepartmentName("");
    setHodRole("");
    setEmployeesLimit("");
    setErrors({});
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/10 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/70 p-6 shadow-lg backdrop-filter backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">
            {title ||
              (mode === "edit" ? "Update Staff Limit" : "Add New Department")}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-100 transition"
          >
            <X className="h-4 w-4 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Department Name
            </label>
            <input
              type="text"
              value={departmentName}
              onChange={(e) => setDepartmentName(e.target.value)}
              disabled={mode === "edit"}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                errors.departmentName
                  ? "border-red-500 focus:ring-red-300"
                  : "border-slate-300 focus:ring-blue-500/20"
              } ${mode === "edit" ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
            />
            {errors.departmentName && (
              <p className="mt-1 text-xs text-red-500">
                {errors.departmentName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              HOD Role
            </label>
            <input
              type="text"
              value={hodRole}
              onChange={(e) => setHodRole(e.target.value)}
              disabled={mode === "edit"}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                errors.hodRole
                  ? "border-red-500 focus:ring-red-300"
                  : "border-slate-300 focus:ring-blue-500/20"
              } ${mode === "edit" ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"}`}
            />
            {errors.hodRole && (
              <p className="mt-1 text-xs text-red-500">{errors.hodRole}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">
              Employees Limit
            </label>
            <input
              type="number"
              min={minLimit}
              value={employeesLimit}
              onChange={(e) => {
                const value = e.target.value;
                if (
                  mode === "edit" &&
                  value !== "" &&
                  Number(value) < minLimit
                ) {
                  setEmployeesLimit(String(minLimit));
                } else {
                  setEmployeesLimit(value);
                }
              }}
              className={`mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 ${
                errors.employeesLimit
                  ? "border-red-500 focus:ring-red-300"
                  : "border-slate-300 focus:ring-blue-500/20"
              }`}
            />
            {mode === "edit" && (
              <p className="mt-1 text-xs text-slate-500">
                {minLimit} approved staff
              </p>
            )}
            {errors.employeesLimit && (
              <p className="mt-1 text-xs text-red-500">
                {errors.employeesLimit}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            {submitLabel || (mode === "edit" ? "Update" : "Add Department")}
          </button>
        </form>
      </div>
    </div>
  );
}
