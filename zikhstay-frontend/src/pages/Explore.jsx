import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/api";
import "./Explore.css";
import HotelCard from "../components/HotelCard";

export default function Explore() {
  const location = useLocation();
  const [hotels, setHotels] = useState([]); 
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [priceLimit, setPriceLimit] = useState(15000);
  const [searchCity, setSearchCity] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isAiSearch, setIsAiSearch] = useState(false);

  // --- 1. Initial Data Fetching ---
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const aiQuery = location.state?.aiQuery;

        if (aiQuery) {
          setIsAiSearch(true);
          // AI Search Path
          const res = await axios.post(`${API_BASE}/api/hotels/zikh-ai`, {
            prompt: aiQuery
          });
          
          setHotels(res.data);
          setFilteredHotels(res.data);

          // If AI found a city, sync it to the sidebar input
          if (res.data.length > 0) {
            setSearchCity(res.data[0].city);
          }
        } else {
          setIsAiSearch(false);
          // Normal Path
          const res = await axios.get(`${API_BASE}/api/hotels`);
          setHotels(res.data);
          setFilteredHotels(res.data);
        }
      } catch (err) {
        console.error("Data fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [location.state?.aiQuery]); // Re-fetch if the AI query changes

  // --- 2. Real-time Manual Filtering ---
  useEffect(() => {
    if (loading) return;

    const filtered = hotels.filter(h => {
      const matchPrice = Number(h.pricePerNight) <= Number(priceLimit);
      const matchCity = h.city.toLowerCase().includes(searchCity.toLowerCase());
      return matchPrice && matchCity;
    });
    
    setFilteredHotels(filtered);

    // Suggestions logic
    if (searchCity.length > 1) {
      const uniqueCities = [...new Set(hotels.map(h => h.city))];
      const matches = uniqueCities.filter(c => 
        c.toLowerCase().startsWith(searchCity.toLowerCase())
      );
      setSuggestions(matches);
    } else {
      setSuggestions([]);
    }
  }, [priceLimit, searchCity, hotels, loading]);

  const handleReset = async () => {
    setSearchCity(""); 
    setPriceLimit(15000);
    setIsAiSearch(false);
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/hotels`);
      setHotels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explore-container">
      <aside className="filter-sidebar">
        <div className="sidebar-header">
           <h3>Filters</h3>
           {isAiSearch && <span className="ai-status-tag">AI Active</span>}
        </div>
        
        <div className="filter-group">
          <label>Search City</label>
          <div className="autocomplete-wrapper">
            <input 
              type="text" 
              placeholder="e.g. Hyderabad" 
              className="city-input"
              value={searchCity}
              onChange={(e) => setSearchCity(e.target.value)}
            />
            {suggestions.length > 0 && (
              <ul className="suggestion-list">
                {suggestions.map((city, index) => (
                  <li key={index} onClick={() => {setSearchCity(city); setSuggestions([]);}}>
                    {city}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="filter-group">
          <label>Max Price: <span className="gold-text">₹{priceLimit}</span></label>
          <input 
            type="range" min="1000" max="15000" step="500" 
            value={priceLimit}
            className="price-slider"
            onChange={(e) => setPriceLimit(e.target.value)}
          />
          <div className="range-labels"><span>₹1k</span>-<span>₹15k+</span></div>
        </div>
        
        <button className="reset-btn" onClick={handleReset}>
          Reset All
        </button>
      </aside>

      <main className="results-area">
        <div className="results-header">
          <div className="title-section">
            <h2>
              {isAiSearch && !searchCity
                ? `ZikhAI: ${location.state.aiQuery}` 
                : `Luxury Stays ${searchCity && `in ${searchCity}`}`}
            </h2>
            {isAiSearch && <p className="ai-note">Results tailored by ZikhAI based on your preferences.</p>}
          </div>
          <div className="results-count">{filteredHotels.length} Properties Found</div>
        </div>

        <div className="hotel-grid">
          {loading ? (
            <div className="loading-container">
               <div className="luxury-loader"></div>
               <p>ZikhAI is analyzing the perfect stays for you...</p>
            </div>
          ) : filteredHotels.length > 0 ? (
            filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))
          ) : (
            <div className="empty-results">
              <div className="empty-icon">🏨</div>
              <p>No luxury stays match your criteria.</p>
              <button className="btn-gold" onClick={handleReset}>
                View All Stays
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}