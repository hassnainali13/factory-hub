//frontend\src\pages\settings\AttendanceTimeSettings.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";

const formatTo12Hour = (time24) => {
  if (!time24) return "";

  let [hour, minute] = time24.split(":");
  hour = parseInt(hour);

  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
};

const AttendanceTimeSettings = ({ readOnly = false }) => {
  const [config, setConfig] = useState({
    checkInStart: "08:00",
    checkInEnd: "08:30",
    absentStart: "08:30",
    absentEnd: "08:40",
  });

  const [loading, setLoading] = useState(false);

  const fetchConfig = async () => {
    try {
      const res = await axiosInstance.get("/attendance-time-config");
      if (res.data) setConfig(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (readOnly) return;

    try {
      setLoading(true);
      await axiosInstance.put("/attendance-time-config", config);
      alert("✅ Settings Updated Successfully");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    if (readOnly) return;

    setConfig({
      ...config,
      [e.target.name]: e.target.value,
    });
  };

  const InputBox = ({ label, name, value }) => (
    <div className="bg-white/70 backdrop-blur-md border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition">
      <label className="text-sm font-medium text-gray-600">{label}</label>

      <input
        type="time"
        name={name}
        value={value}
        onChange={handleChange}
        disabled={readOnly}
        className="w-full mt-2 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <p className="text-xs text-gray-400 mt-2">
        {formatTo12Hour(value)}
      </p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto p-6">

  

      {/* CARD WRAPPER */}
      <div className="bg-white/80 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg p-6">

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <InputBox
            label="Check-In Start"
            name="checkInStart"
            value={config.checkInStart}
          />

          <InputBox
            label="Check-In End"
            name="checkInEnd"
            value={config.checkInEnd}
          />

          <InputBox
            label="Absent Start"
            name="absentStart"
            value={config.absentStart}
          />

          <InputBox
            label="Absent End"
            name="absentEnd"
            value={config.absentEnd}
          />
        </div>

        {/* SAVE BUTTON */}
        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTimeSettings;