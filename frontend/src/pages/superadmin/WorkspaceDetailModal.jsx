import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function WorkspaceDetailModal({
  workspaceId,
  apiBaseUrl,
  onClose,
}) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Workspace detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspace();
  }, [workspaceId]);

  const logoUrl = workspace?.logo
    ? workspace.logo.startsWith("http")
      ? workspace.logo
      : `${apiBaseUrl}/${workspace.logo.replace(/\\/g, "/")}`
    : null;

  if (!workspaceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 w-96 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
        >
          ✕
        </button>

        {loading ? (
          <div className="py-10 text-center text-slate-500">Loading...</div>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-4">
            {/* Workspace Logo */}
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={workspace?.name}
                className="w-24 h-24 object-cover rounded-full border"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-full grid place-items-center text-gray-400">
                N/A
              </div>
            )}

            <h2 className="text-xl font-semibold text-slate-900">
              {workspace?.workspaceName || "N/A"}
            </h2>

            <div className="w-full border-t border-slate-100 my-3" />

            {/* Workspace & User Details */}
            <div className="w-full space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span className="font-medium">User Name:</span>
                <span>{workspace?.userName || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">User Email:</span>
                <span>{workspace?.userEmail || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span>{workspace?.workspaceRole || "N/A"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Workspace Code:</span>
                <span>{workspace?.code || "N/A"}</span>
              </div>
            </div>

            {/* Close Action Button */}
            <button
              onClick={onClose}
              className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
