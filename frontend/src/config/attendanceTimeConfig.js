// frontend/src/config/attendanceTimeConfig.js
const attendanceConfig = {
  // 🟢 CURRENT TEST WINDOW (4:34 PM → 4:49 PM)
  checkInStart: 16 * 60 + 34,   // 04:34 PM
  checkInEnd: 16 * 60 + 43,     // 04:49 PM

  // 🔴 Absent window (same test logic)
  absentStart: 16 * 60 + 43,
  absentEnd: 16 * 60 + 45,
};

export default attendanceConfig;