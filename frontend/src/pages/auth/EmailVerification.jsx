import { useState } from "react";
import axiosInstance from "../../api/axiosInstance";

export default function EmailVerification({
  email,
  onVerified,
  onBack,
}) {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==========================
  // VERIFY OTP
  // ==========================
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);
      setError("");

      await axiosInstance.post("/auth/verify-otp", {
        email,
        otp,
      });

      onVerified(); // 🔥 callback

    } catch (err) {
      setError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // RESEND OTP
  // ==========================
  const handleResendOtp = async () => {
    try {
      await axiosInstance.post("/auth/resend-otp", { email });
    } catch (err) {
      setError("Failed to resend OTP");
    }
  };

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <input
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        placeholder="Enter OTP"
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
      />

      <button
        onClick={handleVerifyOtp}
        disabled={loading}
        className="w-full rounded-xl bg-green-600 text-white py-2.5 text-sm font-semibold"
      >
        {loading ? "Verifying..." : "Verify OTP"}
      </button>

      <button
        onClick={handleResendOtp}
        className="w-full rounded-xl bg-gray-200 py-2.5 text-sm font-semibold"
      >
        Resend Code
      </button>

      {/* optional back */}
      {onBack && (
        <button
          onClick={onBack}
          className="w-full text-sm text-blue-600 underline"
        >
          Back
        </button>
      )}
    </div>
  );
}