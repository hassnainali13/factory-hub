//frontend\src\components\TestIPLocation.jsx
import React from "react";
import axiosInstance from "../api/axiosInstance";

const TestIPDetect = () => {
  const handleTest = async () => {
    const lat = 24.8607;
    const lng = 67.0011;

    try {
      const res = await axiosInstance.get(`/attendance/debug-ip-location?lat=${lat}&lng=${lng}`);
      console.log("IP + Location Test:", res.data);
      alert(`IP: ${res.data.ip}\nLatitude: ${res.data.latitude}\nLongitude: ${res.data.longitude}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <button
      onClick={handleTest}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      Test IP + Location
    </button>
  );
};

export default TestIPDetect;