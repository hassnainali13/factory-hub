import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

const useAttendanceConfig = () => {
  const [config, setConfig] = useState(null);

  const fetchConfig = async () => {
    const res = await axiosInstance.get("/attendance-time-config");
    setConfig(res.data);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return config;
};

export default useAttendanceConfig;