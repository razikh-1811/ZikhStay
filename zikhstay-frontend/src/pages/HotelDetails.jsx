import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate
import { useUser } from '@clerk/clerk-react';
import { API_BASE } from '../lib/api';
import "./HotelDetails.css";

export default function HotelDetails() {
  const { id } = useParams();
  const { user } = useUser();
  const navigate = useNavigate(); // For redirecting after payment
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false); // Added loading state

  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE}/api/hotels/${id}`)
      .then(res => {
        setHotel(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load hotel:", err);
        setLoading(false);
      });
  }, [id]);

  const loadScript = (src) => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async () => {
    if (!user) return alert("Please login to book a stay.");
    if (!hotel) return;

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      alert("Razorpay key is missing. Set VITE_RAZORPAY_KEY_ID in your env.");
      return;
    }

    try {
      setBookingLoading(true); // Disable button
      const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?");
        setBookingLoading(false);
        return;
      }

      // Updated create-order call with better error handling
      const { data: order } = await axios.post(`${API_BASE}/api/hotels/create-order`, {
        amount: Number(hotel.pricePerNight), // Ensure number type
        hotelId: hotel._id,
        userId: user.id
      });

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: order.currency,
        name: "ZikhStay",
        description: `Booking for ${hotel.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${API_BASE}/api/hotels/verify-payment`, response);
            if (verifyRes.data.status === "success") {
              alert("Booking confirmed! Check your email for details.");
              navigate('/my-bookings'); // Redirect user to their history
            }
          } catch (error) {
            console.error("Verification failed:", error);
            alert("Payment recorded, but verification failed. Contact support.");
          }
        },
        prefill: {
          name: user.fullName,
          email: user.primaryEmailAddress.emailAddress,
        },
        theme: { color: "#D4AF37" }, // Gold theme for ZikhStay
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      // Log full error for debugging
      console.error("Detailed Booking Error:", error.response?.data || error.message);
      alert(error.response?.data?.error || "System is busy. Please try again in 1 minute.");
    } finally {
      setBookingLoading(false); // Re-enable button
    }
  };

  if (loading) return <div className="loader">Loading luxury stay details...</div>;
  if (!hotel) return <div className="loader">Hotel not found.</div>;

  return (
    <div className="hotel-details">
      <div className="hotel-header">
        <h1>{hotel.name} - {hotel.city}</h1>
        <div className="location-tag">Location: {hotel.city}</div>
      </div>

      <div className="booking-section">
        <div className="gallery-section">
          {['bedroom', 'washroom', 'hall'].map((cat) => (
            <div key={cat}>
              <h3 className="category-title">{cat.toUpperCase()} Gallery</h3>
              <div className="image-grid">
                {hotel.images?.[cat]?.length ? (
                  hotel.images[cat].map((url, i) => (
                    <img key={i} src={url} alt={cat} />
                  ))
                ) : (
                  <div className="booking-details">No images available for this section.</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="booking-card">
          <h2>₹{hotel.pricePerNight} <span>/ night</span></h2>
          <div className="booking-details">
            <p>✓ Secure payment via Razorpay</p>
            <p>✓ Instant confirmation</p>
            <p>✓ Verified ZikhStay Listing</p>
          </div>
          <button
            onClick={handleBooking}
            className={`submit-btn ${bookingLoading ? 'disabled' : ''}`}
            disabled={bookingLoading}
          >
            {bookingLoading ? "Processing..." : "Reserve Now"}
          </button>
        </div>
      </div>
    </div>
  );
}