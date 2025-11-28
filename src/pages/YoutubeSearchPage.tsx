import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react'; // Assuming lucide-react is used for icons

// This component assumes a modern React environment with Tailwind CSS configured.
// It will not run correctly as a standalone file without a build tool like Vite.

const YoutubeSearchPage = () => {
  const [query, setQuery] = useState('');
  const [aiQuery, setAiQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to handle the form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResults([]);
    setError(null);

    try {
      const response = await fetch('http://localhost:8011/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setAiQuery(data.ai_query);
      setResults(data.results);
    } catch (err: any) {
      console.error('Failed to fetch:', err);
      setError('Failed to fetch results. Please ensure the Python backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-2xl shadow-xl p-8 transform transition-all duration-500 scale-95 hover:scale-100">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
            AI-Powered YouTube Search
          </h1>
          <p className="text-gray-400 text-lg">
            Find the perfect video tutorial or content.
          </p>
        </header>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="text"
            className="flex-grow p-4 bg-gray-700 text-gray-200 rounded-xl focus:outline-none focus:ring-2 focus-purple-500 transition-all duration-200"
            placeholder="e.g., 'Python CS101' or 'how to make a website'"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105 active:scale-95"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {aiQuery && (
          <div className="mb-8 p-4 bg-gray-700 rounded-xl text-gray-300 shadow-inner transition-all duration-300">
            <p className="font-semibold text-purple-400">AI-Generated Query:</p>
            <p className="text-sm italic">{aiQuery}</p>
          </div>
        )}

        {error && (
          <div className="mb-8 p-4 bg-red-800 rounded-xl text-red-200 shadow-inner">
            <p>{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {results.length > 0 ? (
            results.map((video: any, index: number) => (
              <a
                key={index}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block bg-gray-700 rounded-xl p-4 shadow-md flex flex-col sm:flex-row items-center gap-4 hover:bg-gray-600 transition-all duration-200 transform hover:scale-105"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="rounded-lg w-full sm:w-40 sm:h-24 object-cover border-2 border-gray-600"
                  onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src="https://placehold.co/160x96/4b5563/a1a1aa?text=Video+Thumbnail" }}
                />
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-white mb-1 leading-tight">
                            {video.title}
                          </h3>
                          <p className="text-gray-400 text-sm">{video.description}</p>
                        </div>
                      </a>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 italic p-8">
                      {loading ? 'Fetching results...' : 'Search results will appear here.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        };

export default YoutubeSearchPage;