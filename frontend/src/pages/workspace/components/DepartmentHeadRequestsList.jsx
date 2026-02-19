// frontend\src\pages\workspace\components\DepartmentHeadRequestsList.jsx

import React, { useEffect, useState } from "react";
import { FaCheckCircle, FaTimes } from "react-icons/fa";
import axiosInstance from "../../../api/axiosInstance";

const DepartmentHeadRequestsList = ({
  open,
  onClose,
  department,
  workspaceId,
  setDepartments,
}) => {
  const [loadingId, setLoadingId] = useState(null);
  const [success, setSuccess] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);

  // ✅ Fetch pending users for this department when modal opens
  useEffect(() => {
    if (!open || !department?._id) return;

    const fetchPendingUsers = async () => {
      try {
        const res = await axiosInstance.get("/users/pending");
        const filtered = Array.isArray(res.data)
          ? res.data.filter(
              (u) =>
                u.requestStatus === "pending" &&
                String(u.departmentId?._id || u.departmentId) ===
                  String(department._id),
            )
          : [];
        setPendingRequests(filtered);
      } catch (err) {
        console.error("Error fetching users:", err);
        setPendingRequests([]);
      }
    };

    fetchPendingUsers();
  }, [open, department]);

  if (!open) return null;

  // ✅ Approve request
  const handleApprove = async (userId) => {
    try {
      setLoadingId(userId);

      // Call backend to approve user
      // DepartmentHeadRequestsList.jsx
      await axiosInstance.patch(`/departments/approve-head/${userId}`);

      // Refetch departments from backend
      const res = await axiosInstance.get(
        `/departments?workspaceId=${workspaceId}`,
      );
      setDepartments(res.data);

      // Update pending requests
      const allPending = res.data.flatMap((d) =>
        Array.isArray(d.users)
          ? d.users.filter((u) => u.requestStatus === "pending")
          : [],
      );
      setPendingRequests(allPending);

      setSuccess(true);

      // Auto-close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error("Error approving:", err);
    } finally {
      setLoadingId(null);
    }
  };

  // ✅ Reject request
  const handleReject = async (userId) => {
    try {
      setLoadingId(userId);

      // Call backend to reject user
      await axiosInstance.patch(`/departments/reject/${userId}`);

      // Refetch departments
      const res = await axiosInstance.get(
        `/departments?workspaceId=${workspaceId}`,
      );
      setDepartments(res.data);

      // Update pending requests
      const allPending = res.data.flatMap((d) =>
        Array.isArray(d.users)
          ? d.users.filter((u) => u.requestStatus === "pending")
          : [],
      );
      setPendingRequests(allPending);
    } catch (err) {
      console.error("Error rejecting:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Department Head Requests
            </h2>
            <p className="text-sm text-slate-500">
              Department:{" "}
              <span className="font-medium">{department?.department}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
          >
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10">
              <FaCheckCircle className="text-emerald-500 text-5xl mb-3" />
              <p className="text-lg font-semibold text-slate-900">
                Request Approved Successfully
              </p>
              <p className="text-sm text-slate-500">Closing in 2 seconds...</p>
            </div>
          ) : pendingRequests.length === 0 ? (
            <p className="text-center text-sm text-slate-500 py-6">
              No pending requests found for this department.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="py-2 text-xs font-semibold uppercase text-slate-400">
                      User Name
                    </th>
                    <th className="py-2 text-xs font-semibold uppercase text-slate-400 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-50">
                  {pendingRequests.map((u) => (
                    <tr key={u._id}>
                      <td className="py-3 text-sm font-medium text-slate-900">
                        {u.name}
                      </td>

                      <td className="py-3 text-right">
                        <div className="inline-flex gap-2">
                          <button
                            disabled={loadingId === u._id}
                            onClick={() => handleApprove(u._id)}
                            className="px-3 py-1 text-sm font-medium bg-emerald-100 text-emerald-800 rounded-lg hover:bg-emerald-200 transition disabled:opacity-50"
                          >
                            {loadingId === u._id ? "Approving..." : "Approve"}
                          </button>

                          <button
                            disabled={loadingId === u._id}
                            onClick={() => handleReject(u._id)}
                            className="px-3 py-1 text-sm font-medium bg-rose-100 text-rose-800 rounded-lg hover:bg-rose-200 transition disabled:opacity-50"
                          >
                            {loadingId === u._id ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentHeadRequestsList;
