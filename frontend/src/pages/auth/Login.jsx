//frontend\src\pages\auth\Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import axiosInstance from "../../api/axiosInstance";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

      const user = data.user;
      // console.log("LOGIN USER:", user);
      // =========================================================
      // ✅ Navigation Logic (FIXED ORDER)
      // Priority → Superadmin → Staff → Department Request → Workspace Flow
      // =========================================================
      const reqStatus = (user.requestStatus || "").toLowerCase();
      const role = (user.role || "").toLowerCase();

      // ✅ Superadmin
      if (role === "superadmin") {
        navigate("/superadmin/dashboard");
        return;
      }

      // ✅ Staff Approved
      if (role === "staff"  && user.staffstatus === "approved") {
        navigate("/staff/dashboard");
        return;
      }

      // ✅ Staff Pending Request
      if (user.staffId && role === "staff" && user.staffstatus === "pending") {
        navigate("/staff/staff-processing");
        return;
      }

      // ✅ Department Head Dashboard
      if (role === "department_head" && reqStatus === "approved") {
        navigate("/department/dashboard");
        return;
      }

      // ✅ Department Request Pending
      if (user.departmentId && reqStatus === "pending") {
        navigate("/workspace/department-processing");
        return;
      }

      // ✅ Workspace Processing
      if (user.workspaceStatus === "pending") {
        navigate(`/workspace/processing/${user.workspaceId}`);
        return;
      }

      // ✅ Workspace Dashboard
      if (user.workspaceStatus === "active") {
        navigate("/workspace/dashboard");
        return;
      }

      // ✅ Default fallback
      navigate("/workspace-options");
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || "Server error, try again");
    } finally {
      setLoading(false);
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

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Email</label>
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

          <div className="relative mt-2">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              placeholder="Enter password"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-600 transition-colors"
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

        <div className="mt-6 text-sm text-slate-600">
          <p className="mt-1">
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
