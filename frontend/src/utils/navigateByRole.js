import { isRecruiterRole } from "./isRecruiterRole";

// =========================================================
// NAVIGATE BY ROLE
// Priority: Superadmin → Staff → Department Head → GM/Industry → Default
// =========================================================
export const navigateByRole = (navigate, user) => {
  const role = (user.role || "").toLowerCase();
  const reqStatus = (user.requestStatus || "").toLowerCase();
  const workspaceStatus = (user.workspaceStatus || "").toLowerCase();
  const Headrole =
    user?.role?.toLowerCase() || user?.originalRole?.toLowerCase() || "";
  // ── 1. Superadmin ─────────────────────────────────────
  if (role === "superadmin") {
    navigate("/superadmin/dashboard");
    return;
  }

  if (workspaceStatus === "disabled" && user.workspaceId) {
    navigate(`/workspace/processing/${user.workspaceId}`);
    return;
  }

  // // ── 2. Staff ──────────────────────────────────────────

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
  if (role === "department_head" || role === Headrole) {
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

    if (workspaceStatus === "disabled") {
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
