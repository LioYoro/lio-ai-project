import { useQuery } from "@tanstack/react-query";
import { useDocuments } from "../hooks/useDocuments";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "@/components/ui/card";
import apiClient from "../lib/api";
import { FileText, Loader, CheckCircle, Sparkles } from "lucide-react";

export const Dashboard = () => {
  const { listDocuments } = useDocuments();

  const { data: stats } = useQuery({
    queryKey: ["document-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/api/documents/stats");
      return response.data;
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-5 shadow-lg shadow-blue-500/30 mx-auto">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-slate-400">Welcome to DocFlow - AI-powered document processing</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Total Documents</p>
                <p className="text-5xl font-bold text-white mt-1">{stats?.total ?? "-"}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-500/30 rounded-xl flex items-center justify-center">
                <Loader className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Processing</p>
                <p className="text-5xl font-bold text-white mt-1">{stats?.processing ?? "-"}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-5xl font-bold text-white mt-1">{stats?.completed ?? "-"}</p>
              </div>
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-white mb-6 flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-400" />
            Recent Activity
          </h2>
          
          {listDocuments.isLoading ? (
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <p className="text-slate-400 text-center py-12">Loading...</p>
            </Card>
          ) : listDocuments.data && listDocuments.data.length > 0 ? (
            <div className="space-y-4">
              {listDocuments.data.slice(0, 5).map((doc) => (
                <Card 
                  key={doc.id} 
                  className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-5">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        doc.status === "completed" ? "bg-emerald-500/30" :
                        doc.status === "processing" ? "bg-amber-500/30" :
                        "bg-slate-500/30"
                      }`}>
                        {doc.status === "completed" ? (
                          <CheckCircle className="w-6 h-6 text-emerald-400" />
                        ) : doc.status === "processing" ? (
                          <Loader className="w-6 h-6 text-amber-400 animate-spin" />
                        ) : (
                          <FileText className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{doc.filename}</h3>
                        <p className="text-sm text-slate-400 mt-1">{new Date(doc.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <span className={`px-5 py-2.5 rounded-full text-sm font-medium ${
                      doc.status === "completed" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      doc.status === "processing" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/5 border-white/10 rounded-2xl">
              <p className="text-slate-400 text-center py-12">No documents yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};