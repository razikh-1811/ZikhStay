// src/components/ReviewModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import StarRating from './StarRating'; // The code you provided

export default function ReviewModal({ booking, onClose }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a star rating!");
    
    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/api/hotels/add-review`, {
        hotelId: booking.hotelId._id,
        userId: booking.userId,
        rating,
        comment,
        userName: booking.userName // Assumes you have this in the booking data
      });
      alert("Review submitted successfully!");
      onClose();
    } catch (err) {
      alert(err.response?.data?.error || "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="review-modal glass-card">
        <h3>Rate your stay at {booking.hotelId.name}</h3>
        
        {/* Your StarRating component used here */}
        <StarRating rating={rating} setRating={setRating} />
        
        <textarea 
          placeholder="Tell us about your experience..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        
        <div className="modal-actions">
          <button onClick={onClose} className="btn-outline">Cancel</button>
          <button onClick={handleSubmit} className="btn-gold" disabled={submitting}>
            {submitting ? "Posting..." : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
}