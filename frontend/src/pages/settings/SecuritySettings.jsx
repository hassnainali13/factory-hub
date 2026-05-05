import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import EmailVerification from "../auth/EmailVerification";

const SecuritySettings = () => {
  const [step, setStep] = useState("menu");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (storedUser?.email) {
      setEmail(storedUser.email);
    }
  }, []);

  const handleStartPasswordReset = () => {
    setError("");
    if (!email) {
      setError(
        "Unable to determine your login email. Please refresh and try again.",
      );
      return;
    }
    setStep("confirm");
  };

  const handleSendOTP = async () => {
    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setStep("verify-otp");
      toast.success("OTP sent to your email 📩");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
      toast.error(err.response?.data?.message || "Failed to send OTP ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
        confirmPassword,
      });
      setStep("menu");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password reset successful 🎉");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
      toast.error(err.response?.data?.message || "Failed to reset password ❌");
    } finally {
      setLoading(false);
    }
  };

  if (step === "menu") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">
            Security Settings
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Password Management
          </h3>
          <p className="text-gray-600 mb-6">
            Reset your password using the email currently logged in.
          </p>

          <button
            onClick={handleStartPasswordReset}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Change Password
          </button>
        </div>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("menu")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            Confirm Password Reset
          </h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md">
          <div className="mb-6 text-sm text-gray-700">
            An OTP will be sent to your logged in email address.
          </div>

          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-4">
            <p className="text-sm text-gray-700">Logged in email:</p>
            <p className="mt-2 font-medium text-gray-900">
              {email || "Not available"}
            </p>
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      </div>
    );
  }

  if (step === "verify-otp") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("confirm")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Enter OTP</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md">
          <EmailVerification
            email={email}
            verifyEndpoint="/auth/verify-reset-otp"
            resendEndpoint="/auth/resend-reset-otp"
            onVerified={(verifiedOtp) => {
              setOtp(verifiedOtp);
              setStep("reset-password");
            }}
            onBack={() => setStep("confirm")}
          />
        </div>
      </div>
    );
  }

  if (step === "reset-password") {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setStep("verify-otp")}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ← Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-w-md">
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showNewPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};

export default SecuritySettings;
