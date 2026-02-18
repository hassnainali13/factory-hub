//frontend\src\pages\workspace\components\GMRequests.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import DepartmentOverviewTable from "./DepartmentOverviewTable";

export default function GMRequests() {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/join/pending-requests");
      // Map backend response to table fields
     const mapped = res.data.map((req) => ({
  _id: req._id, // ✅ IMPORTANT
  department: req.departmentName,
  head: req.name,
  employees: "-",
  status: "pending",
}));

      setPendingRequests(mapped);
    } catch (err) {
      console.error(err);
      setPendingRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axiosInstance.patch(`/join/requests/${userId}/approve`);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (userId) => {
    try {
      await axiosInstance.patch(`/join/requests/${userId}/reject`);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="min-h-screen p-4 bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Pending Department Requests</h1>

      <DepartmentOverviewTable
        title="Pending Requests"
        departments={pendingRequests}
        approveDepartment={handleApprove}
        rejectDepartment={handleReject}
        disableShowMore={true} // hide Show More button
      />
    </div>
  );
}
