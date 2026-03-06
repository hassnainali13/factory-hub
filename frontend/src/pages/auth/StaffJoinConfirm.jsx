import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function StaffJoinConfirm() {
  const location = useLocation();
  const navigate = useNavigate();

  const department = location.state?.department;

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState("confirm");

  if (!department) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-red-500 font-bold text-xl">Invalid Access</h2>

          <button
            onClick={() => navigate("/join-workspace")}
            className="mt-5 px-5 py-2 bg-black text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      await axiosInstance.post(
        "/join/send-staff-request",
        { departmentId: department._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setStep("success");

      // Auto redirect after success
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      alert(err.response?.data?.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
        {/* CONFIRM STATE */}
        {step === "confirm" && (
          <>
            <h2 className="text-xl font-bold text-gray-800">Confirm Request</h2>

            <p className="text-gray-500 mt-3 text-sm">
              Are you sure you want to send staff request?
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => navigate("/join-workspace", { replace: true })}
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white hover:opacity-95 transition"
              >
                {loading ? "Sending..." : "Confirm"}
              </button>
            </div>
          </>
        )}

        {/* SUCCESS STATE */}
        {step === "success" && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="relative flex justify-center">
              <div className="absolute w-28 h-28 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulse"></div>

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl">
                <svg
                  className="w-12 h-12 text-white animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>

            <h2 className="mt-8 text-2xl font-bold text-gray-800">
              Request Submitted
            </h2>

            <p className="mt-2 text-gray-500 text-sm">
              Your staff request has been sent successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
