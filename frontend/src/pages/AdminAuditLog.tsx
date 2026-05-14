import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminAuditLogs, AuditLog } from "../lib/adminApi";
import { ChevronLeft, ChevronRight, Search, User, FileText, Clock, AlertCircle } from "lucide-react";

const ACTION_CONFIG: Record<string, { variant: string; label: string }> = {
  processing_started: { variant: "info", label: "Processing Started" },
  ocr_completed: { variant: "success", label: "OCR Completed" },
  extraction_completed: { variant: "success", label: "Extraction Completed" },
  processing_failed: { variant: "failed", label: "Processing Failed" },
  document_deleted: { variant: "failed", label: "Document Deleted" },
  document_updated: { variant: "warning", label: "Document Updated" },
  document_verified: { variant: "success", label: "Document Verified" },
  document_reprocessed: { variant: "warning", label: "Document Reprocessed" },
  user_login: { variant: "info", label: "User Login" },
  user_register: { variant: "info", label: "User Register" },
};

export const AdminAuditLog = () => {
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [emailFilter, setEmailFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-audit-logs", page, actionFilter, emailFilter],
    queryFn: () =>
      getAdminAuditLogs(page, 20, emailFilter || undefined, actionFilter || undefined),
  });

  const logs = data?.logs || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">Error loading audit logs</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500 mt-1">Track system activity and changes</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Search by email..."
                value={emailFilter}
                onChange={(e) => {
                  setEmailFilter(e.target.value);
                  setPage(1);
                }}
                icon={<Search className="h-4 w-4" />}
              />
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setPage(1);
                }}
                className="h-10 px-3 rounded-md border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
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
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardContent className="p-4">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No audit logs found
              </div>
            ) : (
              <div className="space-y-3">
                {logs.map((log: any) => (
                  <div
                    key={log.id}
                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant={log.action as any}>
                            {ACTION_CONFIG[log.action]?.label || log.action}
                          </Badge>
                          <span className="text-sm text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-slate-400 text-xs">User</p>
                            <p className="text-slate-900">{log.user_email || "System"}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-xs">Document</p>
                            <p className="text-slate-900 truncate">{log.document_name || "-"}</p>
                          </div>
                          {log.details && (
                            <div className="col-span-2 md:col-span-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setExpandedId(expandedId === log.id ? null : log.id)
                                }
                              >
                                {expandedId === log.id ? "Hide" : "View"} Details
                              </Button>
                            </div>
                          )}
                        </div>

                        {expandedId === log.id && log.details && (
                          <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50 p-3 rounded text-xs font-mono text-slate-700 overflow-auto max-h-48">
                            <pre>{JSON.stringify(log.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-slate-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};