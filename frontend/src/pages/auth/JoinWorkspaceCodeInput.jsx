import React from "react";
import { Loader2 } from "lucide-react";

export default function JoinWorkspaceCodeInput({
  workspaceCode,
  setWorkspaceCode,
  checking,
  exists,
}) {
  return (
    <div className="mb-5">
      <label className="text-sm font-semibold text-slate-700">
        Workspace Code
      </label>

      <div className="mt-2 flex items-center gap-3 relative">
        <input
          value={workspaceCode}
          onChange={(e) =>
            setWorkspaceCode((e.target.value || "").toLowerCase())
          }
          placeholder="Enter workspace code"
          className="w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        {checking && (
          <Loader2
            className="animate-spin text-blue-600 absolute right-4"
            size={18}
          />
        )}

        {!checking && exists === true && (
          <span className="absolute right-4 text-green-600 text-lg">✔</span>
        )}

        {!checking && exists === false && (
          <span className="absolute right-4 text-red-600 text-lg">✖</span>
        )}
      </div>
    </div>
  );
}