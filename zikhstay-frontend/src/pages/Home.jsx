import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../lib/api";
import AIHero from "../components/AIHero";
import HotelCard from "../components/HotelCard";
import "./Home.css";

export default function Home() {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- 1. Fetch Featured Hotels from MongoDB ---
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        setLoading(true);
        // Fetching all hotels and displaying the top 4
        const res = await axios.get(`${API_BASE}/api/hotels`);
        setFeaturedHotels(res.data.slice(0, 4)); 
      } catch (err) {
        console.error("Error loading featured hotels:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  // --- 2. Logic to handle ZikhAI Search ---
  const handleAISearch = (query) => {
    if (!query) return;
    // Redirect with state so Explore.jsx knows to trigger ZikhAI logic
    navigate("/explore", { state: { aiQuery: query } });
  };

  // --- 3. Handle City Pill Click ---
  const handleCityClick = (city) => {
    // We treat city clicks like a focused AI query for better results
    navigate("/explore", { state: { aiQuery: `Hotels in ${city}` } });
  };

  return (
    <div className="home-page">
      {/* Hero Section with AI Search Bar */}
      <AIHero onSearch={handleAISearch} />
      
      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title">Popular Stays</h2>
          <button className="btn-text" onClick={() => navigate("/explore")}>
            View All Stays →
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="luxury-loader"></div>
            <p>Gathering luxury stays...</p>
          </div>
        ) : (
          <div className="hotel-grid">
            {featuredHotels.map(hotel => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Trending Destinations Section */}
      <section className="trending-cities">
         <h3 className="section-subtitle">Trending Destinations</h3>
         <div className="city-pills">
            {['Srikakulam', 'Visakhapatnam', 'Goa', 'Hyderabad'].map(city => (
              <button key={city} onClick={() => handleCityClick(city)}>
                {city}
              </button>
            ))}
         </div>
      </section>
    </div>
  );
}