//frontend\src\pages\workspace\components\DepartmentDetailModal.jsx
import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";

export default function DepartmentDetailModal({ departmentId, onClose }) {
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!departmentId) return;
      try {
        const res = await axios.get(
          `/departments/full-details/${departmentId}`,
        );
        setDepartment(res.data);
      } catch (err) {
        console.error("Failed to fetch department:", err);
      }
    };
    fetchDepartment();
  }, [departmentId]);

  const staffMembers =
    department?.users?.filter((u) => u.requestStatus === "approved") || [];

  if (!department) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="relative w-[95%] max-w-[850px] bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-10 border border-gray-100 animate-fadeIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-500 hover:text-gray-900 transition-colors text-2xl"
        >
          ✕
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Section */}
          <div className="md:w-1/2 flex flex-col items-center gap-6 text-center md:text-left">
            {/* Department Info Card */}
            <div className="w-full bg-indigo-50/50 rounded-xl p-9 space-y-3 shadow-inner border border-indigo-100">
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Department:</span>
                <span className="font-medium text-gray-800">
                  {department?.department || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Status:</span>
                <span className="font-medium text-green-500">
                  {department?.status || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-700">Head:</span>
                <span className="font-medium text-gray-800">
                  {department?.deptHeadId?.name || "Not Assigned"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Role:</span>
                <span className="font-medium">{department?.head || "N/A"}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
              <button className="px-5 py-2 bg-red-500 text-white rounded-xl hover:shadow-lg hover:bg-red-600 transition-all">
                Delete
              </button>
              <button className="px-5 py-2 bg-green-500 text-white rounded-xl hover:shadow-lg hover:bg-green-600 transition-all">
                Enable
              </button>
              <button className="px-5 py-2 bg-yellow-500 text-white rounded-xl hover:shadow-lg hover:bg-yellow-600 transition-all">
                Disable
              </button>
              <button className="px-5 py-2 bg-gray-500 text-white rounded-xl hover:shadow-lg hover:bg-gray-600 transition-all">
                Remove Head
              </button>
            </div>
          </div>

          {/* Right Section: Staff Table */}
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Department Staff
            </h3>

            <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100">
              <table className="w-full text-left text-sm text-gray-700">
                <thead className="bg-indigo-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Name</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {staffMembers.length ? (
                    staffMembers.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-indigo-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3">{u.name}</td>
                        <td className="px-4 py-3">{u.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        className="px-4 py-4 text-center text-gray-400"
                      >
                        No staff joined yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
