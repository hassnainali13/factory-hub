// //frontend\src\pages\auth\Login.jsx
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import axiosInstance from "../../api/axiosInstance";

// export default function Login() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const res = await axiosInstance.post("/auth/login", form);
//       const data = res.data;

//       localStorage.clear();
//       localStorage.setItem("token", data.token);
//       localStorage.setItem("user", JSON.stringify(data.user));

//       const user = data.user;
//       // console.log("LOGIN USER:", user);
//       // =========================================================
//       // ✅ Navigation Logic (FIXED ORDER)
//       // Priority → Superadmin → Staff → Department Request → Workspace Flow
//       // =========================================================
//       const reqStatus = (user.requestStatus || "").toLowerCase();
//       const role = (user.role || "").toLowerCase();

//       // ✅ Superadmin
//       if (role === "superadmin") {
//         navigate("/superadmin/dashboard");
//         return;
//       }

//       // ✅ Staff Approved
//       if (role === "staff"  && user.staffstatus === "approved") {
//         navigate("/staff/dashboard");
//         return;
//       }

//       // ✅ Staff Pending Request
//       if (user.staffId && role === "staff" && user.staffstatus === "pending") {
//         navigate("/staff/staff-processing");
//         return;
//       }

//       // ✅ Department Head Dashboard
//       if (role === "department_head" && reqStatus === "approved") {
//         navigate("/department/dashboard");
//         return;
//       }

//       // ✅ Department Request Pending
//       if (user.departmentId && reqStatus === "pending") {
//         navigate("/workspace/department-processing");
//         return;
//       }

//       // ✅ Workspace Processing
//       if (user.workspaceStatus === "pending") {
//         navigate(`/workspace/processing/${user.workspaceId}`);
//         return;
//       }

//       // ✅ Workspace Dashboard
//       if (user.workspaceStatus === "active") {
//         navigate("/workspace/dashboard");
//         return;
//       }

//       // ✅ Default fallback
//       navigate("/workspace-options");
//     } catch (err) {
//       console.log(err);
//       setError(err.response?.data?.message || "Server error, try again");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
//         <h1 className="text-2xl font-semibold text-slate-900">
//           Login to FactoryHub
//         </h1>
//         <p className="text-sm text-slate-500 mt-1">login here.</p>

//         {error && (
//           <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleLogin} className="mt-6 space-y-4">
//           <div>
//             <label className="text-sm font-medium text-slate-700">Email</label>
//             <input
//               name="email"
//               value={form.email}
//               onChange={handleChange}
//               type="email"
//               placeholder="Enter email"
//               className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//               required
//             />
//           </div>

//           <div className="relative mt-2">
//             <input
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               type={showPassword ? "text" : "password"}
//               placeholder="Enter password"
//               className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//               required
//             />

//             <button
//               type="button"
//               onClick={() => setShowPassword(!showPassword)}
//               className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors"
//             >
//               {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
//             </button>
//           </div>

//           <button
//             disabled={loading}
//             className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
//           >
//             {loading ? "Logging in..." : "Login"}
//           </button>
//         </form>

//         <div className="mt-6 text-sm text-slate-600">
//           <p className="mt-1">
//             Create account?{" "}
//             <span
//               className="text-blue-600 cursor-pointer hover:underline"
//               onClick={() => navigate("/signup")}
//             >
//               signup here
//             </span>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";
import { toast } from "react-toastify"; // ✅ NEW
import EmailVerification from "./EmailVerification";
export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  const [verifyEmail, setVerifyEmail] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ==========================
  // LOGIN
  // ==========================
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

      toast.success("Login successful 🎉"); // ✅ NEW

      const user = data.user;

      const reqStatus = (user.requestStatus || "").toLowerCase();
      const role = (user.role || "").toLowerCase();

      if (role === "superadmin") {
        navigate("/superadmin/dashboard");
        return;
      }

      if (role === "staff" && user.staffstatus === "approved") {
        navigate("/staff/dashboard");
        return;
      }

      if (user.staffId && role === "staff" && user.staffstatus === "pending") {
        navigate("/staff/staff-processing");
        return;
      }

      if (role === "department_head" && reqStatus === "approved") {
        navigate("/department/dashboard");
        return;
      }

      if (user.departmentId && reqStatus === "pending") {
        navigate("/workspace/department-processing");
        return;
      }

      if (user.workspaceStatus === "pending") {
        navigate(`/workspace/processing/${user.workspaceId}`);
        return;
      }

      if (user.workspaceStatus === "active") {
        navigate("/workspace/dashboard");
        return;
      }

      navigate("/workspace-options");

    } catch (err) {
      const data = err.response?.data;

      if (data?.verifyRequired) {
        setStep("verify");
        setVerifyEmail(data.email);
        setError(data.message);
        toast.info("Email verification required 📩"); // ✅ NEW
        return;
      }

      setError(data?.message || "Server error, try again");
      toast.error(data?.message || "Login failed ❌"); // ✅ NEW

    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // VERIFY OTP
  // ==========================
  const handleVerifyOtp = async () => {
    try {
      setLoading(true);

      await axiosInstance.post("/auth/verify-otp", {
        email: verifyEmail,
        otp,
      });

      toast.success("Email verified successfully ✅"); // ✅ UPDATED

      setStep("login");
      setOtp("");

    } catch (err) {
      const msg = err.response?.data?.message || "OTP verification failed";
      setError(msg);
      toast.error(msg); // ✅ UPDATED
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // RESEND OTP
  // ==========================
  const handleResendOtp = async () => {
    try {
      await axiosInstance.post("/auth/resend-otp", {
        email: verifyEmail,
      });

      toast.success("OTP resent successfully 🔁"); // ✅ UPDATED
    } catch (err) {
      setError("Failed to resend OTP");
      toast.error("Failed to resend OTP ❌"); // ✅ UPDATED
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h1 className="text-2xl font-semibold text-slate-900">
          Login to FactoryHub
        </h1>
        <p className="text-sm text-slate-500 mt-1">login here.</p>

        {error && (
          <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
          </form>
        )}

        {step === "verify" && (
  <EmailVerification
    email={verifyEmail}
    onVerified={() => {
      setStep("login");
      setOtp("");
    }}
    onBack={() => setStep("login")}
  />
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