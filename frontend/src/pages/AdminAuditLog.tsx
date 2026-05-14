import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { getAdminAuditLogs, AuditLog } from "../lib/adminApi";

const ACTION_COLORS: Record<string, string> = {
  processing_started: "bg-blue-100 text-blue-700",
  ocr_completed: "bg-green-100 text-green-700",
  extraction_completed: "bg-green-100 text-green-700",
  processing_failed: "bg-red-100 text-red-700",
  document_deleted: "bg-red-100 text-red-700",
  document_updated: "bg-yellow-100 text-yellow-700",
  document_verified: "bg-green-100 text-green-700",
  document_reprocessed: "bg-orange-100 text-orange-700",
  user_login: "bg-blue-100 text-blue-700",
  user_register: "bg-blue-100 text-blue-700",
};

export const AdminAuditLog = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", page, actionFilter, emailFilter],
    queryFn: () =>
      getAdminAuditLogs(
        page,
        20,
        emailFilter || undefined,
        actionFilter || undefined
      ),
  });

  const logs = data?.logs || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-red-600">Error loading audit logs</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Audit Logs</h1>
        <p className="text-gray-600 mb-8">Track system activity and changes</p>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Email
              </label>
              <input
                type="text"
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value);
                  setPage(1);
                }}
                placeholder="Search email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Action
              </label>
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="processing_started">Processing Started</option>
                <option value="ocr_completed">OCR Completed</option>
                <option value="extraction_completed">Extraction Completed</option>
                <option value="processing_failed">Processing Failed</option>
                <option value="document_deleted">Document Deleted</option>
                <option value="document_updated">Document Updated</option>
                <option value="document_verified">Document Verified</option>
                <option value="document_reprocessed">Document Reprocessed</option>
                <option value="user_login">User Login</option>
                <option value="user_register">User Register</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="py-8 text-center text-gray-600">No audit logs found</p>
            ) : (
              logs.map((log: AuditLog) => (
                <div
                  key={log.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            ACTION_COLORS[log.action] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">User</p>
                          <p className="text-gray-900">
                            {log.user_email || "System"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Document</p>
                          <p className="text-gray-900 truncate">
                            {log.document_name || "-"}
                          </p>
                        </div>
                        {log.details && (
                          <div className="col-span-2 md:col-span-2">
                            <p className="text-gray-500">Details</p>
                            <button
                              onClick={() =>
                                setExpandedId(
                                  expandedId === log.id ? null : log.id
                                )
                              }
                              className="text-blue-600 hover:underline text-sm"
                            >
                              {expandedId === log.id ? "Hide" : "View"}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {expandedId === log.id && log.details && (
                        <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 p-3 rounded text-xs font-mono text-gray-700 overflow-auto max-h-48">
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
