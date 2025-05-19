import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [cats, setCats] = useState([]); // Store fetched cats
  const [loading, setLoading] = useState(false); // Loading state for fetching images
  const [breed, setBreed] = useState(''); // Selected breed state
  const [breeds, setBreeds] = useState([]); // List of available breeds
  const [isBreedLoading, setIsBreedLoading] = useState(false); // Loading state for breed fetch
  const [fetchError, setFetchError] = useState(null); // Error state for API requests

  const apiKey = import.meta.env.VITE_CAT_API_KEY; // Retrieve the API key from environment variables

  // Fetch available cat breeds
  const fetchBreeds = async () => {
    setIsBreedLoading(true); // Set loading state for breeds
    try {
      const res = await fetch('https://api.thecatapi.com/v1/breeds', {
        headers: { 'x-api-key': apiKey },
      });
      const data = await res.json();
      setBreeds(data); // Set available breeds
    } catch (error) {
      console.error('Error fetching breeds:', error);
      setFetchError('Failed to load breeds');
    } finally {
      setIsBreedLoading(false); // Reset breed loading state
    }
  };

  // Fetch cats based on the breed filter or show 10 random cats initially
  const fetchCats = async (isLoadMore = false, breedParam = '') => {
    setLoading(true);
    try {
      const breedQuery = breedParam ? `&breed_ids=${breedParam}` : ''; // Apply breed filter if any
      const res = await fetch(
        `https://api.thecatapi.com/v1/images/search?limit=10${breedQuery}`,
        {
          headers: { 'x-api-key': apiKey },
        }
      );
      const data = await res.json();

      // If it's a "Load More" action, append the new data to the existing cats
      if (isLoadMore) {
        setCats((prev) => [...prev, ...data]);
      } else {
        // If it's a new breed filter or initial load, reset the state with the new data
        setCats(data);
      }
    } catch (error) {
      console.error('Error fetching cats', error);
      setFetchError('Failed to load cat images');
    } finally {
      setLoading(false);
    }
  };

  // Trigger the fetchCats function when breed changes or on initial load
  useEffect(() => {
    fetchBreeds(); // Fetch available breeds when component mounts
    fetchCats(); // Fetch 10 random cats by default
  }, []);

  // Trigger fetchCats whenever breed changes
  useEffect(() => {
    fetchCats(false, breed); // Fetch cats based on the selected breed or random if no breed
  }, [breed]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>🐱 Random Cat Gallery</h1>

      {/* Error Handling */}
      {fetchError && (
        <div style={{ color: 'red', marginBottom: '10px' }}>
          <strong>{fetchError}</strong>
        </div>
      )}

      {/* Breed Filter with Loading Indicator */}
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="breed-select" style={{ marginRight: '10px' }}>
          Select Breed:
        </label>
        <select
          id="breed-select"
          value={breed}
          onChange={(e) => setBreed(e.target.value)} // Update breed on selection change
          style={{
            padding: '5px',
            fontSize: '16px',
            borderRadius: '5px',
            border: '1px solid #ccc',
          }}
        >
          <option value="">All Breeds</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
        {/* Display a loading spinner or text while breed data is being fetched */}
        {isBreedLoading && <span> Loading breeds...</span>}
      </div>

      {/* Cat Images Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '10px',
        }}
      >
        {cats.length > 0 ? (
          cats.map((cat, index) => (
            <img
              key={index}
              src={cat.url}
              alt="cat"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              }}
            />
          ))
        ) : (
          <p>No cats available at the moment.</p>
        )}
      </div>

      {/* Load More Button */}
      <button
        onClick={() => fetchCats(true, breed)} // Set "isLoadMore" flag to true and pass breed filter
        disabled={loading}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
          borderRadius: '5px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
        }}
      >
        {loading ? 'Loading...' : 'Load More'}
      </button>
    </div>
  );
}

export default App;
