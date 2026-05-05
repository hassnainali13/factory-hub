

// frontend/src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify";
import { isRecruiterRole } from "../../utils/isRecruiterRole";
import EmailVerification from "./EmailVerification";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("login");
  const [verifyEmail, setVerifyEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================================================
  // NAVIGATE BY ROLE
  // Priority: Superadmin → Staff → Department Head → GM/Industry → Default
  // =========================================================
  const navigateByRole = (user) => {
    const role = (user.role || "").toLowerCase();
    const reqStatus = (user.requestStatus || "").toLowerCase();
    const workspaceStatus = (user.workspaceStatus || "").toLowerCase();
    // ── 1. Superadmin ─────────────────────────────────────
    if (role === "superadmin") {
      navigate("/superadmin/dashboard");
      return;
    }

    // // ── 2. Staff ──────────────────────────────────────────
    // if (role === "staff") {
    //   if (user.staffstatus === "approved") {
    //     navigate("/staff/dashboard");
    //   }
    //   else {
    //     navigate("/staff/staff-processing");
    //   }
    //   return;
    // }

    // ── 2. Staff ──────────────────────────────────────────
    if (role === "staff") {
      if (user.staffstatus !== "approved") {
        navigate("/staff/staff-processing");
        return;
      }

      // Approved — check department head
      const departmentHead = user?.staffId?.departmentId?.head || "";
      console.log("Department Head:", departmentHead);

      if (isRecruiterRole(departmentHead)) {
        navigate("/hr-staff/dashboard");
      } else {
        navigate("/staff/dashboard");
      }
      return;
    }

    // ── 3. Department Head (2 types) ──────────────────────
    if (role === "department_head") {
      // Pending — same for both types
      if (user.departmentId && reqStatus === "pending") {
        navigate("/workspace/department-processing");
        return;
      }

      if (reqStatus === "approved") {
        const departmentHead = user?.departmentId?.head || "";

        // ✅ Type 1 — HR Department Head (Recruiter / HR Head / etc.)
        if (isRecruiterRole(departmentHead)) {
          navigate("/hr-department/dashboard");
          return;
        }

        // ✅ Type 2 — Normal Department Head
        navigate("/department/dashboard");
        return;
      }
    }

    // ── 4. General Manager / Industry Head ────────────────
    if (role === "general_manager" || role === "industry_head") {
      if (!user.workspaceId) {
        navigate("/workspace-options");
        return;
      }

      if (workspaceStatus === "pending") {
        navigate(`/workspace/processing/${user.workspaceId}`);
        return;
      }

      if (workspaceStatus === "active") {
        navigate("/workspace/dashboard");
        return;
      }

      // Fallback — workspace exists but status unknown
      navigate("/workspace/dashboard");
      return;
    }

    // ── 5. Default fallback ───────────────────────────────
    navigate("/workspace-options");
  };

  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axiosInstance.post("/auth/login", form);
      const data = res.data;

      localStorage.clear();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success("Login successful 🎉");

      navigateByRole(data.user);
    } catch (err) {
      const data = err.response?.data;

      if (data?.verifyRequired) {
        setStep("verify");
        setVerifyEmail(data.email);
        setError(data.message);
        toast.info("Email verification required 📩");
        return;
      }

      setError(data?.message || "Server error, try again");
      toast.error(data?.message || "Login failed ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleStartForgotPassword = () => {
    const emailToUse = form.email?.trim() || forgotEmail;
    setForgotEmail(emailToUse);
    setError("");
    setStep("forgot-confirm");
  };

  const handleSendResetOTP = async () => {
    if (!forgotEmail) {
      setError("Please enter your email before sending OTP.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email: forgotEmail });
      setStep("forgot-verify");
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
        email: forgotEmail,
        otp,
        newPassword,
        confirmPassword,
      });
      setStep("login");
      setForm({ ...form, email: forgotEmail, password: "" });
      setForgotEmail("");
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

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Login to FactoryHub
        </h1>
        <p className="text-sm text-slate-500 mt-1">login here.</p>

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Login Form */}
        {step === "login" && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                name="email"
                value={form.email}
                onChange={handleChange}
                type="email"
                placeholder="Enter email"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="relative mt-2">
              <input
                name="password"
                value={form.password}
                onChange={handleChange}
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleStartForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        )}

        {/* Email Verification Step */}
        {step === "verify" && (
          <EmailVerification
            email={verifyEmail}
            onVerified={() => setStep("login")}
            onBack={() => setStep("login")}
          />
        )}

        {/* Forgot Password Confirmation */}
        {step === "forgot-confirm" && (
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendResetOTP();
            }}
          >
            <div>
              <label className="text-sm font-medium text-slate-700">
                Email for password reset
              </label>
              <input
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                type="email"
                placeholder="Enter email"
                className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
              Are you sure you want to reset the password for this account? An
              OTP will be sent to this email.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Sending OTP..." : "Confirm and Send OTP"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("login")}
                className="text-sm text-blue-600 hover:underline"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* Forgot Password OTP Verification */}
        {step === "forgot-verify" && (
          <EmailVerification
            email={forgotEmail}
            verifyEndpoint="/auth/verify-reset-otp"
            resendEndpoint="/auth/resend-reset-otp"
            onVerified={(verifiedOtp) => {
              setOtp(verifiedOtp);
              setStep("reset-password");
            }}
            onBack={() => setStep("forgot-confirm")}
          />
        )}

        {/* Reset Password Form */}
        {step === "reset-password" && (
          <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative mt-2">
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
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
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative mt-2">
                <input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Updating password..." : "Update Password"}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep("forgot-verify")}
                className="text-sm text-blue-600 hover:underline"
              >
                Back
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-sm text-slate-600">
          <p>
            Create account?{" "}
            <span
              className="text-blue-600 cursor-pointer hover:underline"
              onClick={() => navigate("/signup")}
            >
              signup here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
