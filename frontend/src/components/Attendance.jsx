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
  const startRef = useRef(null);

  // ================= CLOCK =================
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 5000);
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
  const fetchData = async () => {
    const [userRes, attendanceRes] = await Promise.all([
      axiosInstance.get("/auth/me"),
      axiosInstance.get("/attendance"),
    ]);

    setUser(userRes.data.user);
    setData(attendanceRes.data || []);
  };

  const fetchConfig = async () => {
    const res = await axiosInstance.get("/attendance-time-config");
    setConfig(res.data);
  };

  // ================= INITIAL LOAD =================
  useEffect(() => {
    const load = async () => {
      try {
        setInitialLoading(true);
        startRef.current = Date.now();

        await Promise.all([fetchData(), fetchConfig()]);

        const elapsed = Date.now() - startRef.current;
        const wait = Math.max(1500 - elapsed, 0);

        setTimeout(() => {
          setInitialLoading(false);
        }, wait);
      } catch (err) {
        console.error(err);
        setInitialLoading(false);
      }
    };

    load();
  }, []);

  // ================= FACE REGISTER =================
  const handleFaceRegister = (descriptor) => {
    setUser((prev) => ({
      ...prev,
      faceDescriptor: descriptor,
    }));
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

      setData((prev) => {
        const filtered = prev.filter((i) => i._id !== newRecord._id);
        return [newRecord, ...filtered];
      });

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

  // ================= BUTTON TEXT (CLEAN LOGIC) =================
  const getCheckInButtonText = () => {
    if (initialLoading) return "Loading...";
    if (!config) return "Loading...";
    if (loading) return "Processing...";
    if (canRegisterFace) return "Check In";
    if (alreadyCheckedToday) return "Already Checked In";
    if (!isCheckinAllowed()) return "Check-in Closed";
    return "Check In";
  };

  // ================= UI =================
  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="bg-white shadow-xl rounded-2xl p-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Attendance Dashboard</h2>

        <div className="flex gap-3">
          {initialLoading ? (
            <>
              <div className="w-36 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-36 h-10 bg-gray-200 rounded-lg animate-pulse" />
            </>
          ) : (
            <>
              {canRegisterFace && (
                <button
                  onClick={() => setShowFaceRegister(true)}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Register Face
                </button>
              )}

              <button
                onClick={() => setShowCheckIn(true)}
                disabled={!canCheckIn || loading}
                className={`px-5 py-2 rounded-lg text-white transition ${
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
        <table className="min-w-full text-sm border-collapse">
          {/* HEADER */}
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Date</th>
              <th className="px-6 py-3 text-left font-semibold">Check-In</th>
              <th className="px-6 py-3 text-left font-semibold">Check-Out</th>
              <th className="px-6 py-3 text-left font-semibold">Status</th>
              <th className="px-6 py-3 text-left font-semibold">Action</th>
            </tr>
          </thead>

          {/* BODY */}
          <tbody>
            {data.map((row) => (
              <tr
                key={row._id}
                className="border-b hover:bg-gray-50 transition"
              >
                {/* DATE */}
                <td className="px-6 py-4 align-middle">
                  {new Date(row.date).toLocaleDateString()}
                </td>

                {/* CHECK IN */}
                <td className="px-6 py-4 align-middle">
                  {row.checkIn ? (
                    <span className="text-green-600 font-medium">
                      {new Date(row.checkIn).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-gray-400">--</span>
                  )}
                </td>

                {/* CHECK OUT */}
                <td className="px-6 py-4 align-middle">
                  {row.checkOut ? (
                    <span className="text-red-500 font-medium">
                      {new Date(row.checkOut).toLocaleTimeString()}
                    </span>
                  ) : (
                    <span className="text-gray-400 ">--</span>
                  )}
                </td>

                {/* STATUS */}
                <td className="px-6 py-4 align-middle">{getStatus(row)}</td>

                {/* ACTION */}
                <td className="px-6 py-4 align-middle">
                  {!row.checkOut ? (
                    <button
                      onClick={() => handleCheckOut(row._id)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded"
                    >
                      Check Out
                    </button>
                  ) : (
                    <span className="text-gray-400">Done</span>
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
