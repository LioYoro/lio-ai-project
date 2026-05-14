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

const StatCard = ({ title, value, icon: Icon, color, delay }: any) => (
  <div 
    className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 w-full"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} 
      style={{ background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)` }} 
    />
    <div className="relative flex items-center justify-between w-full">
      <div>
        <p className="text-sm font-medium text-slate-400">{title}</p>
        <p className="mt-4 text-5xl font-bold text-white">{value}</p>
      </div>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-8 w-8" style={{ color }} />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Navbar isLoggedIn={true} />
        <div className="flex flex-col items-center w-full px-8 py-16">
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
              {[1,2,3,4].map(i => <StatsCardSkeleton key={i} />)}
            </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="flex flex-col items-center w-full px-8 py-16">
        <div className="text-center mb-16 w-full max-w-6xl">
          <div className="flex items-center justify-center gap-4 mb-4 w-full">
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
            <span className="text-sm font-medium text-slate-400">Admin Panel</span>
            <div className="h-1 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 w-full">Dashboard</h1>
          <p className="text-slate-400 text-lg w-full">Overview of your document processing system</p>
        </div>

        <div className="w-full max-w-6xl">
          <div className="mb-12 w-full">
            <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-4 w-full">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              <a href="/admin/documents" className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-white/20 bg-white/10 hover:border-blue-400/50 hover:bg-white/20 transition-all w-full">
                <div className="h-16 w-16 rounded-2xl bg-blue-500/30 flex items-center justify-center group-hover:bg-blue-500/50 transition-colors">
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xl">Manage Documents</p>
                  <p className="text-base text-slate-400 mt-2">View and manage all</p>
                </div>
              </a>

              <a href="/admin/audit-logs" className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-white/20 bg-white/10 hover:border-emerald-400/50 hover:bg-white/20 transition-all w-full">
                <div className="h-16 w-16 rounded-2xl bg-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/50 transition-colors">
                  <AlertCircle className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xl">Audit Logs</p>
                  <p className="text-base text-slate-400 mt-2">Track system activity</p>
                </div>
              </a>

              <a href="/admin/users" className="group flex items-center gap-6 p-8 rounded-2xl border-2 border-white/20 bg-white/10 hover:border-purple-400/50 hover:bg-white/20 transition-all w-full">
                <div className="h-16 w-16 rounded-2xl bg-purple-500/30 flex items-center justify-center group-hover:bg-purple-500/50 transition-colors">
                  <Users className="h-8 w-8 text-purple-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-xl">Manage Users</p>
                  <p className="text-base text-slate-400 mt-2">View all users and roles</p>
                </div>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 w-full">
            <StatCard title="Total Documents" value={totalDocs} icon={FileText} color="#3b82f6" delay={0} />
            <StatCard title="Completed" value={completedDocs} icon={CheckCircle} color="#10b981" delay={100} />
            <StatCard title="Failed" value={failedDocs} icon={XCircle} color="#ef4444" delay={200} />
            <StatCard title="Pending" value={pendingDocs} icon={Clock} color="#f59e0b" delay={300} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-10 text-white shadow-lg shadow-purple-500/20 w-full">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-purple-200 text-base">Total Users</p>
                  <p className="text-5xl font-bold mt-4">{stats?.users_count || 0}</p>
                </div>
                <Users className="h-14 w-14 text-purple-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-10 text-white shadow-lg shadow-indigo-500/20 w-full">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-indigo-200 text-base">Today's Uploads</p>
                  <p className="text-5xl font-bold mt-4">{stats?.documents_today || 0}</p>
                </div>
                <Zap className="h-14 w-14 text-indigo-200" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-10 text-white shadow-lg shadow-amber-500/20 w-full">
              <div className="flex items-center justify-between w-full">
                <div>
                  <p className="text-amber-100 text-base">Avg Processing Time</p>
                  <p className="text-5xl font-bold mt-4">
                    {stats?.avg_processing_time_seconds 
                      ? `${Math.round(stats.avg_processing_time_seconds)}s` 
                      : "N/A"}
                  </p>
                </div>
                <Clock className="h-14 w-14 text-amber-200" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12 w-full">
            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden w-full">
              <CardHeader className="pb-8 w-full">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white w-full">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  Document Status Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData} barSize={50}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" className="text-xs fill-slate-400" />
                    <YAxis className="text-xs fill-slate-400" />
                    <Tooltip 
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', backgroundColor: '#1e293b' }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden w-full">
              <CardHeader className="pb-8 w-full">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white w-full">
                  <PieChartIcon className="h-6 w-6 text-emerald-400" />
                  Status Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 w-full">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={110}
                      innerRadius={55}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', backgroundColor: '#1e293b' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden w-full">
              <CardHeader className="pb-8 w-full">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white w-full">
                  <TrendingUp className="h-6 w-6 text-purple-400" />
                  User Registrations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 w-full">
                {usersByMonthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={usersByMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" className="text-xs fill-slate-400" />
                      <YAxis className="text-xs fill-slate-400" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', backgroundColor: '#1e293b' }} />
                      <Line type="monotone" dataKey="users" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-slate-500 w-full">
                    <div className="text-center">
                      <Users className="h-14 w-14 mx-auto mb-4 opacity-50" />
                      <p>No user data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border border-white/20 bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden w-full">
              <CardHeader className="pb-8 w-full">
                <CardTitle className="flex items-center gap-3 text-xl font-semibold text-white w-full">
                  <Activity className="h-6 w-6 text-cyan-400" />
                  Documents Uploaded
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 w-full">
                {docsByMonthData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={docsByMonthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="month" className="text-xs fill-slate-400" />
                      <YAxis className="text-xs fill-slate-400" />
                      <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', backgroundColor: '#1e293b' }} />
                      <Line type="monotone" dataKey="documents" stroke="#06b6d4" strokeWidth={3} dot={{ fill: "#06b6d4", r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-60 flex items-center justify-center text-slate-500 w-full">
                    <div className="text-center">
                      <Upload className="h-14 w-14 mx-auto mb-4 opacity-50" />
                      <p>No document data available</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};