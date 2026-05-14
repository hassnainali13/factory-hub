import React, { useState, useEffect, useRef } from "react";
import axios from "../../../api/axiosInstance";

const VISIBLE_ROWS = 5;

const AVATAR_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-800" },
  { bg: "bg-green-100", text: "text-green-800" },
  { bg: "bg-sky-100", text: "text-sky-800" },
  { bg: "bg-emerald-100", text: "text-emerald-800" },
  { bg: "bg-indigo-100", text: "text-indigo-800" },
  { bg: "bg-teal-100", text: "text-teal-800" },
  { bg: "bg-cyan-100", text: "text-cyan-800" },
  { bg: "bg-blue-200", text: "text-blue-900" },
];

function getAvatarColor(name = "") {
  return AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];
}

function getInitials(name = "") {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function InfoRow({ label, value, isLast }) {
  return (
    <div
      className={`flex items-center justify-between py-2.5 px-3.5 ${!isLast ? "border-b border-blue-50" : ""}`}
    >
      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
        {label}
      </span>
      <span className="text-xs font-bold text-blue-900 text-right max-w-[140px] truncate">
        {value}
      </span>
    </div>
  );
}

function ActionButton({ label, icon, className, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all duration-150 hover:-translate-y-0.5 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

export default function DepartmentDetailModal({ departmentId, onClose }) {
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [search, setSearch] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchDepartment = async () => {
      if (!departmentId) return;
      setLoading(true);
      try {
        const res = await axios.get(
          `/departments/full-details/${departmentId}`,
        );
        setDepartment(res.data);
      } catch (err) {
        console.error("Failed to fetch department:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartment();
  }, [departmentId]);

  useEffect(() => {
    setShowAll(false);
    setSearch("");
  }, [departmentId]);

  useEffect(() => {
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const allStaff =
    department?.users?.filter((u) => u.requestStatus === "approved") || [];

  const filteredStaff = search.trim()
    ? allStaff.filter(
        (u) =>
          u.name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()),
      )
    : allStaff;

  const hasMore = filteredStaff.length > VISIBLE_ROWS;
  const visibleStaff = showAll
    ? filteredStaff
    : filteredStaff.slice(0, VISIBLE_ROWS);
  const hiddenCount = filteredStaff.length - VISIBLE_ROWS;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          <p className="text-white/70 text-sm font-semibold">
            Loading department…
          </p>
        </div>
      </div>
    );
  }

  if (!department) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative w-full max-w-[900px] max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden border border-blue-200">
        {/* Green accent top bar */}

        {/* ── Header ── */}
        <div className="relative flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-400 to-blue-500 overflow-hidden flex-shrink-0">
          <div className="absolute right-[-30px] top-[-30px] w-28 h-28 rounded-full bg-white/5" />
          <div className="absolute right-[60px] bottom-[-40px] w-20 h-20 rounded-full bg-white/[0.03]" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 rounded-[13px] bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-[18px] h-[18px] text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight">
                {department?.department || "Department"}
              </h2>
              <p className="text-[11px] text-blue-300 font-medium mt-0.5">
                Department details &amp; staff management
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="relative z-10 w-8 h-8 rounded-[10px] bg-white/12 border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/22 hover:text-white transition-all"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Panel ── */}
          <div className="w-[260px] flex-shrink-0 flex flex-col gap-3.5 p-4 border-r border-blue-100 bg-blue-50/60 overflow-y-auto">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="relative bg-white border border-blue-200 rounded-2xl p-3 overflow-hidden">
                <div className="absolute bottom-[-8px] right-[-8px] w-9 h-9 rounded-full bg-blue-50" />
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Staff
                </p>
                <p className="text-3xl font-black text-blue-900 mt-1 leading-none">
                  {allStaff.length}
                </p>
              </div>
              <div className="relative bg-white border border-blue-200 rounded-2xl p-3 overflow-hidden">
                <div className="absolute bottom-[-8px] right-[-8px] w-9 h-9 rounded-full bg-green-50" />
                <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                  Status
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                  <span className="text-xs font-bold text-green-700">
                    {department?.status || "Active"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info card */}
            <div className="bg-white border border-blue-200 rounded-2xl overflow-hidden">
              <InfoRow
                label="Department"
                value={department?.department || "N/A"}
              />
              <InfoRow
                label="Head"
                value={
                  department?.deptHeadId?.name ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-[6px] bg-blue-100 text-blue-700 text-[9px] font-black flex items-center justify-center flex-shrink-0">
                        {getInitials(department.deptHeadId.name)}
                      </div>
                      <span>{department.deptHeadId.name}</span>
                    </div>
                  ) : (
                    <span className="text-blue-300 italic text-[11px]">
                      Not Assigned
                    </span>
                  )
                }
              />
              <InfoRow label="Role" value={department?.head || "N/A"} />
              <InfoRow label="Approved Staff" value={allStaff.length} />
              <InfoRow
                label="Staff Limit"
                value={department?.employeesLimit || 0}
                isLast
              />
            </div>

            {/* Actions */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2 px-0.5">
                Actions
              </p>
              <div className="grid grid-cols-2 gap-2">
                <ActionButton
                  label="Enable"
                  icon={
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  }
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                />
                <ActionButton
                  label="Disable"
                  icon={
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        d="M20 12H4"
                      />
                    </svg>
                  }
                  className="bg-yellow-50 text-yellow-800 border-yellow-200 hover:bg-yellow-100"
                />
                <ActionButton
                  label="Remove Head"
                  icon={
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  }
                  className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                />
                <ActionButton
                  label="Delete"
                  icon={
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  }
                  className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                />
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden bg-white min-w-0">
            {/* Section header + search */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div>
                <h3 className="text-[15px] font-extrabold text-blue-900 tracking-tight">
                  Department Staff
                </h3>
                <p className="text-[11px] text-blue-400 mt-0.5 font-semibold">
                  {filteredStaff.length} member
                  {filteredStaff.length !== 1 ? "s" : ""}
                  {search && ` matching "${search}"`}
                </p>
              </div>

              {/* Search */}
              <div className="relative flex-shrink-0">
                <svg
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-300 pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setShowAll(false);
                  }}
                  placeholder="Search staff…"
                  className="w-[185px] pl-8 pr-7 py-2 text-xs font-semibold border-[1.5px] border-blue-200 rounded-[10px] bg-blue-50 text-blue-900 placeholder-blue-300 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                {search && (
                  <button
                    onClick={() => {
                      setSearch("");
                      setShowAll(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-600 flex items-center"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="flex flex-col flex-1 overflow-hidden border-[1.5px] border-blue-200 rounded-2xl">
              {/* Scrollable body */}
              <div
                ref={scrollRef}
                className={`overflow-x-auto transition-all duration-300 ${
                  showAll ? "max-h-72 overflow-y-auto" : "overflow-y-hidden"
                }`}
              >
                <table
                  className="w-full text-xs border-collapse"
                  style={{ tableLayout: "fixed" }}
                >
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-blue-50 border-b-[1.5px] border-blue-200">
                      <th className="w-9 px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-blue-400">
                        #
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Name
                      </th>
                      <th className="px-3 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-blue-400">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {visibleStaff.length ? (
                      visibleStaff.map((u, idx) => {
                        const color = getAvatarColor(u.name);
                        return (
                          <tr
                            key={u._id}
                            className="group hover:bg-blue-50/70 transition-colors duration-100"
                          >
                            <td className="px-3 py-2.5 text-[10px] font-black text-blue-200 font-mono">
                              {String(idx + 1).padStart(2, "0")}
                            </td>
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-7 h-7 rounded-[9px] flex items-center justify-center text-[10px] font-black flex-shrink-0 ${color.bg} ${color.text}`}
                                >
                                  {getInitials(u.name)}
                                </div>
                                <span className="font-bold text-blue-900 group-hover:text-blue-700 transition-colors truncate">
                                  {u.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 text-blue-500 font-medium truncate">
                              {u.email}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-14 text-center">
                          <div className="flex flex-col items-center gap-2.5">
                            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                              <svg
                                className="w-5 h-5 text-blue-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="1.5"
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                            </div>
                            <p className="text-xs text-blue-400 font-semibold">
                              {search
                                ? "No staff match your search"
                                : "No staff joined yet"}
                            </p>
                            {search && (
                              <button
                                onClick={() => setSearch("")}
                                className="text-[11px] text-blue-500 hover:underline font-semibold"
                              >
                                Clear search
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Show more / less footer */}
              {hasMore && (
                <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 border-t-[1.5px] border-blue-200 mt-auto">
                  <span className="text-[11px] text-blue-400 font-semibold">
                    {showAll
                      ? `All ${filteredStaff.length} members shown`
                      : `${VISIBLE_ROWS} of ${filteredStaff.length} — ${hiddenCount} more`}
                  </span>
                  <button
                    onClick={() => {
                      setShowAll((v) => !v);
                      if (showAll && scrollRef.current)
                        scrollRef.current.scrollTop = 0;
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-black text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    {showAll ? (
                      <>
                        Show less
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </>
                    ) : (
                      <>
                        Show {hiddenCount} more
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
