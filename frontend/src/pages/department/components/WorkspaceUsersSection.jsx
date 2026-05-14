// import React from "react";

// export default function WorkspaceUsersSection({
//   title,
//   subtitle,
//   groupOptions = [],
//   activeUserGroup,
//   onGroupChange,
//   loadingUsers = false,
//   workspaceAdminUser = null,
//   workspaceAdminLabel = "Workspace Admin",
//   departmentHeadUsers = [],
//   filteredStaffUsers = [],
//   selectedUserDetails = null,
//   setSelectedUserDetails,
//   staffSearch = "",
//   onStaffSearchChange = () => {},
//   selectedDepartmentFilter = "all",
//   onDepartmentFilterChange = () => {},
//   uniqueDepartments = [],
// }) {
//   const isWorkspaceAdmin = activeUserGroup === "workspaceAdmin";
//   const isDepartmentHead = activeUserGroup === "departmentHead";
//   const isStaff = activeUserGroup === "staff";
//   const currentUsers = isDepartmentHead
//     ? departmentHeadUsers
//     : filteredStaffUsers;

//   return (
//     <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
//       <div className="border-b border-slate-100 px-6 py-5">
//         <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h2 className="text-base font-semibold text-slate-900">{title}</h2>
//             <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
//           </div>

//           {groupOptions.length > 0 && (
//             <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
//               {groupOptions.map((group) => (
//                 <button
//                   key={group.id}
//                   onClick={() => onGroupChange(group.id)}
//                   className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
//                     activeUserGroup === group.id
//                       ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
//                       : "text-slate-500 hover:text-slate-700"
//                   }`}
//                 >
//                   {group.label}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-6">
//         {loadingUsers ? (
//           <div className="flex items-center gap-3 py-8 text-sm text-slate-400">
//             <svg
//               className="h-4 w-4 animate-spin"
//               viewBox="0 0 24 24"
//               fill="none"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8z"
//               />
//             </svg>
//             Loading users...
//           </div>
//         ) : (
//           <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
//             <div>
//               {isWorkspaceAdmin ? (
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
//                   <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
//                     {workspaceAdminLabel}
//                   </p>
//                   {workspaceAdminUser ? (
//                     <div className="flex items-center gap-4">
//                       <div
//                         className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-purple-100"
//                         style={{
//                           background: workspaceAdminUser.profileImage
//                             ? "transparent"
//                             : "#7c3aed",
//                         }}
//                       >
//                         {workspaceAdminUser.profileImage ? (
//                           <img
//                             src={workspaceAdminUser.profileImage}
//                             alt={workspaceAdminUser.name}
//                             className="h-full w-full object-cover"
//                           />
//                         ) : (
//                           <span className="text-lg font-semibold text-white">
//                             {workspaceAdminUser.name?.charAt(0).toUpperCase() ||
//                               "A"}
//                           </span>
//                         )}
//                       </div>

//                       <div className="min-w-0">
//                         <p className="truncate font-semibold text-slate-900">
//                           {workspaceAdminUser.name}
//                         </p>
//                         <p className="truncate text-sm text-slate-500">
//                           {workspaceAdminUser.email}
//                         </p>
//                         <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
//                           {workspaceAdminLabel}
//                         </span>
//                       </div>
//                     </div>
//                   ) : (
//                     <p className="text-sm text-slate-400">
//                       No workspace admin found.
//                     </p>
//                   )}
//                 </div>
//               ) : (
//                 <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
//                   <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
//                     {isDepartmentHead ? "Department Heads" : "Staff Members"}
//                   </p>

//                   {isStaff && (
//                     <div className="mb-4 space-y-2">
//                       <input
//                         type="text"
//                         placeholder="Search staff..."
//                         value={staffSearch}
//                         onChange={(e) => onStaffSearchChange(e.target.value)}
//                         className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       />
//                       <select
//                         value={selectedDepartmentFilter}
//                         onChange={(e) =>
//                           onDepartmentFilterChange(e.target.value)
//                         }
//                         className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//                       >
//                         <option value="all">All Departments</option>
//                         {uniqueDepartments.map((dept) => (
//                           <option key={dept._id} value={dept._id}>
//                             {dept.name}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}

//                   {currentUsers.length === 0 ? (
//                     <p className="py-4 text-center text-sm text-slate-400">
//                       No users found.
//                     </p>
//                   ) : (
//                     <div className="space-y-2 max-h-96 overflow-y-auto">
//                       {currentUsers.map((u) => (
//                         <div
//                           key={u._id}
//                           onClick={() => setSelectedUserDetails(u)}
//                           className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm ${
//                             selectedUserDetails?._id === u._id
//                               ? "border-blue-200 bg-blue-50"
//                               : "border-slate-200 bg-white hover:border-slate-300"
//                           }`}
//                         >
//                           <div
//                             className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
//                             style={{
//                               background: u.profileImage
//                                 ? "transparent"
//                                 : "#7c3aed",
//                             }}
//                           >
//                             {u.profileImage ? (
//                               <img
//                                 src={u.profileImage}
//                                 alt={u.name}
//                                 className="h-full w-full object-cover"
//                               />
//                             ) : (
//                               <span className="text-sm font-semibold text-white">
//                                 {u.name?.charAt(0).toUpperCase()}
//                               </span>
//                             )}
//                           </div>

//                           <div className="min-w-0 flex-1">
//                             <p className="truncate text-sm font-medium text-slate-900">
//                               {u.name}
//                             </p>
//                             <p className="truncate text-xs text-slate-500">
//                               {u.email}
//                             </p>
//                             {u.departmentInfo && (
//                               <p className="truncate text-xs text-slate-400">
//                                 {u.departmentInfo.name}
//                               </p>
//                             )}
//                           </div>

//                           {selectedUserDetails?._id === u._id && (
//                             <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
//                           )}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               )}
//             </div>

//             {selectedUserDetails && !isWorkspaceAdmin && (
//               <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
//                 <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
//                   {selectedUserDetails.originalRole === "department_head"
//                     ? "Department Head"
//                     : "Staff"}{" "}
//                   Detail
//                 </p>

//                 <div className="flex flex-col items-center gap-4 text-center">
//                   <div
//                     className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-4 ring-purple-50"
//                     style={{
//                       background: selectedUserDetails.profileImage
//                         ? "transparent"
//                         : "#7c3aed",
//                     }}
//                   >
//                     {selectedUserDetails.profileImage ? (
//                       <img
//                         src={selectedUserDetails.profileImage}
//                         alt={selectedUserDetails.name}
//                         className="h-full w-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-2xl font-semibold text-white">
//                         {selectedUserDetails.name?.charAt(0).toUpperCase() ||
//                           "U"}
//                       </span>
//                     )}
//                   </div>

//                   <div className="w-full space-y-1">
//                     <p className="text-base font-semibold text-slate-900">
//                       {selectedUserDetails.name}
//                     </p>
//                     <p className="text-sm text-slate-500">
//                       {selectedUserDetails.email}
//                     </p>
//                     <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
//                       {selectedUserDetails.originalRole === "department_head"
//                         ? selectedUserDetails.departmentId?.head ||
//                           selectedUserDetails.role
//                         : selectedUserDetails.role}
//                     </span>
//                   </div>

//                   {selectedUserDetails.departmentId && (
//                     <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
//                       <p className="text-xs text-slate-400">Department</p>
//                       <p className="mt-0.5 text-sm font-medium text-slate-700">
//                         {selectedUserDetails.departmentInfo?.name ||
//                           selectedUserDetails.departmentId?.name}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function WorkspaceUsersSection({
  title,
  subtitle,
  groupOptions = [],
  activeUserGroup,
  onGroupChange,
  loadingUsers = false,
  workspaceAdminUser = null,
  workspaceAdminLabel = "Workspace Admin",
  departmentHeadUsers = [],
  filteredStaffUsers = [],
  selectedUserDetails = null,
  setSelectedUserDetails,
  staffSearch = "",
  onStaffSearchChange = () => {},
  selectedDepartmentFilter = "all",
  onDepartmentFilterChange = () => {},
  uniqueDepartments = [],
}) {
  const isWorkspaceAdmin = activeUserGroup === "workspaceAdmin";
  const isDepartmentHead = activeUserGroup === "departmentHead";
  const isStaff = activeUserGroup === "staff";
  const currentUsers = isDepartmentHead
    ? departmentHeadUsers
    : filteredStaffUsers;

  const getDeptId = (u) =>
    u.departmentInfo?._id ||
    u.departmentId?._id ||
    u.departmentId ||
    u.departmentInfo?._id ||
    null;

  const getDeptName = (u) =>
    u.departmentInfo?.name ||
    u.departmentInfo?.departmentName ||
    u.departmentInfo?.department ||
    u.departmentId?.name ||
    u.departmentId?.departmentName ||
    u.departmentId?.department ||
    u.department?.name ||
    u.department?.department ||
    u.departmentName ||
    u.department ||
    null;

  const departmentOptions = uniqueDepartments.length
    ? uniqueDepartments
    : Array.from(
        new Map(
          currentUsers
            .map((u) => {
              const id = getDeptId(u);
              const name = getDeptName(u);
              return id && name
                ? [String(id), { _id: String(id), name }]
                : null;
            })
            .filter(Boolean),
        ).values(),
      );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>
          </div>

          {groupOptions.length > 0 && (
            <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
              {groupOptions.map((group) => (
                <button
                  key={group.id}
                  onClick={() => onGroupChange(group.id)}
                  className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                    activeUserGroup === group.id
                      ? "bg-white text-blue-600 shadow-sm ring-1 ring-slate-200"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        {loadingUsers ? (
          <div className="flex items-center gap-3 py-8 text-sm text-slate-400">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            Loading users...
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
            <div>
              {isWorkspaceAdmin ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {workspaceAdminLabel}
                  </p>
                  {workspaceAdminUser ? (
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-purple-100"
                        style={{
                          background: workspaceAdminUser.profileImage
                            ? "transparent"
                            : "#7c3aed",
                        }}
                      >
                        {workspaceAdminUser.profileImage ? (
                          <img
                            src={workspaceAdminUser.profileImage}
                            alt={workspaceAdminUser.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-white">
                            {workspaceAdminUser.name?.charAt(0).toUpperCase() ||
                              "A"}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {workspaceAdminUser.name}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {workspaceAdminUser.email}
                        </p>
                        <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                          {workspaceAdminLabel}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">
                      No workspace admin found.
                    </p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400">
                    {isDepartmentHead ? "Department Heads" : "Staff Members"}
                  </p>

                  {isStaff && (
                    <div className="mb-4 space-y-2">
                      <input
                        type="text"
                        placeholder="Search staff..."
                        value={staffSearch}
                        onChange={(e) => onStaffSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <select
                        value={selectedDepartmentFilter}
                        onChange={(e) =>
                          onDepartmentFilterChange(e.target.value)
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Departments</option>
                        {departmentOptions.map((dept) => (
                          <option
                            key={dept._id || dept.id}
                            value={dept._id || dept.id}
                          >
                            {dept.name ||
                              dept.departmentName ||
                              dept.department ||
                              dept.title ||
                              "Unnamed"}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {currentUsers.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-400">
                      No users found.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {currentUsers.map((u) => (
                        <div
                          key={u._id}
                          onClick={() => setSelectedUserDetails(u)}
                          className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-all hover:shadow-sm ${
                            selectedUserDetails?._id === u._id
                              ? "border-blue-200 bg-blue-50"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full"
                            style={{
                              background: u.profileImage
                                ? "transparent"
                                : "#7c3aed",
                            }}
                          >
                            {u.profileImage ? (
                              <img
                                src={u.profileImage}
                                alt={u.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-white">
                                {u.name?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {u.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {u.email}
                            </p>
                            {/* ── Fixed: Dept Head aur Staff dono ke liye department name ── */}
                            {getDeptName(u) && (
                              <p className="truncate text-xs text-slate-400">
                                {getDeptName(u)}
                              </p>
                            )}
                          </div>

                          {selectedUserDetails?._id === u._id && (
                            <div className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedUserDetails && !isWorkspaceAdmin && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-slate-400">
                  {selectedUserDetails.role ===
                  selectedUserDetails.departmentInfo?.head
                    ? "Department Head"
                    : "Staff"}{" "}
                  Detail
                </p>

                <div className="flex flex-col items-center gap-4 text-center">
                  <div
                    className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full ring-4 ring-purple-50"
                    style={{
                      background: selectedUserDetails.profileImage
                        ? "transparent"
                        : "#7c3aed",
                    }}
                  >
                    {selectedUserDetails.profileImage ? (
                      <img
                        src={selectedUserDetails.profileImage}
                        alt={selectedUserDetails.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-semibold text-white">
                        {selectedUserDetails.name?.charAt(0).toUpperCase() ||
                          "U"}
                      </span>
                    )}
                  </div>

                  <div className="w-full space-y-1">
                    <p className="text-base font-semibold text-slate-900">
                      {selectedUserDetails.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {selectedUserDetails.email}
                    </p>
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-600">
                      {selectedUserDetails.role ===
                      selectedUserDetails.departmentInfo?.head
                        ? selectedUserDetails.departmentId?.head ||
                          selectedUserDetails.role
                        : selectedUserDetails.role}
                    </span>
                  </div>

                  {(selectedUserDetails.departmentId ||
                    getDeptName(selectedUserDetails)) && (
                    <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                      <p className="text-xs text-slate-400">Department</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">
                        {getDeptName(selectedUserDetails) ||
                          selectedUserDetails.departmentId?.name ||
                          selectedUserDetails.departmentId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
