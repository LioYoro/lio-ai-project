import { useState } from "react";
import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Search as SearchIcon } from "lucide-react";

type EmbeddingModel = "minilm" | "gemini";

const modelOptions = [
  { value: "minilm", label: "MiniLM (Local - Unlimited)", description: "HuggingFace sentence-transformers" },
  { value: "gemini", label: "Gemini Embedding-001", description: "Google API (100 RPM, 1000 RPD)" },
];

export const Search = () => {
  const [query, setQuery] = useState("");
  const [model, setModel] = useState<EmbeddingModel>("minilm");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setIsSearching(true);
    // Phase 4: Implement semantic search
    setTimeout(() => setIsSearching(false), 1000);
  };

  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Semantic Search</h1>

        {/* Model Selector */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Embedding Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as EmbeddingModel)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {modelOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {modelOptions.find((m) => m.value === model)?.description}
              </p>
            </div>
          </div>
        </Card>

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

        {/* Results Placeholder */}
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {query ? `Results for "${query}"` : "Enter a search query above"}
            </p>
            <p className="text-gray-500 mt-2">
              Phase 4: Semantic search using {model === "minilm" ? "MiniLM embeddings" : "Gemini Embedding-001"} + pgvector
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
