import React, { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import FaceRegister from "./FaceRegister";
import CheckIn from "./CheckIn";

const Attendance = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);

  const [showFaceRegister, setShowFaceRegister] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  const [canCheckIn, setCanCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔥 helper: check today
  const isToday = (date) => {
    const d = new Date(date);
    const t = new Date();

    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  // 🔥 FETCH DATA
  const fetchData = async () => {
    try {
      const [userRes, attendanceRes] = await Promise.all([
        axiosInstance.get("/auth/me"),
        axiosInstance.get("/attendance"),
      ]);

      const userData = userRes.data.user;
      const attendanceData = attendanceRes.data;

      setUser(userData);
      setData(attendanceData);

      // 🔥 FACE CHECK
      const hasFace = userData?.faceDescriptor?.length > 0;

      // 🔥 DAILY CHECK-IN CHECK
      const alreadyCheckedToday = attendanceData.some(
        (a) => a.checkIn && isToday(a.checkIn)
      );

      setCanCheckIn(hasFace && !alreadyCheckedToday);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🔹 Face Register
  const handleFaceRegister = async (descriptor) => {
    try {
      const res = await axiosInstance.post("/attendance/register-face", {
        descriptor,
      });

      setUser(res.data.user);
      setShowFaceRegister(false);

      // enable check-in after register
      setCanCheckIn(true);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 CHECK-IN (FAST + INSTANT TABLE UPDATE)
  const handleCheckIn = async (image, location, descriptor) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/attendance/check-in", {
        image,
        latitude: location.lat,
        longitude: location.lng,
        descriptor,
      });

      // ⚡ instant UI update
      setData((prev) => [res.data, ...prev]);

      // 🔒 lock button (daily rule)
      setCanCheckIn(false);

      setShowCheckIn(false);
    } catch (err) {
      console.error(err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 CHECK-OUT
  const handleCheckOut = async (id) => {
    try {
      const res = await axiosInstance.post(`/attendance/check-out/${id}`);

      setData((prev) =>
        prev.map((item) => (item._id === id ? res.data : item))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 STATUS UI
  const getStatus = (row) => {
    if (row.status === "Absent")
      return <span className="text-red-500 font-semibold">Absent</span>;

    if (!row.checkIn)
      return <span className="text-gray-500">Pending</span>;

    if (!row.checkOut)
      return <span className="text-yellow-500">Working</span>;

    return <span className="text-green-600 font-semibold">Done</span>;
  };

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="bg-white shadow-xl rounded-2xl p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Dashboard</h2>

        <div className="flex gap-3">

          {/* 🔥 REGISTER FACE (ONLY IF NOT REGISTERED) */}
          {!user?.faceDescriptor?.length && (
            <button
              onClick={() => setShowFaceRegister(true)}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Register Face
            </button>
          )}

          {/* CHECK-IN BUTTON */}
          <button
            onClick={() => setShowCheckIn(true)}
            disabled={!canCheckIn}
            className={`px-5 py-2 rounded-lg text-white transition ${
              canCheckIn
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading
              ? "Processing..."
              : canCheckIn
              ? "Check In"
              : "Already Checked In"}
          </button>

        </div>
      </div>

      {/* MODALS */}
      {showFaceRegister && (
        <FaceRegister
          onRegisterSuccess={handleFaceRegister}
          onClose={() => setShowFaceRegister(false)}
        />
      )}

      {showCheckIn && (
        <CheckIn
          user={user}
          onCheckIn={handleCheckIn}
          onClose={() => setShowCheckIn(false)}
        />
      )}

      {/* TABLE */}
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden">

        <table className="min-w-full text-sm">

          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3">Check-In</th>
              <th className="px-6 py-3">Check-Out</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <tr key={row._id} className="border-t hover:bg-gray-50">

                <td className="px-6 py-4">
                  {new Date(row.date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 text-green-600">
                  {row.checkIn
                    ? new Date(row.checkIn).toLocaleTimeString()
                    : "--"}
                </td>

                <td className="px-6 py-4 text-red-600">
                  {row.checkOut
                    ? new Date(row.checkOut).toLocaleTimeString()
                    : "--"}
                </td>

                <td className="px-6 py-4">{getStatus(row)}</td>

                <td className="px-6 py-4">
                  {!row.checkOut && row.status !== "Absent" && (
                    <button
                      onClick={() => handleCheckOut(row._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                    >
                      Check Out
                    </button>
                  )}
                </td>

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
};

export default Attendance;