// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import axiosInstance from "../../api/axiosInstance";
// import { toast } from "react-toastify";
// import EmailVerification from "./EmailVerification";

// export default function Login() {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [step, setStep] = useState("login");
//   const [verifyEmail, setVerifyEmail] = useState("");

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   // ==========================
//   // NAVIGATE BY ROLE
//   // ==========================
//   const navigateByRole = (user) => {
//     const role = (user.role || "").toLowerCase();
//     const reqStatus = (user.requestStatus || "").toLowerCase();
//     const workspaceStatus = (user.workspaceStatus || "").toLowerCase();

//     // 1. SuperAdmin
//     if (role === "superadmin") {
//       navigate("/superadmin/dashboard");
//       return;
//     }

//     // 2. Staff
//     if (role === "staff") {
//       if (user.staffstatus === "approved") {
//         navigate("/staff/dashboard");
//       } else {
//         navigate("/staff/staff-processing");
//       }
//       return;
//     }

//     // 3. Department Head
//     //  ✅ Department Head Dashboard
//       if (role === "department_head" && reqStatus === "approved") {
//         navigate("/department/dashboard");
//         return;
//       }

//       // ✅ Department Request Pending
//       if (user.departmentId && reqStatus === "pending") {
//         navigate("/workspace/department-processing");
//         return;
//       }

//     // 4. General Manager / Industry Head
//     if (role === "general_manager" || role === "industry_head") {
//       if (!user.workspaceId) {
//         // workspace banaya hi nahi
//         navigate("/workspace-options");
//         return;
//       }

//       if (workspaceStatus === "pending") {
//         navigate(`/workspace/processing/${user.workspaceId}`);
//         return;
//       }

//       if (workspaceStatus === "active") {
//         navigate("/workspace/dashboard");
//         return;
//       }

//       // fallback — workspace hai but status unknown
//       navigate("/workspace/dashboard");
//       return;
//     }

//     // 5. Default — no role yet
//     navigate("/workspace-options");
//   };

//   // ==========================
//   // LOGIN
//   // ==========================
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

//       toast.success("Login successful 🎉");

//       navigateByRole(data.user);
//     } catch (err) {
//       const data = err.response?.data;

//       if (data?.verifyRequired) {
//         setStep("verify");
//         setVerifyEmail(data.email);
//         setError(data.message);
//         toast.info("Email verification required 📩");
//         return;
//       }

//       setError(data?.message || "Server error, try again");
//       toast.error(data?.message || "Login failed ❌");
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

//         {step === "login" && (
//           <form onSubmit={handleLogin} className="mt-6 space-y-4">
//             <div>
//               <label className="text-sm font-medium text-slate-700">
//                 Email
//               </label>
//               <input
//                 name="email"
//                 value={form.email}
//                 onChange={handleChange}
//                 type="email"
//                 placeholder="Enter email"
//                 className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//             </div>

//             <div className="relative mt-2">
//               <input
//                 name="password"
//                 value={form.password}
//                 onChange={handleChange}
//                 type={showPassword ? "text" : "password"}
//                 placeholder="Enter password"
//                 className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
//                 required
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600"
//               >
//                 {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
//               </button>
//             </div>

//             <button
//               disabled={loading}
//               className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60"
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         )}

//         {step === "verify" && (
//           <EmailVerification
//             email={verifyEmail}
//             onVerified={() => {
//               setStep("login");
//             }}
//             onBack={() => setStep("login")}
//           />
//         )}

//         <div className="mt-6 text-sm text-slate-600">
//           <p>
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
