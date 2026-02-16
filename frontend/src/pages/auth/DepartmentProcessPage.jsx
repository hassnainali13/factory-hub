// frontend/src/pages/workspace/DepartmentProcessPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function DepartmentProcessPage() {
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosInstance.get("/join/dashboard-status");
        const data = res.data;

        if (data.type === "pending") {
          setWorkspace(data.department);
        } else if (data.type === "assigned") {
          // Redirect to Department Dashboard
          navigate("/department/dashboard");
        } else {
          // Rejected or no workspace
          navigate("/join-workspace");
        }
      } catch (err) {
        console.error(err);
        navigate("/join-workspace");
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-6 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-semibold mb-4">Request Pending</h2>
        <p>Your request to become head of the department "{workspace?.name}" is pending approval.</p>
      </div>
    </div>
  );
}
