import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EmailVerification from "./EmailVerification";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

export default function UserSignup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "", // 🔥 NEW
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🔥 NEW
  const [passwordError, setPasswordError] = useState(""); // 🔥 NEW
  const [isPasswordStrong, setIsPasswordStrong] = useState(false); // 🔥 NEW
  const [passwordStrength, setPasswordStrength] = useState(""); // 🔥 NEW: weak, fair, good, strong
  const [confirmPasswordError, setConfirmPasswordError] = useState(""); // 🔥 NEW
  const [isPasswordsMatch, setIsPasswordsMatch] = useState(false); // 🔥 NEW

  // 🔥 Password strength validation function
  const validatePassword = (password) => {
    if (password.length < 8)
      return "Password must be at least 8 characters long.";
    if (!/[A-Z]/.test(password))
      return "Password must include at least one uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Password must include at least one lowercase letter.";
    if (!/\d/.test(password))
      return "Password must include at least one number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return "Password must include at least one special character.";
    return null; // Strong password
  };

  // 🔥 Get password strength level
  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score <= 2) return "weak";
    if (score <= 3) return "fair";
    if (score <= 4) return "good";
    return "strong";
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    // 🔥 Validate password strength on change
    if (e.target.name === "password") {
      const error = validatePassword(e.target.value);
      setPasswordError(error);
      setIsPasswordStrong(!error);
      setPasswordStrength(getPasswordStrength(e.target.value));
      // Also check confirm password match
      if (form.confirmPassword && e.target.value !== form.confirmPassword) {
        setConfirmPasswordError("Passwords do not match.");
        setIsPasswordsMatch(false);
      } else if (form.confirmPassword) {
        setConfirmPasswordError("");
        setIsPasswordsMatch(true);
      }
    }

    // 🔥 Validate confirm password match
    if (e.target.name === "confirmPassword") {
      if (e.target.value !== form.password) {
        setConfirmPasswordError("Passwords do not match.");
        setIsPasswordsMatch(false);
      } else {
        setConfirmPasswordError("");
        setIsPasswordsMatch(true);
      }
    }
  };

  // =========================
  // STEP 1: REGISTER
  // =========================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    // 🔥 Additional check for password strength
    if (!isPasswordStrong) {
      toast.error(
        "Please ensure your password meets the strength requirements.",
      );
      setLoading(false);
      return;
    }

    // 🔥 Additional check for password match
    if (!isPasswordsMatch) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role: "user" }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Signup failed"); // 🔥 toast alert
        return;
      }

      toast.success("OTP sent to your email!"); // 🔥 toast alert
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error("Server error, please try again later."); // 🔥 toast alert
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 2: VERIFY OTP
  // =========================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            otp,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid OTP"); // 🔥 toast alert
        return;
      }

      toast.success("Email verified successfully!"); // 🔥 toast alert

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Server error"); // 🔥 toast alert
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Employee Signup
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Register as employee (User).
        </p>

        {/* ========================= */}
        {/* STEP 1: SIGNUP FORM */}
        {/* ========================= */}
        {step === 1 && (
          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                type="text"
                placeholder="Enter name"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Password
              </label>
              {/* 🔥 Password wrapper with eye toggle */}
              <div className="relative mt-2">
                <input
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create password"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* 🔥 Password strength error message */}
              {passwordError && (
                <p className="mt-1 text-sm text-red-600">{passwordError}</p>
              )}
              {/* 🔥 Password strength level bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-slate-600">Strength:</span>
                    <span
                      className={`text-xs font-medium ${
                        passwordStrength === "weak"
                          ? "text-red-600"
                          : passwordStrength === "fair"
                            ? "text-yellow-600"
                            : passwordStrength === "good"
                              ? "text-blue-600"
                              : "text-green-600"
                      }`}
                    >
                      {passwordStrength.charAt(0).toUpperCase() +
                        passwordStrength.slice(1)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength === "weak"
                          ? "bg-red-500 w-1/4"
                          : passwordStrength === "fair"
                            ? "bg-yellow-500 w-2/4"
                            : passwordStrength === "good"
                              ? "bg-blue-500 w-3/4"
                              : "bg-green-500 w-full"
                      }`}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <input
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                type="password"
                placeholder="Confirm your password"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                required
              />
              {/* 🔥 Confirm password error message */}
              {confirmPasswordError && (
                <p className="mt-1 text-sm text-red-600">
                  {confirmPasswordError}
                </p>
              )}
            </div>

            <button
              disabled={loading || !isPasswordStrong || !isPasswordsMatch}
              className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Employee Account"}
            </button>
          </form>
        )}

        {/* ========================= */}
        {/* STEP 2: OTP VERIFY */}
        {/* ========================= */}
        {step === 2 && (
          <EmailVerification
            email={form.email}
            onVerified={() => {
              toast.success("Email verified successfully!");
              setTimeout(() => navigate("/login"), 1200);
            }}
            onBack={() => setStep(1)}
          />
        )}

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
