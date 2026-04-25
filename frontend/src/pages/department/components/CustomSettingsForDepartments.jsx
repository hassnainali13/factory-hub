import React, { useMemo, useState } from "react";
import AttendanceTimeSettings from "../../settings/AttendanceTimeSettings";
import ProfileSettings from "../../settings/ProfileSettings";

import {
  Clock,
  User,
  Building2,
  Shield,
  ChevronRight,
  ArrowLeft,
  Settings2,

} from "lucide-react";

const CustomSettingsForDepartments = () => {
  const [view, setView] = useState("menu");
  const [activePage, setActivePage] = useState("attendance");
  const [search, setSearch] = useState("");

  const settingsList = [
   
    {
      key: "profile",
      title: "Profile Settings",
      desc: "User account configuration",
      icon: User,
      enabled: true,
      color: "text-indigo-600 bg-indigo-100",
    },
    {
      key: "branding",
      title: "Workspace Branding",
      desc: "Logo & identity customization",
      icon: Building2,
      enabled: false,
      color: "text-purple-600 bg-purple-100",
    },
    {
      key: "security",
      title: "Security",
      desc: "Password & access control",
      icon: Shield,
      enabled: false,
      color: "text-red-600 bg-red-100",
    },
  ];

  const filteredSettings = useMemo(() => {
    return settingsList.filter((item) =>
      item.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const activeItem = settingsList.find((i) => i.key === activePage);

  const openPage = (key) => {
    setActivePage(key);
    setView("page");
  };

  const renderComponent = () => {
    switch (activePage) {
      case "profile":
        return <ProfileSettings />;
      default:
        return (
          <div className="text-blue-400 py-10">
            No setting found
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-row items-start justify-start">

      {/* ================= MENU ================= */}
      {view === "menu" && (
        <div className="w-full md:w-[380px] lg:w-[420px] bg-white/70 backdrop-blur-xl flex flex-col shadow-lg min-h-screen">

          {/* HEADER */}
          <div className="p-5">
            <div className="flex items-center gap-2">
              <Settings2 className="text-blue-600" size={22} />
              <h1 className="text-xl font-bold text-blue-700">
                Settings
              </h1>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search settings..."
              className="mt-4 w-full px-3 py-2 text-sm rounded-xl bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* LIST */}
          <div className="p-3 space-y-3 overflow-y-auto">
            {filteredSettings.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.key}
                  onClick={() => item.enabled && openPage(item.key)}
                  className={`
                    flex items-center gap-3 p-4 rounded-2xl transition bg-white/80 shadow-sm
                    ${
                      item.enabled
                        ? "cursor-pointer hover:bg-blue-50 hover:shadow-md"
                        : "opacity-40 cursor-not-allowed"
                    }
                  `}
                >
                  <div
                    className={`w-11 h-11 flex items-center justify-center rounded-xl ${item.color}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="flex-1">
                    <h2 className="text-sm font-semibold text-gray-800">
                      {item.title}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {item.desc}
                    </p>
                  </div>

                  {item.enabled && (
                    <ChevronRight size={18} className="text-blue-400" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= PAGE VIEW ================= */}
      {view === "page" && (
        <div className="flex-1 w-full flex flex-col items-start justify-start">

          {/* TOP BAR */}
          <div className="w-full flex items-center gap-3 p-5 bg-white/70 backdrop-blur-xl shadow-sm">

            <button
              onClick={() => setView("menu")}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-2">
              {activeItem?.icon && (
                <activeItem.icon className="text-blue-600" size={20} />
              )}

              <div>
                <h2 className="text-lg font-bold text-blue-700">
                  {activeItem?.title}
                </h2>
                <p className="text-xs text-gray-500">
                  {activeItem?.desc}
                </p>
              </div>
            </div>
          </div>

          {/* CONTENT (FULL LEFT ALIGN FIX) */}
          <div className="w-full flex justify-start items-start p-5">
            {renderComponent()}
          </div>

        </div>
      )}
    </div>
  );
};

export default CustomSettingsForDepartments;