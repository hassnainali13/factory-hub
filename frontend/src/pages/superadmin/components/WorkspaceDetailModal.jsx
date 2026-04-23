import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

// export default function WorkspaceDetailModal({
//   workspaceId,
//   apiBaseUrl,
//   onClose,
// }) {
//   const [workspace, setWorkspace] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!workspaceId) return;

//     const fetchWorkspace = async () => {
//       try {
//         setLoading(true);
//         const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
//         setWorkspace(res.data);
//       } catch (err) {
//         console.error("Workspace detail fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchWorkspace();
//   }, [workspaceId]);

//   // workspace logo URL
//   const logoUrl = workspace?.logo
//     ? workspace.logo.startsWith("http")
//       ? workspace.logo
//       : `${apiBaseUrl || import.meta.env.VITE_API_URL}/${workspace.logo.replace(/\\/g, "/")}`
//     : "/default-workspace.png"; // default fallback

//   if (!workspaceId) return null;

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//       <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg p-6 w-96 relative">
//         {/* Close button */}
//         <button
//           onClick={onClose}
//           className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 transition"
//         >
//           ✕
//         </button>

//         {loading ? (
//           <div className="py-10 text-center text-slate-500">Loading...</div>
//         ) : (
//           <div className="flex flex-col items-center gap-4 mt-4">
//             {/* Workspace Logo */}
//             {logoUrl ? (
//               <img
//                 src={logoUrl}
//                 alt={workspace?.workspaceName}
//                 className="w-24 h-24 object-cover rounded-full border"
//               />
//             ) : (
//               <div className="w-24 h-24 bg-gray-100 rounded-full grid place-items-center text-gray-400">
//                 N/A
//               </div>
//             )}
//             <h2 className="text-xl font-semibold text-slate-900">
//               {workspace?.workspaceName || "N/A"}
//             </h2>

//             <div className="w-full border-t border-slate-100 my-3" />

//             {/* Workspace & User Details */}
//             <div className="w-full space-y-2 text-sm text-slate-700">
//               <div className="flex justify-between">
//                 <span className="font-medium">User Name:</span>
//                 <span>{workspace?.userName || "N/A"}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="font-medium">User Email:</span>
//                 <span>{workspace?.userEmail || "N/A"}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="font-medium">Role:</span>
//                 <span>{workspace?.workspaceRole || "N/A"}</span>
//               </div>

//               <div className="flex justify-between">
//                 <span className="font-medium">Workspace Code:</span>
//                 <span>{workspace?.code || "N/A"}</span>
//               </div>
//             </div>

//             {/* Close Action Button */}
//             <button
//               onClick={onClose}
//               className="mt-6 w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



export default function WorkspaceDetailModal({ workspaceId, apiBaseUrl, onClose }) {
  const [workspace, setWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!workspaceId) return;
    const fetchWorkspace = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/workspaces/${workspaceId}`);
        setWorkspace(res.data);
      } catch (err) {
        console.error("Workspace detail fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkspace();
  }, [workspaceId]);

  const logoUrl = workspace?.logo
    ? workspace.logo.startsWith("http")
      ? workspace.logo
      : `${apiBaseUrl || import.meta.env.VITE_API_URL}/${workspace.logo.replace(/\\/g, "/")}`
    : null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(workspace?.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  if (!workspaceId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-[380px] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
        style={{ background: "rgba(15,23,42,0.85)", backdropFilter: "blur(20px)" }}>

        {/* Header */}
        <div className="relative px-6 pt-7 pb-10 overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 60%, #3b82f6 100%)" }}>
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 left-10 w-20 h-20 rounded-full bg-white/5" />

          <button onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-white/80 hover:text-white transition"
            style={{ background: "rgba(255,255,255,0.15)", border: "0.5px solid rgba(255,255,255,0.3)" }}>
            ✕
          </button>

          <div className="relative z-10 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-3xl"
              style={{ background: "rgba(255,255,255,0.15)", border: "2.5px solid rgba(255,255,255,0.4)" }}>
              {logoUrl
                ? <img src={logoUrl} alt={workspace?.workspaceName} className="w-full h-full object-cover" />
                : <span>🏢</span>}
            </div>
            <div className="text-center">
              <p className="text-xl font-medium text-white tracking-tight">
                {workspace?.workspaceName || "N/A"}
              </p>
              {workspace?.workspaceRole && (
                <span className="mt-1.5 inline-block px-3 py-0.5 rounded-full text-xs text-white/90"
                  style={{ background: "rgba(255,255,255,0.2)", border: "0.5px solid rgba(255,255,255,0.3)" }}>
                  {workspace.workspaceRole}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pt-4 pb-6">
          {loading ? (
            <div className="py-8 text-center text-white/40 text-sm">Loading...</div>
          ) : (
            <>
              {[
                { icon: "👤", label: "User name", value: workspace?.userName },
                { icon: "✉️", label: "Email", value: workspace?.userEmail },
                { icon: "🛡️", label: "Role", value: workspace?.workspaceRole },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 py-3"
                  style={{ borderBottom: "0.5px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: "rgba(59,130,246,0.2)" }}>{icon}</div>
                  <div>
                    <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{label}</p>
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.9)" }}>{value || "N/A"}</p>
                  </div>
                </div>
              ))}

              {/* Code row with copy */}
              <div className="flex items-center gap-3 py-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.2)" }}>🔐</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs uppercase tracking-wider mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>Workspace code</p>
                  <p className="text-sm font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.9)" }}>{workspace?.code || "N/A"}</p>
                </div>
                <button onClick={handleCopy}
                  className="text-xs px-3 py-1 rounded-md transition"
                  style={{ color: "rgba(147,197,253,0.9)", background: "rgba(59,130,246,0.15)", border: "0.5px solid rgba(59,130,246,0.4)" }}>
                  {copied ? "✓" : "copy"}
                </button>
              </div>

              <button onClick={onClose}
                className="mt-5 w-full py-3 rounded-xl text-white font-medium text-sm transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}