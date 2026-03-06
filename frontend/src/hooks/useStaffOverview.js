import { useEffect, useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";

export default function useStaffOverview() {
  const [staff, setStaff] = useState([]);

  const fetchStaff = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/departments/staff-overview");
      setStaff(res.data || []);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  return {
    staff,
    refetch: fetchStaff, // ⭐ THIS IS THE FIX
  };
}
