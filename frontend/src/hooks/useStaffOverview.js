import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function useStaffOverview() {

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    axiosInstance.get("/departments/staff-overview")
      .then(res => setStaff(res.data || []))
      .catch(err => console.error(err.response?.data || err.message))
      .finally(() => setLoading(false));

  }, []);

  return { staff, loading };
}