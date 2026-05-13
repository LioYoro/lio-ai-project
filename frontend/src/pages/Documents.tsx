import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Upload, FileText, RefreshCw } from "lucide-react";

export const Documents = () => {
  const { listDocuments, uploadDocument } = useDocuments();
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
    pending: "bg-gray-100 text-gray-700",
    processing: "bg-yellow-100 text-yellow-700 animate-pulse",
    completed: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Documents</h1>
          <Button 
            variant="secondary" 
            onClick={() => listDocuments.refetch()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Upload New Document</h2>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <p className="text-gray-600">
                {file ? file.name : "Click to select a file or drag and drop"}
              </p>
              <p className="text-sm text-gray-500 mt-2">PDF, JPG, or PNG (max 10MB)</p>
            </label>
            <Button
              variant="primary"
              className="mt-6"
              onClick={handleUpload}
              disabled={!file}
              loading={uploadDocument.isPending}
            >
              Upload & Process
            </Button>
          </div>
        </Card>

        {/* Documents List */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Your Documents</h2>
          {listDocuments.isLoading ? (
            <p className="text-gray-600">Loading documents...</p>
          ) : listDocuments.data && listDocuments.data.length > 0 ? (
            <div className="space-y-4">
              {listDocuments.data.map((doc) => (
                <Card key={doc.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => handleViewDocument(doc.id)}>
                      <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-gray-400" />
                        <div>
                          <h3 className="text-lg font-semibold">{doc.filename}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(doc.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[doc.status] || "bg-gray-100"}`}>
                        {doc.status}
                      </span>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => handleViewDocument(doc.id)}
                      >
                        {selectedDoc === doc.id ? "Hide" : "View"}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expanded view */}
                  {selectedDoc === doc.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Status</p>
                          <p className="text-gray-600">{doc.status}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">File Type</p>
                          <p className="text-gray-600">{doc.file_type}</p>
                        </div>
                        {doc.confidence_score !== undefined && doc.confidence_score !== null && (
                          <div>
                            <p className="text-sm font-medium text-gray-700">OCR Confidence</p>
                            <p className="text-gray-600">
                              {doc.confidence_score > 0 
                                ? `${Math.round(doc.confidence_score * 100)}%` 
                                : "Low / Handwritten"}
                            </p>
                          </div>
                        )}
                        {doc.raw_text && (
                          <div className="md:col-span-2">
                            <p className="text-sm font-medium text-gray-700 mb-2">Extracted Text</p>
                            <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                              <pre className="text-sm text-gray-600 whitespace-pre-wrap font-mono">
                                {doc.raw_text.substring(0, 10000)}
                                {doc.raw_text.length > 10000 && "..."}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <p className="text-center text-gray-600 py-8">No documents uploaded yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};