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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col items-center">
        <div className="text-center mb-12 w-full">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight w-full">LioYoro | Hikari Systems</h1>
          <p className="text-slate-400 mt-2 text-lg w-full">DocFlow: AI Document Workflow Automation Platform</p>
        </div>

        <Card className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-500/20">
          <div className="p-10 w-full">
            <h2 className="text-2xl font-bold text-white text-center mb-2 w-full">Create Account</h2>
            <p className="text-slate-400 text-center mb-8 w-full">Join the document automation platform</p>

            <form onSubmit={handleSubmit} className="space-y-8 w-full">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm backdrop-blur-sm w-full">
                  {error}
                </div>
              )}

              <div className="space-y-3 w-full">
                <label className="text-base font-medium text-slate-200 w-full block">Full Name</label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e: any) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14 w-full"
                />
              </div>

              <div className="space-y-3 w-full">
                <label className="text-base font-medium text-slate-200 w-full block">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14 w-full"
                />
              </div>

              <div className="space-y-3 w-full">
                <label className="text-base font-medium text-slate-200 w-full block">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14 w-full"
                />
              </div>

              <div className="space-y-3 w-full">
                <label className="text-base font-medium text-slate-200 w-full block">Confirm Password</label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e: any) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14 w-full"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25"
                loading={register.isPending}
              >
                Create Account
              </Button>
            </form>

            <p className="text-slate-400 text-center mt-8 text-base w-full">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};