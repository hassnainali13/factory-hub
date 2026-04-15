// frontend/src/pages/settings/AttendanceTimeSettings.jsx
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

const defaultConfig = {
  checkInStart: "08:00",
  checkInEnd: "08:30",
  absentStart: "08:30",
  absentEnd: "08:40",
};

const AttendanceTimeSettings = ({ readOnly = false }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/attendance-time-config");
      if (res.data) setConfig(res.data);
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    if (readOnly) return;

    setConfig((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateTimes = () => {
    const { checkInStart, checkInEnd, absentStart, absentEnd } = config;

    if (checkInStart >= checkInEnd) {
      setStatus("⚠️ Check-In Start must be before Check-In End");
      return false;
    }

    if (checkInEnd > absentStart) {
      setStatus("⚠️ Check-In End should be before Absent Start");
      return false;
    }

    if (absentStart >= absentEnd) {
      setStatus("⚠️ Absent Start must be before Absent End");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (readOnly) return;
    if (!validateTimes()) return;

    try {
      setSaving(true);
      setStatus("");

      await axiosInstance.put("/attendance-time-config", config);

      setStatus("✅ Settings saved successfully");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(defaultConfig);
    setStatus("🔄 Reset to default values");
  };

  const InputBox = ({ label, name, value }) => (
    <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <label className="text-sm font-semibold text-gray-700">
        {label}
      </label>

      <input
        type="time"
        name={name}
        value={value}
        onChange={handleChange}
        disabled={readOnly}
        className="w-full mt-3 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

      <p className="text-xs text-gray-400 mt-2">
        {formatTo12Hour(value)}
      </p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 bg-gray-200 rounded-2xl"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6 space-y-5">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          Attendance Time Settings
        </h2>

        {!readOnly && (
          <button
            onClick={handleReset}
            className="text-sm px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition"
          >
            Reset
          </button>
        )}
      </div>

      {/* STATUS */}
      {status && (
        <div className="p-3 rounded-xl bg-blue-50 text-blue-700 text-sm">
          {status}
        </div>
      )}

      {/* CARD */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-lg p-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* SAVE */}
        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceTimeSettings;