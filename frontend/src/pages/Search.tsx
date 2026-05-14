import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, FileText, Sparkles } from "lucide-react";

interface SearchResult {
  document_id: string;
  filename: string;
  relevance_score: number;
  raw_text?: string;
  file_type: string;
}

export const Search = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const token = localStorage.getItem("sb-access-token");
      
      const response = await fetch("http://localhost:8001/api/search/semantic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: query.trim(),
          limit: 10,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Search failed");
      }

      const data: SearchResult[] = await response.json();
      setResults(data);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during search");
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  const formatScore = (score: number) => {
    return (Math.max(0, score) * 100).toFixed(1);
  };

  const truncateText = (text: string | undefined, maxLength: number = 200) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar isLoggedIn={true} />

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/30 mx-auto">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Semantic Search</h1>
          <p className="text-slate-400">Find documents using natural language queries</p>
        </div>

        <Card className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <div className="p-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Ask about your documents... (e.g., 'show all certificates from 2024')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-12"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-6"
              >
                <SearchIcon className="w-4 h-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-sm text-slate-400 mt-4 flex items-center gap-2">
              <span>💡</span>
              <span>Try: "certificates", "invoices over 5000", "resume with python skills"</span>
            </p>
          </div>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <div className="p-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl p-4 mb-6 backdrop-blur-sm">
                <p className="font-medium">Error: {error}</p>
              </div>
            )}
            
            {!hasSearched && !query && (
              <div className="text-center py-12">
                <SearchIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">Enter a search query above</p>
                <p className="text-slate-500 mt-3 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Using MiniLM embeddings + pgvector
                </p>
              </div>
            )}

            {hasSearched && query && results.length === 0 && !error && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 text-lg">No results found for "{query}"</p>
                <p className="text-slate-500 mt-2">Try a different search query</p>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div className="mb-6">
                  <p className="text-slate-300 font-medium flex items-center gap-2">
                    <SearchIcon className="w-5 h-5 text-blue-400" />
                    Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                  </p>
                </div>
                
                <div className="space-y-4">
                  {results.map((result) => (
                    <div
                      key={result.document_id}
                      className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                              {result.filename}
                            </h3>
                            <span className="text-xs bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full">
                              {result.file_type}
                            </span>
                          </div>
                          
                          {result.raw_text && (
                            <p className="text-sm text-slate-400 mb-3 ml-13">
                              {truncateText(result.raw_text)}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-4 text-right">
                          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {formatScore(result.relevance_score)}%
                          </div>
                          <p className="text-xs text-slate-500">Relevance</p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                            style={{
                              width: `${Math.max(0, Math.min(100, result.relevance_score * 100))}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};