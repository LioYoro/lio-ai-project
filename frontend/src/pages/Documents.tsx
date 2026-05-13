import { useState } from "react";
import { useDocuments } from "../hooks/useDocuments";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Upload } from "lucide-react";

export const Documents = () => {
  const { listDocuments, uploadDocument } = useDocuments();
  const [file, setFile] = useState<File | null>(null);

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

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Documents</h1>

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
              Upload
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
                <Card key={doc.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{doc.filename}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(doc.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded text-sm font-medium ${
                        doc.status === "completed" ? "bg-green-100 text-green-700" :
                        doc.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                        doc.status === "failed" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {doc.status}
                      </span>
                      <Button variant="secondary" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
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
