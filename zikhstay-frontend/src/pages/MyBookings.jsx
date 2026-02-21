import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { API_BASE } from "../lib/api";
import { FaTimes, FaMapMarkerAlt, FaTicketAlt, FaCreditCard } from "react-icons/fa";
import "./MyBookings.css";

export default function MyBookings() {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null); // Track selected booking for details

  useEffect(() => {
    if (user) {
      fetch(`${API_BASE}/api/hotels/user-bookings/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setBookings(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching bookings:", err);
          setLoading(false);
        });
    }
  }, [user]);

  const closeModal = () => setSelectedBooking(null);

  if (loading) return (
    <div className="loading-container">
      <div className="luxury-loader"></div>
      <p>Fetching your luxury stays...</p>
    </div>
  );

  return (
    <div className="my-bookings-page">
      <div className="bookings-header">
        <h1>My Bookings</h1>
        <p>Manage your upcoming and past stays with ZikhStay</p>
      </div>

      <div className="bookings-list">
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <div key={booking._id} className="booking-ticket glass-card">
              <div className="ticket-main">
                <div className="hotel-brief">
                  <span className="booking-id">ORDER ID: {booking.razorpayOrderId}</span>
                  <h2>{booking.hotelId?.name || "Premium Stay"}</h2>
                  <p className="booking-location">📍 {booking.hotelId?.city || "Luxury Destination"}</p>
                  <p className="booking-date">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                <div className="stay-info">
                  <div className="info-block">
                    <label>Status</label>
                    <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="info-block">
                    <label>Total Paid</label>
                    <span className="price-tag">₹{booking.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="ticket-actions">
                {/* Fixed: Added onClick to set the selected booking */}
                <button 
                  className="btn-outline" 
                  onClick={() => setSelectedBooking(booking)}
                >
                  View Details
                </button>
                <button className="btn-outline">Download Invoice</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🏨</div>
            <h3>No bookings found.</h3>
            <p>Ready for a new adventure? Explore our curated luxury hotels!</p>
            <button className="btn-gold" onClick={() => window.location.href='/explore'}>
              Browse Hotels
            </button>
          </div>
        )}
      </div>

      {/* --- BOOKING DETAILS MODAL --- */}
      {selectedBooking && (
        <div className="booking-modal-overlay" onClick={closeModal}>
          <div className="booking-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}><FaTimes /></button>
            
            <div className="modal-header">
              <img 
                src={selectedBooking.hotelId?.images?.main || "https://via.placeholder.com/400x200?text=Luxury+Stay"} 
                alt="Hotel" 
                className="modal-hotel-img" 
              />
              <div className="modal-title-overlay">
                <h2>{selectedBooking.hotelId?.name}</h2>
                <p><FaMapMarkerAlt /> {selectedBooking.hotelId?.city}</p>
              </div>
            </div>

            <div className="modal-body">
              <div className="detail-row">
                <div className="detail-item">
                  <label><FaTicketAlt /> Booking Reference</label>
                  <p>{selectedBooking.razorpayOrderId}</p>
                </div>
                <div className="detail-item">
                  <label><FaCreditCard /> Payment ID</label>
                  <p>{selectedBooking.razorpayPaymentId || "N/A"}</p>
                </div>
              </div>

              <div className="detail-row divider">
                <div className="detail-item">
                  <label>Booking Date</label>
                  <p>{new Date(selectedBooking.createdAt).toLocaleString('en-IN')}</p>
                </div>
                <div className="detail-item">
                  <label>Amount Paid</label>
                  <p className="modal-price">₹{selectedBooking.totalAmount}</p>
                </div>
              </div>

              <div className="modal-status-box">
                <label>Current Status:</label>
                <span className={`status-badge ${selectedBooking.status?.toLowerCase()}`}>
                  {selectedBooking.status}
                </span>
              </div>
            </div>

            <div className="modal-footer">
               <button className="btn-gold" onClick={() => window.print()}>Print Ticket</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}