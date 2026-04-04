import React, { useEffect, useState } from "react";
import CheckIn from "./CheckIn";
import axiosInstance from "../api/axiosInstance";

const Attendance = () => {
  const [data, setData] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Fetch attendance data
  const fetchData = async () => {
    try {
      const res = await axiosInstance.get("/attendance");
      setData(res.data);
      checkCheckInWindow(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();

    // Update current time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      checkCheckInWindow(data);
    }, 60000);

    return () => clearInterval(interval);
  }, [data]);

  // Check if check-in is allowed
  const checkCheckInWindow = (attendances) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    const inWindow = hours === 19 && minutes >= 0 && minutes < 60;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkedInToday = attendances.some((a) => new Date(a.date) >= today);

    setCanCheckIn(inWindow && !checkedInToday);
  };

  // Handle Check-In
  const handleCheckIn = async (image, location) => {
    try {
      const res = await axiosInstance.post("/attendance/check-in", {
        image,
        latitude: location.lat,
        longitude: location.lng,
      });

      setData([res.data, ...data]);
      setShowCamera(false);
      setCanCheckIn(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Check-in failed");
    }
  };

  // Handle Check-Out
  const handleCheckOut = async (id) => {
    try {
      const res = await axiosInstance.post(`/attendance/check-out/${id}`);
      const updated = data.map((item) => (item._id === id ? res.data : item));
      setData(updated);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Check-out failed");
    }
  };

  // Determine status
  const getStatus = (row) => {
    if (!row.checkIn) return "Pending";
    if (!row.checkOut) return "Working";
    return "Checked Out";
  };

  return (
    <div className="p-6 space-y-6">
      {/* Check-In Button */}
      <div className="flex justify-center">
        <button
          onClick={() => {
            if (
              currentTime.getHours() > 18 ||
              (currentTime.getHours() === 18 &&
                currentTime.getMinutes() >= 30) ||
              !canCheckIn
            )
              return; // Prevent opening camera
            setShowCamera(true);
          }}
          disabled={
            !canCheckIn &&
            (currentTime.getHours() > 18 ||
              (currentTime.getHours() === 18 && currentTime.getMinutes() >= 30))
          }
          className={`bg-gradient-to-r from-green-500 to-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg transform transition 
  ${canCheckIn ? "hover:scale-105 cursor-pointer" : "opacity-50 cursor-not-allowed"}`}
        >
          Check In
        </button>
      </div>

      {/* Camera Modal */}
      {showCamera && (
        <CheckIn
          onCheckIn={handleCheckIn}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">
                Date
              </th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">
                Check-In
              </th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">
                Check-Out
              </th>
              <th className="text-left px-6 py-3 text-gray-600 font-medium">
                Status
              </th>
              <th className="text-center px-6 py-3 text-gray-600 font-medium">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row._id}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-6 py-4">
                  {new Date(row.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-green-600 font-medium">
                  {row.checkIn
                    ? new Date(row.checkIn).toLocaleTimeString()
                    : "--"}
                </td>
                <td
                  className={`px-6 py-4 font-medium ${row.checkOut ? "text-red-600" : "text-gray-400"}`}
                >
                  {row.checkOut
                    ? new Date(row.checkOut).toLocaleTimeString()
                    : "--"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-sm font-semibold ${
                      getStatus(row) === "Working"
                        ? "bg-yellow-100 text-yellow-800"
                        : getStatus(row) === "Checked Out"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getStatus(row)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  {!row.checkOut && (
                    <button
                      onClick={() => handleCheckOut(row._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-lg transition"
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
