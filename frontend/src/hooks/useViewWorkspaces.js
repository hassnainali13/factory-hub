// //frontend\src\hooks\useViewWorkspaces.js
// import { useState, useEffect, useCallback } from "react";

// export default function useAllWorkspaces() {
//   const [workspaces, setWorkspaces] = useState([]);
//   const [users, setUsers] = useState([]); // ✅ all users
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const token = localStorage.getItem("token");
//   const BASE_URL = "http://localhost:5000";

//   // 🔁 FETCH WORKSPACES
//   const fetchWorkspaces = useCallback(async () => {
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     try {
//       const res = await fetch(`${BASE_URL}/api/superadmin/workspaces`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error("Failed to fetch workspaces");

//       const data = await res.json();
//       const sorted = Array.isArray(data)
//         ? data
//         : Array.isArray(data.workspaces)
//         ? data.workspaces
//         : [];

//       setWorkspaces([...sorted].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

//     } catch (err) {
//       console.error("Workspace fetch error:", err);
//       setError(err.message);
//     }
//   }, [token]);

//   // 🔁 FETCH ALL USERS
//   const fetchUsers = useCallback(async () => {
//     if (!token) return;
//     try {
//       const res = await fetch(`${BASE_URL}/api/superadmin/users`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error("Failed to fetch users");

//       const data = await res.json();
//       setUsers(Array.isArray(data) ? data : []);
//     } catch (err) {
//       console.error("Users fetch error:", err);
//       setError(err.message);
//     }
//   }, [token]);

//   // 🚀 APPROVE WORKSPACE (No Full Reload)
//   const approveWorkspace = async (id) => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/superadmin/workspaces/${id}/approve`, {
//         method: "PUT",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error("Failed to approve workspace");

//       setWorkspaces((prev) =>
//         prev.map((ws) => (ws._id === id ? { ...ws, status: "Active" } : ws))
//       );
//     } catch (err) {
//       console.error("Approve error:", err);
//       alert("Approve failed");
//     }
//   };

//   // 🚀 REJECT WORKSPACE
//   const rejectWorkspace = async (id) => {
//     try {
//       const res = await fetch(`${BASE_URL}/api/superadmin/workspaces/${id}/reject`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${token}` },
//       });

//       if (!res.ok) throw new Error("Failed to reject/delete workspace");

//       setWorkspaces((prev) => prev.filter((ws) => ws._id !== id));
//     } catch (err) {
//       console.error("Reject/Delete error:", err);
//       alert("Reject failed");
//     }
//   };

//   useEffect(() => {
//     setLoading(true);
//     Promise.all([fetchWorkspaces(), fetchUsers()]).finally(() => setLoading(false));
//   }, [fetchWorkspaces, fetchUsers]);

//   return {
//     workspaces,
//     users,           // ✅ all users available
//     loading,
//     error,
//     approveWorkspace,
//     rejectWorkspace,
//   };
// }

import { useState, useEffect, useCallback, useMemo } from "react";
import axiosInstance from "../api/axiosInstance";

export default function useAllWorkspaces() {
  const [workspaces, setWorkspaces] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/superadmin/workspaces");
      const sorted = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.workspaces)
          ? res.data.workspaces
          : [];
      setWorkspaces(
        [...sorted].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        ),
      );
    } catch (err) {
      console.error("Workspace fetch error:", err);
      setError(err.message);
    }
  }, []);

  const enrichWorkspacesWithEmployeeCount = useCallback(
    (workspacesData, usersData, departmentsData, staffsData) => {
      return workspacesData.map((workspace) => {
        // Type 1: Users with direct workspaceId
        const directUsers = usersData
          .filter((user) => user.workspaceId === workspace._id)
          .map((u) => u._id);

        // Type 2: Users with departmentId (and that department belongs to this workspace)
        const deptUsersIds = usersData
          .filter((user) => {
            if (!user.departmentId) return false;
            return departmentsData.some(
              (dept) =>
                dept._id === user.departmentId &&
                dept.workspaceId === workspace._id,
            );
          })
          .map((u) => u._id);

        // Type 3: Users with staffId (staff belongs to department of this workspace)
        const staffUsersIds = usersData
          .filter((user) => {
            if (!user.staffId) return false;
            const staff = staffsData.find((s) => s._id === user.staffId);
            if (!staff) return false;
            return departmentsData.some(
              (dept) =>
                dept._id === staff.departmentId &&
                dept.workspaceId === workspace._id,
            );
          })
          .map((u) => u._id);

        // Combine all and get unique count
        const allEmployeeIds = new Set([
          ...directUsers,
          ...deptUsersIds,
          ...staffUsersIds,
        ]);
        const employeeCount = allEmployeeIds.size;

        return { ...workspace, employeeCount };
      });
    },
    [],
  );

  const fetchUsers = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/superadmin/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Users fetch error:", err);
      setError(err.message);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/superadmin/departments");
      setDepartments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Departments fetch error:", err);
      setError(err.message);
    }
  }, []);

  const fetchStaffs = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/superadmin/staffs");
      setStaffs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Staffs fetch error:", err);
      setError(err.message);
    }
  }, []);

  const approveWorkspace = async (id) => {
    try {
      await axiosInstance.put(`/superadmin/workspaces/${id}/approve`);
      setWorkspaces((prev) =>
        prev.map((ws) => (ws._id === id ? { ...ws, status: "active" } : ws)),
      );
    } catch (err) {
      console.error("Approve error:", err);
      alert("Approve failed");
    }
  };

  const rejectWorkspace = async (id) => {
    try {
      await axiosInstance.delete(`/superadmin/workspaces/${id}/reject`);
      setWorkspaces((prev) => prev.filter((ws) => ws._id !== id));
    } catch (err) {
      console.error("Reject/Delete error:", err);
      alert("Reject failed");
    }
  };

  const toggleWorkspaceStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "disabled" ? "active" : "disabled";
    try {
      await axiosInstance.put(`/workspaces/${id}/status`, {
        status: newStatus,
      });
      setWorkspaces((prev) =>
        prev.map((ws) => (ws._id === id ? { ...ws, status: newStatus } : ws)),
      );
    } catch (err) {
      console.error("Toggle workspace status error:", err);
      alert("Failed to update workspace status");
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchWorkspaces(),
      fetchUsers(),
      fetchDepartments(),
      fetchStaffs(),
    ]).finally(() => setLoading(false));
  }, [fetchWorkspaces, fetchUsers, fetchDepartments, fetchStaffs]);

  // Enrich workspaces with employee count (Type 1, 2, 3)
  const enrichedWorkspaces = useMemo(() => {
    return enrichWorkspacesWithEmployeeCount(
      workspaces,
      users,
      departments,
      staffs,
    );
  }, [
    workspaces,
    users,
    departments,
    staffs,
    enrichWorkspacesWithEmployeeCount,
  ]);

  return {
    workspaces: enrichedWorkspaces,
    users,
    departments,
    staffs,
    loading,
    error,
    approveWorkspace,
    rejectWorkspace,
    toggleWorkspaceStatus,
  };
}
