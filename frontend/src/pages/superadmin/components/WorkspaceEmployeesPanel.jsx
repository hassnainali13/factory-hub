import { useMemo, useState } from "react";
import WorkspaceUsersSection from "../../department/components/WorkspaceUsersSection";

const GROUP_OPTIONS = [
  { id: "workspaceAdmin", label: "General Manager" },
  { id: "departmentHead", label: "Dept. Heads" },
  { id: "staff", label: "Staff" },
];

const normalizeRole = (user) =>
  (user.role || user.originalRole || "").toString().toLowerCase();

const isWorkspaceAdminRole = (user) => {
  const role = normalizeRole(user);
  return [
    "general_manager",
    "industry_head",
    "workspace_admin",
    "admin",
  ].includes(role);
};

const isDepartmentHeadRole = (user, departments = []) => {
  // Check if user is assigned as department head in any department
  return departments.some(dept => dept.deptHeadId === user._id);
};

const isStaffRole = (user) => {
  const role = normalizeRole(user);
  return ["staff", "employee"].includes(role);
};

const getWorkspaceAdminLabel = (user) => {
  if (!user) return "General Manager";
  const role = normalizeRole(user);
  if (role === "industry_head") return "Industry Head";
  if (role === "general_manager") return "General Manager";
  if (role === "workspace_admin") return "Workspace Admin";
  if (role === "admin") return "Admin";
  return "General Manager";
};

export default function WorkspaceEmployeesPanel({
  workspaces = [],
  selectedWorkspaceId,
  setSelectedWorkspaceId,
  selectedWorkspace,
  workspaceUsers = [],
  loadingUsers = false,
  uniqueDepartments = [],
}) {
  const [nameSearch, setNameSearch] = useState("");
  const [activeUserGroup, setActiveUserGroup] = useState("workspaceAdmin");
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [staffSearch, setStaffSearch] = useState("");
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] =
    useState("all");

  const workspaceAdminUser = useMemo(
    () => workspaceUsers.find(isWorkspaceAdminRole) || null,
    [workspaceUsers],
  );

  const departmentHeadUsers = useMemo(
    () => workspaceUsers.filter((user) => isDepartmentHeadRole(user, uniqueDepartments)),
    [workspaceUsers, uniqueDepartments],
  );

  const allStaff = useMemo(
    () => workspaceUsers.filter(isStaffRole),
    [workspaceUsers],
  );

  // ── Normalize departments — name field ensure karo ────────────────────────
  const derivedUniqueDepartments = useMemo(() => {
    // Pehle passed uniqueDepartments use karo (already normalized from dashboard)
    if (uniqueDepartments.length > 0) {
      return uniqueDepartments.map((d) => ({
        _id: d._id || d.id,
        name: d.name || d.departmentName || d.title || "Unnamed",
      }));
    }
    // Fallback: workspaceUsers (staff + dept heads) se derive karo
    const map = new Map();
    [...allStaff, ...departmentHeadUsers].forEach((u) => {
      const id =
        u.departmentInfo?._id ||
        u.departmentId?._id ||
        (typeof u.departmentId === "string" ? u.departmentId : null);
      const name =
        u.departmentInfo?.name ||
        u.departmentInfo?.department ||
        u.departmentInfo?.departmentName ||
        u.departmentId?.name ||
        u.departmentId?.department ||
        u.departmentId?.departmentName ||
        u.departmentName ||
        u.department ||
        null;
      if (id && name && name !== "N/A" && !map.has(id)) {
        map.set(String(id), { _id: String(id), name });
      }
    });
    return Array.from(map.values());
  }, [uniqueDepartments, allStaff, departmentHeadUsers]);

  const getDepartmentId = (u) =>
    u.departmentInfo?._id ||
    u.departmentId?._id ||
    (typeof u.departmentId === "string" ? u.departmentId : null);

  const filteredStaffUsers = useMemo(() => {
    return allStaff.filter((u) => {
      const matchSearch =
        !staffSearch ||
        (u.name || "").toLowerCase().includes(staffSearch.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(staffSearch.toLowerCase());

      const deptId = getDepartmentId(u);

      const matchDept =
        selectedDepartmentFilter === "all" ||
        String(deptId) === String(selectedDepartmentFilter);

      return matchSearch && matchDept;
    });
  }, [allStaff, staffSearch, selectedDepartmentFilter]);

  // ── Reset user group & selection when workspace changes ───────────────────
  const handleWorkspaceSelect = (id) => {
    setSelectedWorkspaceId(id);
    setActiveUserGroup("workspaceAdmin");
    setSelectedUserDetails(null);
    setStaffSearch("");
    setSelectedDepartmentFilter("all");
  };

  const handleBack = () => {
    setSelectedWorkspaceId(null);
    setSelectedUserDetails(null);
    setActiveUserGroup("workspaceAdmin");
  };

  // ── Step 1: Show workspace list ───────────────────────────────────────────
  if (!selectedWorkspace) {
    const filtered = workspaces.filter((ws) =>
      (ws.name || ws.workspaceName || "")
        .toLowerCase()
        .includes(nameSearch.toLowerCase()),
    );

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-900">
            All Workspaces
          </h2>
          <input
            type="text"
            placeholder="search by name"
            value={nameSearch}
            onChange={(e) => setNameSearch(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-blue-400 w-64"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
              No workspaces found.
            </div>
          ) : (
            filtered.map((ws) => (
              <button
                key={ws._id}
                onClick={() => handleWorkspaceSelect(ws._id)}
                className="w-full flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left hover:bg-slate-50 transition group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-medium shrink-0 overflow-hidden">
                  {ws.logo ? (
                    <img
                      src={ws.logo}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "logo"
                  )}
                </div>
                <span className="flex-1 font-medium text-slate-800">
                  {ws.name || ws.workspaceName || "Unnamed Workspace"}
                </span>
                <span className="text-blue-400 text-lg group-hover:translate-x-0.5 transition-transform">
                  ›
                </span>
              </button>
            ))
          )}
        </div>
      </section>
    );
  }

  // ── Step 2: Workspace selected — render WorkspaceUsersSection ─────────────
  return (
    <div className="space-y-3">
      {/* Back button row */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 transition shadow-sm"
        >
          <span>←</span>
          <span>All Workspaces</span>
        </button>
        <span className="text-slate-400 text-sm">/</span>
        <span className="text-sm font-medium text-slate-700">
          {selectedWorkspace.name || selectedWorkspace.workspaceName}
        </span>
      </div>

      {/* WorkspaceUsersSection */}
      <WorkspaceUsersSection
        title="Workspace Users"
        subtitle="Select a user type to view details and list."
        groupOptions={GROUP_OPTIONS}
        activeUserGroup={activeUserGroup}
        onGroupChange={(id) => {
          setActiveUserGroup(id);
          setSelectedUserDetails(null);
        }}
        loadingUsers={loadingUsers}
        workspaceAdminUser={workspaceAdminUser}
        workspaceAdminLabel={getWorkspaceAdminLabel(workspaceAdminUser)}
        departmentHeadUsers={departmentHeadUsers}
        filteredStaffUsers={filteredStaffUsers}
        selectedUserDetails={selectedUserDetails}
        setSelectedUserDetails={setSelectedUserDetails}
        staffSearch={staffSearch}
        onStaffSearchChange={setStaffSearch}
        selectedDepartmentFilter={selectedDepartmentFilter}
        onDepartmentFilterChange={setSelectedDepartmentFilter}
        uniqueDepartments={derivedUniqueDepartments}
      />
    </div>
  );
}
