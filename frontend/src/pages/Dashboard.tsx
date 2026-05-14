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

      <div className="flex flex-col items-center w-full px-8 py-16">
        <div className="text-center mb-16 w-full max-w-5xl">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/30 mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 w-full">Dashboard</h1>
          <p className="text-slate-400 text-lg w-full">Welcome to DocFlow - AI-powered document processing</p>
        </div>

        <div className="w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full">
              <div className="flex items-center gap-5 w-full">
                <div className="w-14 h-14 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-base">Total Documents</p>
                  <p className="text-5xl font-bold text-white">{stats?.total ?? "-"}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full">
              <div className="flex items-center gap-5 w-full">
                <div className="w-14 h-14 bg-amber-500/30 rounded-xl flex items-center justify-center">
                  <Loader className="w-7 h-7 text-amber-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-base">Processing</p>
                  <p className="text-5xl font-bold text-white">{stats?.processing ?? "-"}</p>
                </div>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 w-full">
              <div className="flex items-center gap-5 w-full">
                <div className="w-14 h-14 bg-emerald-500/30 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-base">Completed</p>
                  <p className="text-5xl font-bold text-white">{stats?.completed ?? "-"}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="w-full">
            <h2 className="text-3xl font-semibold text-white mb-8 flex items-center gap-3 w-full">
              <FileText className="w-7 h-7 text-blue-400" />
              Recent Activity
            </h2>
            
            {listDocuments.isLoading ? (
              <Card className="bg-white/5 border-white/10 rounded-2xl w-full">
                <p className="text-slate-400 text-center py-12">Loading...</p>
              </Card>
            ) : listDocuments.data && listDocuments.data.length > 0 ? (
              <div className="space-y-4 w-full">
                {listDocuments.data.slice(0, 5).map((doc) => (
                  <Card 
                    key={doc.id} 
                    className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-5 hover:bg-white/15 transition-colors w-full"
                  >
                    <div className="flex justify-between items-center w-full">
                      <div className="flex items-center gap-5 w-full">
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
                          <p className="text-base text-slate-400 mt-1">{new Date(doc.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <span className={`px-5 py-2.5 rounded-full text-base font-medium ${
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
              <Card className="bg-white/5 border-white/10 rounded-2xl w-full">
                <p className="text-slate-400 text-center py-12">No documents yet</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};