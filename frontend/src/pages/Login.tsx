import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Sparkles } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  useEffect(() => {
    if (localStorage.getItem("sb-access-token")) {
      window.location.href = "/documents";
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login.mutateAsync({ email, password });
      window.location.href = "/documents";
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || "Login failed");
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
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/30">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">LioYoro | Hikari Systems</h1>
          <p className="text-slate-400 mt-2 text-lg">DocFlow: AI Document Workflow Automation Platform</p>
        </div>

        <Card className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl shadow-slate-500/20">
          <CardHeader className="pb-8 px-12 pt-12">
            <CardTitle className="text-2xl font-bold text-white text-center">Welcome Back</CardTitle>
            <CardDescription className="text-slate-300 text-center text-base">
              Sign in to access your documents
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-12 pb-8">
            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-8 bg-red-500/20 border border-red-500/30 text-red-200 p-4 rounded-xl text-sm backdrop-blur-sm">
                  {error}
                </div>
              )}
              <div className="flex flex-col gap-10">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-slate-200 text-base">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e: any) => setEmail(e.target.value)}
                    required
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="password" className="text-slate-200 text-base">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e: any) => setPassword(e.target.value)}
                    required 
                    className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14"
                  />
                </div>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex-col gap-6 px-12 pb-12">
            <Button 
              type="submit" 
              className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/25" 
              onClick={handleSubmit} 
              loading={login.isPending}
            >
              Sign In
            </Button>
            <p className="text-slate-400 text-base">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};