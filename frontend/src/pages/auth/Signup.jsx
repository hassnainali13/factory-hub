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
  });

  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 🔥 NEW

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =========================
  // STEP 1: REGISTER
  // =========================
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role: "user" }),
        }
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
        }
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
            </div>

            <button
              disabled={loading}
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