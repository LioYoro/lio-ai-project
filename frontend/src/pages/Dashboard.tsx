import { useDocuments } from "../hooks/useDocuments";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";

export const Dashboard = () => {
  const { listDocuments } = useDocuments();

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome to DocFlow - AI-powered document processing</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Documents</h3>
            <p className="text-4xl font-bold text-blue-600">-</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Processing</h3>
            <p className="text-4xl font-bold text-yellow-600">-</p>
          </Card>
          <Card>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Completed</h3>
            <p className="text-4xl font-bold text-green-600">-</p>
          </Card>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          {listDocuments.isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : listDocuments.data && listDocuments.data.length > 0 ? (
            <div className="space-y-4">
              {listDocuments.data.map((doc) => (
                <Card key={doc.id}>
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{doc.filename}</h3>
                      <p className="text-sm text-gray-600">{doc.created_at}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${
                      doc.status === "completed" ? "bg-green-100 text-green-700" :
                      doc.status === "processing" ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-600">No documents yet</p>
          )}
        </div>
      </div>
    </div>
  );
};
