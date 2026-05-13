import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search as SearchIcon, FileText } from "lucide-react";

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
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Semantic Search</h1>

        {/* Search Input */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Ask about your documents... (e.g., 'show all certificates from 2024')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="flex items-center gap-2"
            >
              <SearchIcon className="w-4 h-4" />
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            💡 Try: "certificates", "invoices over 5000", "resume with python skills"
          </p>
        </Card>

        {/* Results */}
        <Card>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
              <p className="text-red-800">Error: {error}</p>
            </div>
          )}
          
          {!hasSearched && !query && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">Enter a search query above</p>
              <p className="text-gray-500 mt-2">
                Using MiniLM embeddings + pgvector
              </p>
            </div>
          )}

          {hasSearched && query && results.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No results found for "{query}"</p>
              <p className="text-gray-500 mt-2">Try a different search query</p>
            </div>
          )}

          {results.length > 0 && (
            <div>
              <div className="mb-6">
                <p className="text-gray-700 font-medium">
                  Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                </p>
              </div>
              
              <div className="space-y-4">
                {results.map((result) => (
                  <div
                    key={result.document_id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <h3 className="font-semibold text-gray-900">
                            {result.filename}
                          </h3>
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {result.file_type}
                          </span>
                        </div>
                        
                        {result.raw_text && (
                          <p className="text-sm text-gray-600 mb-3">
                            {truncateText(result.raw_text)}
                          </p>
                        )}
                      </div>
                      
                      <div className="ml-4 text-right">
                        <div className="text-2xl font-bold text-blue-600">
                          {formatScore(result.relevance_score)}%
                        </div>
                        <p className="text-xs text-gray-500">Relevance</p>
                      </div>
                    </div>

                    {/* Relevance bar */}
                    <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{
                          width: `${Math.max(0, Math.min(100, result.relevance_score * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
