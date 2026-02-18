//frontend\src\pages\auth\DepartmentProcessPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function DepartmentProcessPage() {
  const navigate = useNavigate();

  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axiosInstance.get("/join/dashboard-status");
        const data = res.data;

        if (data.type === "pending") {
          setDepartment(data.department);
        } else if (data.type === "assigned") {
          navigate("/department/dashboard");
        } else if (data.type === "noDepartment") {
          navigate("/join-workspace");
        } else {
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

  const handleBackToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 font-medium">Checking request status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-lg bg-white p-7 rounded-2xl shadow-md text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          Request Pending
        </h2>

        <p className="text-slate-600">
          Your request to become head of the department{" "}
          <span className="font-semibold text-slate-900">
            "{department?.department}"
          </span>{" "}
          is pending approval.
        </p>

        <button
          onClick={handleBackToLogin}
          className="mt-6 w-full py-2 rounded-xl bg-black text-white font-semibold hover:bg-slate-800 transition"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}
