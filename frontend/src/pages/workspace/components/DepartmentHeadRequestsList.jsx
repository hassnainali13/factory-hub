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

  // ✅ Fetch pending requests whenever modal opens or department changes
  useEffect(() => {
    if (!open || !department?._id) return;

    const fetchPendingRequests = async () => {
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
        console.error("Error fetching pending users:", err);
        setPendingRequests([]);
      }
    };

    fetchPendingRequests();
  }, [open, department]);

  if (!open) return null;

  // ✅ Approve Request
  const handleApprove = async (userId) => {
    setLoadingId(userId); // ✅ Show loading on button

    try {
      await axiosInstance.patch(`/departments/approve-head/${userId}`);

      // ✅ Refresh departments for dashboard sync
      if (workspaceId && setDepartments) {
        const res = await axiosInstance.get(
          `/departments?workspaceId=${workspaceId}`,
        );
        setDepartments(res.data);
      }

      // ✅ Remove approved user from modal instantly
      setPendingRequests((prev) => prev.filter((u) => u._id !== userId));

      // ✅ Show tick screen after API success
      setSuccess(true);

      // ✅ Hide tick and close modal after 2 sec
      setTimeout(() => {
        setSuccess(false);
        onClose?.();
      }, 2000);
    } catch (err) {
      console.error("Error approving request:", err);
    } finally {
      setLoadingId(null); // ✅ Remove loading state from button
    }
  };

  // ✅ Reject Request
  const handleReject = async (userId) => {
    try {
      setLoadingId(userId);

      await axiosInstance.patch(`/departments/reject/${userId}`);

      // Remove rejected user from modal instantly
      setPendingRequests((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error("Error rejecting request:", err);
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
              <span className="font-medium">
                {department?.name || department?.department}
              </span>
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
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-12 animate-fadeIn">
              <FaCheckCircle className="text-emerald-500 text-6xl mb-4 animate-bounce" />
              <p className="text-xl font-semibold text-slate-900">
                Request Approved Successfully
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Closing in 2 seconds...
              </p>
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
