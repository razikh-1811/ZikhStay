import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { API_BASE } from '../lib/api';
import "./PartnerListing.css";

const PartnerListings = () => {
  const { user } = useUser();
  const [myHotels, setMyHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE}/api/hotels/owner/${user.id}`)
        .then(res => {
          setMyHotels(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [user]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to remove this property?")) {
      try {
        await axios.delete(`${API_BASE}/api/hotels/${id}`);
        setMyHotels(myHotels.filter(hotel => hotel._id !== id));
      } catch (err) {
        alert("Delete failed.");
      }
    }
  };

  if (loading) return <div className="loader">Loading your properties...</div>;

  return (
    <div className="partner-listings-container">
      <header className="dashboard-header">
        <h1>Your Properties</h1>
        <Link to="/partner/add" className="add-btn">+ Add New Property</Link>
      </header>

      <div className="listings-grid">
        {myHotels.length > 0 ? (
          myHotels.map((hotel) => (
            <div key={hotel._id} className="listing-card glass-card">
              <img src={hotel.images?.main} alt={hotel.name} />
              <div className="listing-info">
                <h3>{hotel.name}</h3>
                <p>Location: {hotel.city}</p>
                <div className="price-tag">Rs {hotel.pricePerNight} / night</div>
              </div>
              <div className="listing-actions">
                <Link to={`/hotel/${hotel._id}`} className="view-link">View Details</Link>
                <button onClick={() => handleDelete(hotel._id)} className="delete-btn">Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p className="no-listings">You haven't listed any properties yet.</p>
        )}
      </div>
    </div>
  );
};

export default PartnerListings;
