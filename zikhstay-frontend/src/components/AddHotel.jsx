import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { API_BASE } from '../lib/api';
import "./AddHotel.css";

// Standard luxury amenities list
const AMENITY_OPTIONS = [
  "WiFi", "AC", "Swimming Pool", "Parking", 
  "Gym", "Kitchen", "TV", "Sea View","near Beach","Spa","Pet Friendly","24/7 Room Service","Airport Shuttle","Laundry Service","Bar/Lounge","Restaurant","Non-smoking Rooms","Family Rooms","Wheelchair Accessible","Daily Housekeeping","Mini Bar","Balcony","City View","Garden","Hot Tub","Business Center","Conference Facilities","Valet Parking","Car Rental","Bicycle Rental","Concierge Service","Luggage Storage","Currency Exchange","Safety Deposit Box","Wake-up Service","Ironing Service","Dry Cleaning","Newspaper","VIP Room Facilities","Private Check-in/Check-out","Soundproof Rooms","Hypoallergenic Room","In-room Dining","Shuttle Service","24-hour Front Desk","Express Check-in/Check-out","Multilingual Staff","Ticket Service","Tour Desk","Gift Shop","ATM on Site","Vending Machine (Drinks)","Vending Machine (Snacks)","Facilities for Disabled Guests"
];

const AddHotel = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]); // New state for amenities
  const [formData, setFormData] = useState({
    name: '', city: '', price: '', main: null,
    bedroom: [], washroom: [], hall: []
  });

  const toggleAmenity = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) 
        ? prev.filter(a => a !== amenity) 
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in to list a property.");

    setLoading(true);
    const data = new FormData();

    data.append('name', formData.name);
    data.append('city', formData.city);
    data.append('price', formData.price);
    data.append('ownerId', user.id);
    
    // IMPORTANT: Send amenities as a stringified array
    data.append('amenities', JSON.stringify(selectedAmenities));

    data.append('main', formData.main);
    formData.bedroom.forEach(file => data.append('bedroom', file));
    formData.washroom.forEach(file => data.append('washroom', file));
    formData.hall.forEach(file => data.append('hall', file));

    try {
      await axios.post(`${API_BASE}/api/hotels/add`, data);
      alert("Submission Received! Your property will be live once an Admin approves it.");
      navigate('/dashboard'); 
    } catch (err) {
      console.error("Upload Error:", err);
      alert("Upload failed. Please check file sizes or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-hotel-container">
      <form onSubmit={handleSubmit} className="partner-form glass-card">
        <header className="form-header">
          <h2>List Your Property</h2>
          <p>Join the ZikhStay collection of luxury stays</p>
        </header>

        <div className="input-group">
          <label>Property Name</label>
          <input
            type="text"
            placeholder="e.g. The Grand Srikakulam Resort"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={loading}
          />
        </div>

        <div className="grid-inputs">
          <div className="input-group">
            <label>City</label>
            <input
              type="text"
              placeholder="Srikakulam"
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              disabled={loading}
            />
          </div>
          <div className="input-group">
            <label>Price per Night (₹)</label>
            <input
              type="number"
              placeholder="4500"
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* --- NEW AMENITIES SECTION --- */}
        <div className="amenities-selection">
          <label className="section-label">Amenities</label>
          <div className="amenities-grid">
            {AMENITY_OPTIONS.map(item => (
              <div 
                key={item} 
                className={`amenity-chip ${selectedAmenities.includes(item) ? 'active' : ''}`}
                onClick={() => !loading && toggleAmenity(item)}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <hr className="divider" />

        <div className="upload-section">
          <div className="file-input-wrapper">
            <label>Main Cover Image {formData.main && "✅ Selected"}</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, main: e.target.files[0] })}
              required
              disabled={loading}
            />
          </div>

          <div className="file-grid">
            <div className="file-input-wrapper">
              <label>Bedrooms ({formData.bedroom.length})</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, bedroom: Array.from(e.target.files) })}
                disabled={loading}
              />
            </div>

            <div className="file-input-wrapper">
              <label>Washrooms ({formData.washroom.length})</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, washroom: Array.from(e.target.files) })}
                disabled={loading}
              />
            </div>

            <div className="file-input-wrapper">
              <label>Hall/Lobby ({formData.hall.length})</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setFormData({ ...formData, hall: Array.from(e.target.files) })}
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (
            <div className="btn-loader-container">
              <div className="small-loader"></div>
              <span>Uploading to ZikhCloud...</span>
            </div>
          ) : "Publish for Review"}
        </button>
      </form>
    </div>
  );
};

export default AddHotel;