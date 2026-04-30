import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import NoticeCard from '../components/NoticeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Footer from '../components/Footer';
import '../styles/search.css';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (searchTerm) {
      performSearch();
    }
  }, [searchTerm]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/notices', {
        params: {
          searchTerm: searchTerm
        }
      });
      setResults(response.data);
    } catch (err) {
      setError('❌ Error performing search');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="search-page">
        <div className="search-hero">
          <div className="container">
            <h1>🔍 Search Results</h1>
            <p>Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchTerm}"</p>
          </div>
        </div>

        <div className="container search-content">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : results.length === 0 ? (
            <div className="no-results">
              <div className="icon">🔎</div>
              <h3>No results found</h3>
              <p>Try searching with different keywords</p>
            </div>
          ) : (
            <div className="results-grid">
              {results.map(notice => (
                <NoticeCard key={notice._id} notice={notice} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}