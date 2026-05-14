import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, Search, Shield, LogOut } from "lucide-react";

export const Navbar = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const { logout } = useAuth();
  const userRole = localStorage.getItem("user-role");
  const isAdmin = userRole === "admin";

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        localStorage.removeItem("user-role");
        window.location.href = "/login";
      }
    });
  };

  return (
    <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-8 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">DocFlow</span>
        </Link>

        <div className="flex items-center gap-4 ml-auto">
          {isLoggedIn ? (
            <>
              <Link 
                to="/documents" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <FileText className="w-4 h-4" />
                Documents
              </Link>
              <Link 
                to="/search" 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Search className="w-4 h-4" />
                Search
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-purple-300 hover:text-purple-200 hover:bg-purple-500/20 transition-all font-medium"
                >
                  <Shield className="w-4 h-4" />
                  Admin
                </Link>
              )}
              <Button 
                variant="ghost" 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className="px-5 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};