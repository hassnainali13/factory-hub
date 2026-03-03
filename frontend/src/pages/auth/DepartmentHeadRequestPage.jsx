//frontend\src\pages\auth\DepartmentHeadRequestPage.jsx
import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";

export default function DepartmentHeadRequestPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const {
    workspaceId = null,
    departmentId = null,
    departmentName = "",
  } = state || {};

  const [loading, setLoading] = useState(false);

  // ⭐ UI STATE CONTROL
  const [step, setStep] = useState("idle");
  // idle → confirm → success

  const token = localStorage.getItem("token");

  const sendRequest = useCallback(async () => {
    try {
      setLoading(true);

      await axiosInstance.post(
        "/join/send-department-request",
        { workspaceId, departmentId },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setStep("success");

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, departmentId, navigate, token]);

  if (!workspaceId || !departmentId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center">
          <h2 className="text-xl font-bold text-red-500">Invalid Access</h2>
          <button
            onClick={() => navigate("/join-workspace")}
            className="mt-4 px-5 py-2 bg-black text-white rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4">
      <div className="bg-white/70 backdrop-blur-xl border border-white/40 p-10 rounded-3xl shadow-2xl max-w-md w-full text-center">
        {/* ⭐ IDLE STATE */}
        {step === "idle" && (
          <>
            <h1 className="text-3xl font-bold text-gray-800">
              Department Request
            </h1>

            <p className="text-gray-500 mt-3">
              Send request to become Department Head
            </p>

            <div className="mt-6 bg-gradient-to-r from-indigo-100 to-blue-100 p-4 rounded-2xl text-sm">
              <span className="font-semibold">Department:</span>{" "}
              {departmentName}
            </div>

            <button
              onClick={() => setStep("confirm")}
              className="mt-8 w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold shadow-lg hover:scale-[1.02] transition"
            >
              Send Request
            </button>

            <button
              onClick={() => navigate("/login")}
              className="mt-4 w-full py-3 rounded-2xl border border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              Back
            </button>
          </>
        )}

        {/* ⭐ CONFIRM STATE */}
        {step === "confirm" && (
          <>
            <h2 className="text-xl font-bold text-gray-800">Confirm Request</h2>

            <p className="text-gray-500 mt-3 text-sm">
              Are you sure you want to send department request?
            </p>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setStep("idle")}
                className="flex-1 py-3 rounded-xl border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                onClick={sendRequest}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
              >
                {loading ? "Sending..." : "Confirm"}
              </button>
            </div>
          </>
        )}

        {/* ⭐ SUCCESS STATE */}
        {step === "success" && (
          <div className="flex flex-col items-center animate-fadeIn">
            <div className="relative flex justify-center">
              <div className="absolute w-28 h-28 bg-green-400 rounded-full blur-3xl opacity-40 animate-pulseSlow"></div>

              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-xl animate-scaleUp">
                <svg
                  className="w-12 h-12 text-white animate-drawTick"
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
              Your department head request has been sent successfully.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
