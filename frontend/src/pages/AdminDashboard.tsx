import { useQuery } from "@tanstack/react-query";
import { Navbar } from "../components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCardSkeleton } from "@/components/ui/skeleton";
import { getAdminStats } from "../lib/adminApi";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line 
} from "recharts";
import { 
  Users, FileText, Clock, TrendingUp, 
  CheckCircle, XCircle, AlertCircle, Upload,
  BarChart3, PieChart as PieChartIcon, Activity, Zap
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  completed: "#10b981",
  failed: "#ef4444",
  pending: "#f59e0b",
  processing: "#3b82f6",
};

const FILE_TYPE_COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#6366f1", "#14b8a6"];

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <div 
    className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
      style={{ background: `linear-gradient(135deg, ${color}10 0%, transparent 100%)` }} 
    />
    <div className="relative flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="mt-2 text-4xl font-bold" style={{ color }}>{value}</p>
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}15` }}>
        <Icon className="h-7 w-7" style={{ color }} />
      </div>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar isLoggedIn={true} />
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <StatsCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const statusData = stats?.documents_by_status ? [
    { name: "Completed", value: stats.documents_by_status.completed || 0, fill: STATUS_COLORS.completed },
    { name: "Failed", value: stats.documents_by_status.failed || 0, fill: STATUS_COLORS.failed },
    { name: "Pending", value: stats.documents_by_status.pending || 0, fill: STATUS_COLORS.pending },
    { name: "Processing", value: stats.documents_by_status.processing || 0, fill: STATUS_COLORS.processing },
  ] : [];

  const usersByMonthData = stats?.users_by_month ? Object.entries(stats.users_by_month).map(([month, count]) => ({
    month,
    users: count,
  })) : [];

  const docsByMonthData = stats?.documents_by_month ? Object.entries(stats.documents_by_month).map(([month, count]) => ({
    month,
    documents: count,
  })) : [];

  const totalDocs = stats?.total_documents || 0;
  const completedDocs = stats?.documents_by_status?.completed || 0;
  const failedDocs = stats?.documents_by_status?.failed || 0;
  const pendingDocs = (stats?.documents_by_status?.pending || 0) + (stats?.documents_by_status?.processing || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-2 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-sm font-medium text-slate-500">Admin Panel</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-slate-500 mt-2">Overview of your document processing system</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Total Documents" value={totalDocs} icon={FileText} color="#3b82f6" delay={0} />
          <StatCard title="Completed" value={completedDocs} icon={CheckCircle} color="#10b981" delay={100} />
          <StatCard title="Failed" value={failedDocs} icon={XCircle} color="#ef4444" delay={200} />
          <StatCard title="Pending" value={pendingDocs} icon={Clock} color="#f59e0b" delay={300} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Document Status Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <PieChartIcon className="h-5 w-5 text-emerald-600" />
                Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={110}
                    innerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    paddingAngle={4}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <TrendingUp className="h-5 w-5 text-purple-600" />
                User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {usersByMonthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={usersByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No user data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
                <Activity className="h-5 w-5 text-cyan-600" />
                Documents Uploaded
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {docsByMonthData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={docsByMonthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip />
                    <Line type="monotone" dataKey="documents" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-400">
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No document data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Users</p>
                <p className="text-4xl font-bold mt-2">{stats?.users_count || 0}</p>
              </div>
              <Users className="h-10 w-10 text-purple-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">Today's Uploads</p>
                <p className="text-4xl font-bold mt-2">{stats?.documents_today || 0}</p>
              </div>
              <Zap className="h-10 w-10 text-indigo-200" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-lg shadow-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Avg Processing Time</p>
                <p className="text-4xl font-bold mt-2">
                  {stats?.avg_processing_time_seconds 
                    ? `${Math.round(stats.avg_processing_time_seconds)}s` 
                    : "N/A"}
                </p>
              </div>
              <Clock className="h-10 w-10 text-amber-200" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg shadow-slate-200/50 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/admin/documents" className="group flex items-center gap-4 p-5 rounded-xl border-2 border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Manage Documents</p>
                  <p className="text-sm text-slate-500">View and manage all</p>
                </div>
              </a>

              <a href="/admin/audit-logs" className="group flex items-center gap-4 p-5 rounded-xl border-2 border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                  <AlertCircle className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Audit Logs</p>
                  <p className="text-sm text-slate-500">Track system activity</p>
                </div>
              </a>

              <a href="/admin/users" className="group flex items-center gap-4 p-5 rounded-xl border-2 border-slate-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Manage Users</p>
                  <p className="text-sm text-slate-500">View all users and roles</p>
                </div>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};