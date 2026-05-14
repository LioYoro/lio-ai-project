import { useQuery } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { getAdminStats } from "../lib/adminApi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  failed: "#ef4444",
  pending: "#f59e0b",
  processing: "#3b82f6",
};

const FILE_TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6"];

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div>
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <p className="text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  // Status chart data
  const statusData = stats?.documents_by_status ? [
    { name: "Completed", value: stats.documents_by_status.completed || 0, fill: STATUS_COLORS.completed },
    { name: "Failed", value: stats.documents_by_status.failed || 0, fill: STATUS_COLORS.failed },
    { name: "Pending", value: stats.documents_by_status.pending || 0, fill: STATUS_COLORS.pending },
    { name: "Processing", value: stats.documents_by_status.processing || 0, fill: STATUS_COLORS.processing },
  ] : [];

  // Users by month data
  const usersByMonthData = stats?.users_by_month ? Object.entries(stats.users_by_month).map(([month, count]) => ({
    month,
    users: count,
  })) : [];

  // Documents by month data
  const docsByMonthData = stats?.documents_by_month ? Object.entries(stats.documents_by_month).map(([month, count]) => ({
    month,
    documents: count,
  })) : [];

  // File type data
  const fileTypeData = stats?.file_type_breakdown ? Object.entries(stats.file_type_breakdown).map(([type, count], index) => ({
    name: type.toUpperCase(),
    value: count,
    fill: FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length],
  })) : [];

  // Document type from extracted_data
  const extractedTypeData = stats?.extracted_document_types ? Object.entries(stats.extracted_document_types).map(([type, count]) => ({
    name: type,
    value: count,
  })) : [];

  // Document type from column
  const docTypeData = stats?.document_type_breakdown ? Object.entries(stats.document_type_breakdown).map(([type, count]) => ({
    name: type || "Unknown",
    value: count,
  })) : [];

  const totalDocs = stats?.total_documents || 0;
  const completedDocs = stats?.documents_by_status?.completed || 0;
  const failedDocs = stats?.documents_by_status?.failed || 0;
  const pendingDocs = (stats?.documents_by_status?.pending || 0) + (stats?.documents_by_status?.processing || 0);

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-8">System-wide document processing overview</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Documents</h3>
            <p className="text-3xl font-bold text-blue-600">{totalDocs}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{completedDocs}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Failed</h3>
            <p className="text-3xl font-bold text-red-600">{failedDocs}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending/Processing</h3>
            <p className="text-3xl font-bold text-amber-600">{pendingDocs}</p>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-bold mb-4">Document Status Overview</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-4">Status Distribution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-bold mb-4">Users Registration (Last 6 Months)</h2>
            {usersByMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={usersByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No user data available</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-4">Documents Uploaded (Last 6 Months)</h2>
            {docsByMonthData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={docsByMonthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="documents" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No document data available</p>
            )}
          </Card>
        </div>

        {/* File Types & Document Types */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-bold mb-4">File Types (by extension)</h2>
            {fileTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={fileTypeData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={60} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No file type data available</p>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-bold mb-4">Document Types (from extracted data)</h2>
            {extractedTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={extractedTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {extractedTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : docTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={docTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {docTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-center py-8">No document type data available</p>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">{stats?.users_count || 0}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Documents Today</h3>
            <p className="text-3xl font-bold text-indigo-600">{stats?.documents_today || 0}</p>
          </Card>
          <Card>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Avg Processing Time</h3>
            <p className="text-3xl font-bold text-cyan-600">
              {stats?.avg_processing_time_seconds 
                ? `${Math.round(stats.avg_processing_time_seconds)}s` 
                : "N/A"}
            </p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="/admin/documents" className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition">
              <h3 className="font-semibold text-blue-900">Manage Documents</h3>
              <p className="text-sm text-blue-700">View and manage all documents</p>
            </a>
            <a href="/admin/audit-logs" className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition">
              <h3 className="font-semibold text-green-900">Audit Logs</h3>
              <p className="text-sm text-green-700">Track system activity and changes</p>
            </a>
            <a href="/admin/users" className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition">
              <h3 className="font-semibold text-purple-900">Manage Users</h3>
              <p className="text-sm text-purple-700">View all users and their roles</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};