import React, { useState, useCallback } from 'react';
import { Search, Briefcase, MapPin, Loader, ServerCrash } from 'lucide-react';

// --- Reusable Components ---

const JobCard = ({ job }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 flex flex-col">
    <div className="flex items-start mb-4">
      <img
        src={job.employer_logo || `https://placehold.co/64x64/EBF4FF/3B82F6?text=${job.employer_name?.charAt(0) || 'J'}`}
        alt={`${job.employer_name} logo`}
        className="w-16 h-16 rounded-md object-contain mr-4 border border-gray-100"
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          const target = e.target as HTMLImageElement;
          target.onerror = null;
          target.src = `https://placehold.co/64x64/EBF4FF/3B82F6?text=${job.employer_name?.charAt(0) || 'J'}`;
        }}
      />
      <div>
        <h3 className="text-xl font-bold text-gray-800">{job.job_title}</h3>
        <p className="text-md text-gray-600 font-semibold">{job.employer_name}</p>
      </div>
    </div>
    <div className="flex-grow space-y-3 text-gray-500 mb-4">
      <div className="flex items-center">
        <Briefcase size={16} className="mr-2" />
        <span>{job.job_employment_type || 'Not Specified'}</span>
      </div>
      <div className="flex items-center">
        <MapPin size={16} className="mr-2" />
        <span>{job.job_city || 'Remote'}, {job.job_state}, {job.job_country}</span>
      </div>
    </div>
    <a
      href={job.job_apply_link}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto text-center bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-300 w-full"
    >
      Apply Now
    </a>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-10">
    <Loader className="animate-spin text-blue-600" size={48} />
    <p className="mt-4 text-gray-600">Searching for opportunities...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-10 bg-red-50 text-red-700 rounded-lg">
    <ServerCrash size={48} className="mb-4" />
    <h3 className="text-xl font-bold">Something Went Wrong</h3>
    <p>{message}</p>
  </div>
);

const App = () => {
  const [searchTerm, setSearchTerm] = useState('Software Engineer in Mysuru');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      // The frontend calls our secure backend, not the external API
      const response = await fetch(`http://localhost:3002/search?query=${encodeURIComponent(searchTerm)}`);

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage;
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          errorMessage = errorData.error || `HTTP error! Status: ${response.status}`;
        } else {
          errorMessage = `Server returned a non-JSON response for a failed request. Status: ${response.status}. This often means the API endpoint is incorrect (404 Not Found).`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setJobs(data);

    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setJobs([]); // Clear previous results on error
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-2">Find Your Next Role</h1>
          <p className="text-lg text-gray-500">Discover thousands of job opportunities.</p>
        </header>

        <div className="sticky top-0 bg-gray-50/80 backdrop-blur-sm z-10 py-4 mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex items-center border border-gray-300 rounded-full shadow-sm p-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
            <Search className="text-gray-400 mx-3" size={24} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Job title, keywords, or company..."
              className="w-full h-full p-2 text-lg bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-bold py-3 px-6 rounded-full hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-300"
            >
              {loading ? <Loader className="animate-spin" size={20} /> : 'Find Jobs'}
            </button>
          </form>
        </div>

        <main>
          {loading && <LoadingSpinner />}
          {error && <ErrorDisplay message={error} />}
          {!loading && !error && searched && (
            jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {jobs.map((job, index) => (
                  <JobCard key={job.job_id || `job-${index}`} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center p-10">
                <h3 className="text-2xl font-bold text-gray-700">No Results Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search terms for better results.</p>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

