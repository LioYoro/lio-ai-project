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

      <div className="max-w-4xl mx-auto px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-lg shadow-blue-500/30 mx-auto">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Semantic Search</h1>
          <p className="text-slate-400 text-lg">Find documents using natural language queries</p>
        </div>

        <Card className="mb-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <div className="p-8">
            <div className="flex gap-5">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Ask about your documents... (e.g., 'show all certificates from 2024')"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-xl h-14 text-base"
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={!query.trim() || isSearching}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 h-14 text-base"
              >
                <SearchIcon className="w-5 h-5" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            <p className="text-base text-slate-400 mt-5 flex items-center gap-2">
              <span>💡</span>
              <span>Try: "certificates", "invoices over 5000", "resume with python skills"</span>
            </p>
          </div>
        </Card>

        <Card className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl">
          <div className="p-8">
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-200 rounded-xl p-5 mb-6 backdrop-blur-sm">
                <p className="font-medium text-base">Error: {error}</p>
              </div>
            )}
            
            {!hasSearched && !query && (
              <div className="text-center py-16">
                <SearchIcon className="w-20 h-20 text-slate-600 mx-auto mb-5" />
                <p className="text-slate-300 text-xl">Enter a search query above</p>
                <p className="text-slate-500 mt-4 flex items-center justify-center gap-2 text-base">
                  <Sparkles className="w-4 h-4" />
                  Using MiniLM embeddings + pgvector
                </p>
              </div>
            )}

            {hasSearched && query && results.length === 0 && !error && (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-slate-600 mx-auto mb-5" />
                <p className="text-slate-300 text-xl">No results found for "{query}"</p>
                <p className="text-slate-500 mt-3 text-base">Try a different search query</p>
              </div>
            )}

            {results.length > 0 && (
              <div>
                <div className="mb-8">
                  <p className="text-slate-300 text-xl font-medium flex items-center gap-3">
                    <SearchIcon className="w-6 h-6 text-blue-400" />
                    Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                  </p>
                </div>
                
                <div className="space-y-5">
                  {results.map((result) => (
                    <div
                      key={result.document_id}
                      className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-xl flex items-center justify-center">
                              <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-white text-xl">
                              {result.filename}
                            </h3>
                            <span className="text-sm bg-slate-700/50 text-slate-300 px-4 py-1.5 rounded-full">
                              {result.file_type}
                            </span>
                          </div>
                          
                          {result.raw_text && (
                            <p className="text-base text-slate-400 mb-4 ml-16">
                              {truncateText(result.raw_text)}
                            </p>
                          )}
                        </div>
                        
                        <div className="ml-6 text-right">
                          <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                            {formatScore(result.relevance_score)}%
                          </div>
                          <p className="text-sm text-slate-500 mt-1">Relevance</p>
                        </div>
                      </div>

                      <div className="mt-5 ml-16">
                        <div className="h-2.5 bg-slate-700/50 rounded-full overflow-hidden">
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