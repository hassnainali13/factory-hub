import React, { useEffect, useState, useRef } from "react";
import axiosInstance from "../api/axiosInstance";
import FaceRegister from "./FaceRegister";
import CheckIn from "./CheckIn";

const Attendance = () => {
  const [user, setUser] = useState(null);
  const [data, setData] = useState([]);
  const [config, setConfig] = useState(null);
  const [showFaceRegister, setShowFaceRegister] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const abortRef = useRef(null);

  // ================= CLOCK =================
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ================= TIME HELPERS =================
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const getMinutes = () => now.getHours() * 60 + now.getMinutes();

  const isCheckinAllowed = () => {
    if (!config) return false;
    const min = getMinutes();
    return (
      min >= timeToMinutes(config.checkInStart) &&
      min <= timeToMinutes(config.checkInEnd)
    );
  };

  const isToday = (date) => {
    const d = new Date(date);
    const t = new Date();
    return (
      d.getDate() === t.getDate() &&
      d.getMonth() === t.getMonth() &&
      d.getFullYear() === t.getFullYear()
    );
  };

  const todayRecord = data.find((a) => isToday(a.date));
  const alreadyCheckedToday = todayRecord?.checkIn;

  // ================= FETCH =================
  useEffect(() => {
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;

    const fetchAll = async () => {
      try {
        setInitialLoading(true);

        const [userRes, attendanceRes, configRes] = await Promise.all([
          axiosInstance.get("/auth/me", { signal }),
          axiosInstance.get("/attendance", { signal }),
          axiosInstance.get("/attendance-time-config", { signal }),
        ]);

        setUser(userRes.data.user);
        setData(attendanceRes.data || []);
        setConfig(configRes.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          console.error(err);
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchAll();
    return () => abortRef.current.abort();
  }, []);

  // ================= FACE REGISTER =================
  const handleFaceRegister = (descriptor) => {
    setUser((prev) => ({ ...prev, faceDescriptor: descriptor }));
    setShowFaceRegister(false);
  };

  // ================= CHECK-IN =================
  const handleCheckIn = async (image, location, descriptor) => {
    try {
      setLoading(true);
      const res = await axiosInstance.post("/attendance/check-in", {
        image,
        latitude: location.lat,
        longitude: location.lng,
        descriptor,
      });

      const newRecord = res.data?.attendance || res.data;
      if (!newRecord) return;

      setData((prev) => [
        newRecord,
        ...prev.filter((i) => i._id !== newRecord._id),
      ]);
      setShowCheckIn(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= CHECK OUT =================
  const handleCheckOut = async (id) => {
    try {
      const res = await axiosInstance.post(`/attendance/check-out/${id}`);
      const updated = res.data?.attendance || res.data;
      setData((prev) => prev.map((item) => (item._id === id ? updated : item)));
    } catch (err) {
      console.error(err);
    }
  };

  // ================= STATUS =================
  const getStatus = (row) => {
    if (row.status === "Absent")
      return <span className="text-red-500 font-semibold">Absent</span>;
    if (!row.checkIn) return <span className="text-gray-500">Pending</span>;
    if (!row.checkOut) return <span className="text-yellow-500">Working</span>;
    return <span className="text-green-600 font-semibold">Done</span>;
  };

  const canRegisterFace = !user?.faceDescriptor?.length;
  const canCheckIn =
    user?.faceDescriptor?.length > 0 &&
    !alreadyCheckedToday &&
    isCheckinAllowed() &&
    config;

  const getCheckInButtonText = () => {
    if (initialLoading || !config) return "Loading...";
    if (loading) return "Processing...";
    if (canRegisterFace) return "Check In";
    if (alreadyCheckedToday) return "Already Checked In";
    if (!isCheckinAllowed()) return "Check-in Closed";
    return "Check In";
  };

  // ================= UI =================
  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* HEADER */}
      <div className="bg-white shadow-xl rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-start sm:items-center">
        <h2 className="text-xl sm:text-2xl font-bold">Attendance Dashboard</h2>

        <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
          {initialLoading ? (
            <>
              <div className="w-32 sm:w-36 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-32 sm:w-36 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </>
          ) : (
            <>
              {canRegisterFace && (
                <button
                  onClick={() => setShowFaceRegister(true)}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg text-sm sm:text-base"
                >
                  Register Face
                </button>
              )}

              <button
                onClick={() => setShowCheckIn(true)}
                disabled={!canCheckIn || loading}
                className={`flex-1 sm:flex-none px-4 sm:px-5 py-2 rounded-lg text-white text-sm sm:text-base transition ${
                  canCheckIn && !loading
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {getCheckInButtonText()}
              </button>
            </>
          )}
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs sm:text-sm border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Date</th>
                <th className="px-3 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Check-In</th>
                <th className="px-3 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Check-Out</th>
                <th className="px-3 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left font-semibold whitespace-nowrap">Action</th>
              </tr>
            </thead>

            <tbody>
              {initialLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-3 sm:px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                : data.map((row) => (
                    <tr
                      key={row._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle whitespace-nowrap">
                        {new Date(row.date).toLocaleDateString()}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle whitespace-nowrap">
                        {row.checkIn ? (
                          <span className="text-green-600 font-medium">
                            {new Date(row.checkIn).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle whitespace-nowrap">
                        {row.checkOut ? (
                          <span className="text-red-500 font-medium">
                            {new Date(row.checkOut).toLocaleTimeString()}
                          </span>
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        {getStatus(row)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 align-middle">
                        {!row.checkOut ? (
                          <button
                            onClick={() => handleCheckOut(row._id)}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2 sm:px-3 py-1 rounded text-xs sm:text-sm whitespace-nowrap"
                          >
                            Check Out
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs sm:text-sm">Done</span>
                        )}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Attendance;