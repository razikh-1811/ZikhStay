import React, { useState } from 'react';
import { API_BASE } from '../lib/api';
import "./PartnerDashboard.css";

export default function PartnerDashboard() {
  const [hotelData, setHotelData] = useState({
    name: "",
    city: "",
    price: "",
    description: "",
  });

  const [files, setFiles] = useState({
    main: null,
    bedroom: [],
    washroom: [],
    hall: []
  });

  const handleFileChange = (category, e) => {
    if (category === 'main') {
      setFiles({ ...files, main: e.target.files[0] });
    } else {
      setFiles({ ...files, [category]: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append text data
    Object.keys(hotelData).forEach(key => formData.append(key, hotelData[key]));
    
    // Append images
    formData.append('main', files.main);
    files.bedroom.forEach(file => formData.append('bedroom', file));
    files.washroom.forEach(file => formData.append('washroom', file));
    files.hall.forEach(file => formData.append('hall', file));

    try {
      const response = await fetch(`${API_BASE}/api/hotels/add`, {
        method: 'POST',
        body: formData,
      });
      if (response.ok) alert("Hotel submitted for approval!");
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  return (
    <div className="dashboard-container">
      <h2 className="section-title">List Your Property</h2>
      <form className="glass-card partner-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input type="text" placeholder="Hotel Name" onChange={e => setHotelData({...hotelData, name: e.target.value})} required />
          <input type="text" placeholder="City" onChange={e => setHotelData({...hotelData, city: e.target.value})} required />
          <input type="number" placeholder="Price per Night" onChange={e => setHotelData({...hotelData, price: e.target.value})} required />
        </div>

        <div className="upload-section">
          <div className="upload-group">
            <label>Main Thumbnail</label>
            <input type="file" onChange={e => handleFileChange('main', e)} />
          </div>
          <div className="upload-group">
            <label>Bedroom Images (Max 5)</label>
            <input type="file" multiple onChange={e => handleFileChange('bedroom', e)} />
          </div>
          <div className="upload-group">
            <label>Washroom Images (Max 3)</label>
            <input type="file" multiple onChange={e => handleFileChange('washroom', e)} />
          </div>
          <div className="upload-group">
            <label>Hall/Lobby Images (Max 3)</label>
            <input type="file" multiple onChange={e => handleFileChange('hall', e)} />
          </div>
        </div>

        <button type="submit" className="btn-primary">Upload to ZikhStay</button>
      </form>
    </div>
  );
}
