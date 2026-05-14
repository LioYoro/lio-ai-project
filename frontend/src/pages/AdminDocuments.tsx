import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { TableRowSkeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { getAdminDocuments, deleteAdminDocument, reprocessAdminDocument, updateAdminDocument, AdminDocument } from "../lib/adminApi";
import { Pencil, RotateCcw, Trash2, ChevronLeft, ChevronRight, FileText, Search, X, Check } from "lucide-react";

const DOCUMENT_TYPES = ["invoice", "receipt", "contract", "report", "form", "other"];

export const AdminDocuments = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, any>>({});
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
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
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-documents"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateAdminDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
      setEditingId(null);
      setEditData({});
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Delete this document?")) deleteMutation.mutate(id);
  };

  const handleReprocess = (id: string) => {
    if (confirm("Reprocess this document?")) reprocessMutation.mutate(id);
  };

  const handleEditStart = (doc: AdminDocument) => {
    setEditingId(doc.id);
    setEditData({ document_type: doc.document_type || "", notes: doc.notes || "", is_verified: doc.is_verified || false });
  };

  const handleEditSave = (id: string) => {
    updateMutation.mutate({ id, data: editData });
  };

  const documents = data?.documents || [];
  const totalPages = data?.total_pages || 1;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>File Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[1,2,3,4,5].map(i => <TableRowSkeleton key={i} columns={6} />)}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Manage Documents</h1>
          <p className="text-slate-500 mt-1">View, edit, and manage all uploaded documents</p>
        </div>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden mb-6">
          <CardContent className="p-4">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                  <TableHead className="font-bold text-slate-700">File Name</TableHead>
                  <TableHead className="font-bold text-slate-700">Status</TableHead>
                  <TableHead className="font-bold text-slate-700">Type</TableHead>
                  <TableHead className="font-bold text-slate-700">Verified</TableHead>
                  <TableHead className="font-bold text-slate-700">Notes</TableHead>
                  <TableHead className="font-bold text-slate-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-slate-400">
                      <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p className="text-lg">No documents found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  documents.map((doc: AdminDocument) => (
                    <TableRow key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{doc.filename}</p>
                            <p className="text-xs text-slate-400">{new Date(doc.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={doc.status as any} className="capitalize">{doc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {editingId === doc.id ? (
                          <select
                            value={editData.document_type || ""}
                            onChange={(e) => setEditData({ ...editData, document_type: e.target.value || null })}
                            className="h-8 px-2 rounded-lg border border-slate-200 text-sm"
                          >
                            <option value="">Select</option>
                            {DOCUMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        ) : (
                          <span className="text-slate-600">{doc.document_type || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === doc.id ? (
                          <button
                            onClick={() => setEditData({ ...editData, is_verified: !editData.is_verified })}
                            className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors ${editData.is_verified ? 'bg-emerald-500' : 'bg-slate-200'}`}
                          >
                            {editData.is_verified && <Check className="h-4 w-4 text-white" />}
                          </button>
                        ) : (
                          <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${doc.is_verified ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                            {doc.is_verified && <Check className="h-4 w-4 text-white" />}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[180px]">
                        {editingId === doc.id ? (
                          <Input
                            value={editData.notes || ""}
                            onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                            placeholder="Add notes..."
                            className="h-8"
                          />
                        ) : (
                          <span className="text-slate-500 truncate block">{doc.notes || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {editingId === doc.id ? (
                            <>
                              <Button size="sm" variant="success" onClick={() => handleEditSave(doc.id)} disabled={updateMutation.isPending}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="outline" onClick={() => handleEditStart(doc)} className="hover:bg-blue-50 hover:border-blue-300">
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="warning" onClick={() => handleReprocess(doc.id)} disabled={reprocessMutation.isPending} className="hover:bg-amber-50 hover:border-amber-300">
                                <RotateCcw className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(doc.id)} disabled={deleteMutation.isPending}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between p-5 border-t bg-slate-50/50">
              <p className="text-sm text-slate-500">Page {page} of {totalPages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};