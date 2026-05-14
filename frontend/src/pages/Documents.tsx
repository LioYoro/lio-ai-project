import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, RefreshCw, Eye, EyeOff } from "lucide-react";

const formatFieldValue = (value: any): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "string") return value.trim() || "—";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map(v => typeof v === "string" ? v : JSON.stringify(v)).join(", ");
  }
  if (typeof value === "object") {
    try {
      const entries = Object.entries(value).filter(([k, v]) => v !== null && v !== undefined);
      if (entries.length === 0) return "—";
      const formatted = entries.map(([k, v]) => {
        if (v === null || v === undefined) return null;
        if (typeof v === "string") return v;
        if (typeof v === "number") return String(v);
        if (Array.isArray(v)) return v.join(", ");
        if (typeof v === "object") return JSON.stringify(v);
        return String(v);
      }).filter(v => v !== null);
      if (formatted.length === 0) return "—";
      return formatted.join(" | ");
    } catch (e) {
      return "—";
    }
  }
  return String(value) || "—";
};

export const Documents = () => {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { listDocuments, uploadDocument } = useDocuments(page, limit);
  const [file, setFile] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    try {
      await uploadDocument.mutateAsync(file);
      setFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleViewDocument = (docId: string) => {
    setSelectedDoc(selectedDoc === docId ? null : docId);
  };

  const statusColors: Record<string, string> = {
    pending: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    processing: "bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse",
    completed: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    failed: "bg-red-500/20 text-red-300 border border-red-500/30",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">Your Documents</h1>
          <p className="text-slate-400">Manage and view all your uploaded documents</p>
        </div>

        <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Upload New Document
            </h2>
            
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center bg-white/5">
              <Upload className="w-10 h-10 mx-auto mb-4 text-slate-400" />
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <p className="text-slate-300">
                  {file ? file.name : "Click to select a file or drag and drop"}
                </p>
                <p className="text-sm text-slate-500 mt-2">PDF, JPG, or PNG (max 10MB)</p>
              </label>
              <Button
                variant="default"
                className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl px-6"
                onClick={handleUpload}
                disabled={!file}
                loading={uploadDocument.isPending}
              >
                Upload & Process
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-400" />
              All Documents
            </h2>
            <Button 
              variant="secondary" 
              onClick={() => listDocuments.refetch()}
              className="flex items-center gap-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {listDocuments.isLoading ? (
            <Card className="bg-white/5 border-white/10">
              <p className="text-slate-400 text-center py-8">Loading documents...</p>
            </Card>
          ) : listDocuments.data && listDocuments.data.length > 0 ? (
            <div className="space-y-4">
              {listDocuments.data.map((doc) => (
                <Card 
                  key={doc.id} 
                  className="cursor-pointer hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex-1" onClick={() => handleViewDocument(doc.id)}>
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white">{doc.filename}</h3>
                            <p className="text-sm text-slate-400">
                              {new Date(doc.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-4 py-2 rounded-xl text-sm font-medium ${statusColors[doc.status] || "bg-gray-500/20 text-gray-300"}`}>
                          {doc.status}
                        </span>
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="min-w-[100px] gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0"
                          onClick={() => handleViewDocument(doc.id)}
                        >
                          {selectedDoc === doc.id ? (
                            <>
                              <EyeOff className="w-4 h-4" />
                              Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              View
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {selectedDoc === doc.id && (
                    <div className="px-5 pb-5 pt-0 mt-2">
                      <div className="bg-white/5 rounded-xl p-5 border-t border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-slate-400">Status</p>
                            <p className="text-white">{doc.status}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-400">File Type</p>
                            <p className="text-white">{doc.file_type}</p>
                          </div>
                          {doc.confidence_score !== undefined && doc.confidence_score !== null && (
                            <div>
                              <p className="text-sm font-medium text-slate-400">OCR Confidence</p>
                              <p className="text-white">
                                {doc.confidence_score > 0 
                                  ? `${Math.round(doc.confidence_score * 100)}%` 
                                  : "Low / Handwritten"}
                              </p>
                            </div>
                          )}
                          {doc.raw_text && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-slate-400 mb-2">Extracted Text</p>
                              <div className="bg-slate-800/50 p-4 rounded-lg max-h-48 overflow-y-auto">
                                <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                                  {doc.raw_text.substring(0, 10000)}
                                  {doc.raw_text.length > 10000 && "..."}
                                </pre>
                              </div>
                            </div>
                          )}
                          {doc.extracted_data && (
                            <div className="md:col-span-2">
                              <p className="text-sm font-medium text-slate-400 mb-2">Extracted Fields</p>
                              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 rounded-lg border border-blue-500/20">
                                <div className="flex justify-between items-center mb-4">
                                  <p className="text-sm font-semibold text-white">
                                    Document Type: {doc.extracted_data.document_type || "Unknown"}
                                  </p>
                                  <span className="text-xs px-3 py-1 bg-blue-500/30 text-blue-300 rounded-full">
                                    {doc.extracted_data.overall_confidence 
                                      ? `${Math.round(doc.extracted_data.overall_confidence * 100)}%` 
                                      : "N/A"}
                                  </span>
                                </div>

                                {doc.extracted_data.extracted_fields && Object.keys(doc.extracted_data.extracted_fields).length > 0 ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {Object.entries(doc.extracted_data.extracted_fields).map(([key, field]: any) => (
                                      <div key={key} className="bg-slate-800/50 p-3 rounded-lg border border-white/10">
                                        <p className="text-xs font-medium text-slate-400 uppercase">{key}</p>
                                        <p className="text-sm text-white mt-1 break-words">
                                          {formatFieldValue(field?.value)}
                                        </p>
                                        {field?.confidence !== undefined && (
                                          <p className="text-xs text-slate-500 mt-1">
                                            Confidence: {Math.round(field.confidence * 100)}%
                                          </p>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-400">No fields extracted</p>
                                )}

                                {(doc.extracted_data.rate_limited || 
                                  doc.extracted_data.extraction_notes?.includes("rate limit") ||
                                  doc.extracted_data.extraction_notes?.includes("quota")) && (
                                  <div className="mt-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
                                    <p className="text-sm text-amber-300">
                                      <span className="font-semibold">⚠️ API Rate Limit:</span> Extraction temporarily unavailable. Please try again later.
                                    </p>
                                  </div>
                                )}

                                {doc.extracted_data.extraction_notes && !doc.extracted_data.rate_limited && (
                                  <div className="mt-4 pt-3 border-t border-blue-500/20">
                                    <p className="text-xs text-slate-400">
                                      <span className="font-semibold">Notes:</span> {doc.extracted_data.extraction_notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}

              {listDocuments.data && listDocuments.data.length > 0 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <span className="text-slate-400">
                    Page {page}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20"
                    onClick={() => setPage(p => p + 1)}
                    disabled={listDocuments.data.length < limit}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <p className="text-center text-slate-400 py-12">No documents uploaded yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};