// frontend/src/pages/settings/AttendanceTimeSettings.jsx
import React, { useEffect, useState } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Clock } from "lucide-react";

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
// Time Picker Modal
// ─────────────────────────────────────────
const TimePickerModal = ({ label, value, onConfirm, onClose }) => {
  const [hour, setHour] = useState("08");
  const [minute, setMinute] = useState("00");
  const [ampm, setAmpm] = useState("AM");

  // Parse incoming 24h value
  useEffect(() => {
    if (!value) return;
    let [h, m] = value.split(":").map(Number);
    const ap = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    setHour(String(h).padStart(2, "0"));
    setMinute(String(m).padStart(2, "0"));
    setAmpm(ap);
  }, [value]);

  const handleConfirm = () => {
    let h = parseInt(hour);
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const time24 = `${String(h).padStart(2, "0")}:${minute}`;
    onConfirm(time24);
  };

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6">
        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <Clock size={18} className="text-blue-600" />
          <h3 className="text-base font-bold text-gray-800">{label}</h3>
        </div>

        {/* Preview */}
        <div className="text-center mb-5">
          <span className="text-4xl font-bold text-blue-600 tracking-tight">
            {hour}:{minute}
          </span>
          <span className="text-xl font-semibold text-blue-400 ml-2">{ampm}</span>
        </div>

        {/* AM / PM toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 mb-5">
          {["AM", "PM"].map((ap) => (
            <button
              key={ap}
              onClick={() => setAmpm(ap)}
              className={`flex-1 py-2 text-sm font-semibold transition ${
                ampm === ap
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {ap}
            </button>
          ))}
        </div>

        {/* Hour picker */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Hour</p>
          <div className="grid grid-cols-6 gap-1.5">
            {hours.map((h) => (
              <button
                key={h}
                onClick={() => setHour(h)}
                className={`py-1.5 rounded-lg text-sm font-medium transition ${
                  hour === h
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                }`}
              >
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Minute picker */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Minute</p>
          <div className="grid grid-cols-6 gap-1.5">
            {minutes.map((m) => (
              <button
                key={m}
                onClick={() => setMinute(m)}
                className={`py-1.5 rounded-lg text-sm font-medium transition ${
                  minute === m
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-blue-50"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition shadow"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const AttendanceTimeSettings = ({ readOnly = false }) => {
  const [config, setConfig] = useState(defaultConfig);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [activePicker, setActivePicker] = useState(null); // which field is open

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

  const handleTimeConfirm = (name, time24) => {
    setConfig((prev) => ({ ...prev, [name]: time24 }));
    setActivePicker(null);
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

  // ── Time Box (clickable) ──
  const TimeBox = ({ label, name, value }) => (
    <div className="bg-white/80 backdrop-blur-md border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
      <label className="text-sm font-semibold text-gray-700 block mb-3">
        {label}
      </label>

      <button
        type="button"
        onClick={() => !readOnly && setActivePicker(name)}
        disabled={readOnly}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${
          readOnly
            ? "bg-gray-50 border-gray-200 cursor-default"
            : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
        }`}
      >
        <span className="text-base font-bold text-gray-800 tracking-wide">
          {formatTo12Hour(value)}
        </span>
        {!readOnly && (
          <Clock size={16} className="text-blue-500 flex-shrink-0" />
        )}
      </button>

      <p className="text-xs text-gray-400 mt-2">{value} (24h)</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
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
          <TimeBox label="Check-In Start" name="checkInStart" value={config.checkInStart} />
          <TimeBox label="Check-In End"   name="checkInEnd"   value={config.checkInEnd} />
          <TimeBox label="Absent Start"   name="absentStart"  value={config.absentStart} />
          <TimeBox label="Absent End"     name="absentEnd"    value={config.absentEnd} />
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

      {/* TIME PICKER MODAL */}
      {activePicker && (
        <TimePickerModal
          label={
            activePicker === "checkInStart" ? "Check-In Start" :
            activePicker === "checkInEnd"   ? "Check-In End"   :
            activePicker === "absentStart"  ? "Absent Start"   :
            "Absent End"
          }
          value={config[activePicker]}
          onConfirm={(time) => handleTimeConfirm(activePicker, time)}
          onClose={() => setActivePicker(null)}
        />
      )}
    </div>
  );
};

export default AttendanceTimeSettings;
