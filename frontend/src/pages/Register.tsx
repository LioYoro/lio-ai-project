import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export const Register = () => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await register.mutateAsync({ email, password, full_name: fullName });
      navigate("/documents");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LioYoro</h1>
          <p className="text-slate-400 mt-1">Hikari Systems</p>
        </div>

        <Card className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-500/20">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Create Account</h2>
            <p className="text-slate-400 text-center mb-6">Join the document automation platform</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Full Name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e: any) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25 mt-2"
                loading={register.isPending}
              >
                Create Account
              </Button>
            </form>

            <p className="text-slate-400 text-center mt-6 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          AI Document Workflow Automation Platform
        </p>
      </div>
    </div>
  );
};