import { useEffect } from "react";
import { Bell, X, Check, Building2 } from "lucide-react";

const NotificationDropdown = ({
  showNotifications,
  setShowNotifications,
  notifications,
  unreadCount,
  markAsRead,
}) => {
  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showNotifications &&
        !event.target.closest(".notification-dropdown")
      ) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications, setShowNotifications]);

  if (!showNotifications) return null;

  return (
    <div className="notification-dropdown absolute top-full right-0 mt-3 w-96 max-h-96 overflow-hidden bg-white border border-slate-200 rounded-2xl shadow-lg z-30">
      <div className="flex items-center justify-between p-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-600" />
          <h3 className="text-sm font-semibold text-slate-900">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowNotifications(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <Bell className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No notifications yet</p>
            <p className="text-xs text-slate-400 mt-1">
              We'll notify you when something happens
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
                  {notif.workspaceLogo ? (
                    <img
                      src={notif.workspaceLogo}
                      alt={notif.workspaceName || "Workspace"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-900 truncate">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {notif.message}
                  </p>
                  {notif.workspaceName && (
                    <p className="text-xs text-slate-500 mt-1">
                      Workspace: {notif.workspaceName}
                    </p>
                  )}
                  {notif.departmentName && (
                    <p className="text-xs text-slate-500 mt-1">
                      Department: {notif.departmentName}
                    </p>
                  )}
                  {notif.userName && notif.userRole && (
                    <p className="text-xs text-slate-500 mt-1">
                      By: {notif.userName} ({notif.userRole})
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                    {new Date(notif.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => markAsRead(notif._id)}
                  className="flex-shrink-0 text-slate-400 hover:text-green-600 transition-colors"
                  title="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button className="w-full text-center text-xs text-slate-600 hover:text-slate-900 font-medium">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
