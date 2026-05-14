import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import {
  getAdminDocuments,
  deleteAdminDocument,
  reprocessAdminDocument,
  updateAdminDocument,
  AdminDocument,
} from "../lib/adminApi";

const DOCUMENT_TYPES = [
  "invoice",
  "receipt",
  "contract",
  "report",
  "form",
  "other",
];

const STATUS_COLORS: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  processing: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  pending: "bg-gray-100 text-gray-700",
};

export const AdminDocuments = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-documents", page, statusFilter],
    queryFn: () => getAdminDocuments(page, 10, statusFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAdminDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
    },
  });

  const reprocessMutation = useMutation({
    mutationFn: reprocessAdminDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateAdminDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      setEditingId(null);
      setEditData({});
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleReprocess = (id: string) => {
    if (confirm("Are you sure you want to reprocess this document?")) {
      reprocessMutation.mutate(id);
    }
  };

  const handleEditStart = (doc: AdminDocument) => {
    setEditingId(doc.id);
    setEditData({
      document_type: doc.document_type || "",
      notes: doc.notes || "",
      is_verified: doc.is_verified || false,
    });
  };

  const handleEditSave = (id: string) => {
    updateMutation.mutate({ id, data: editData });
  };

  const documents = data?.documents || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-red-600">Error loading documents</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Manage Documents</h1>
        <p className="text-gray-600 mb-8">View, edit, and manage all documents</p>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Documents Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">File Name</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 font-semibold">Type</th>
                  <th className="text-left py-3 px-4 font-semibold">Verified</th>
                  <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  <th className="text-left py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-600">
                      No documents found
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: AdminDocument) => (
                    <tr key={doc.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {doc.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            STATUS_COLORS[doc.status] || "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {editingId === doc.id ? (
                          <select
                            value={editData.document_type || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                document_type: e.target.value || null,
                              })
                            }
                            className="px-2 py-1 border border-gray-300 rounded text-xs"
                          >
                            <option value="">Select Type</option>
                            {DOCUMENT_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-600">
                            {doc.document_type || "-"}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {editingId === doc.id ? (
                          <input
                            type="checkbox"
                            checked={editData.is_verified || false}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                is_verified: e.target.checked,
                              })
                            }
                            className="w-4 h-4 cursor-pointer"
                          />
                        ) : (
                          <input
                            type="checkbox"
                            checked={doc.is_verified}
                            disabled
                            className="w-4 h-4"
                          />
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        {editingId === doc.id ? (
                          <input
                            type="text"
                            value={editData.notes || ""}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                notes: e.target.value,
                              })
                            }
                            placeholder="Add notes..."
                            className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                          />
                        ) : (
                          <p className="text-gray-600 truncate">
                            {doc.notes || "-"}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          {editingId === doc.id ? (
                            <>
                              <button
                                onClick={() => handleEditSave(doc.id)}
                                disabled={updateMutation.isPending}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleEditStart(doc)}
                                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleReprocess(doc.id)}
                                disabled={reprocessMutation.isPending}
                                className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600 disabled:opacity-50"
                              >
                                Reprocess
                              </button>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                disabled={deleteMutation.isPending}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
