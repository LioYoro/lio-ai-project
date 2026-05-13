import { Navbar } from "../components/layout/Navbar";
import { Card } from "../components/ui/Card";

export const Search = () => {
  return (
    <div>
      <Navbar isLoggedIn={true} />

      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Search Documents</h1>

        <Card>
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Search functionality coming in Phase 4</p>
            <p className="text-gray-500 mt-2">Semantic search + RAG Q&A</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
