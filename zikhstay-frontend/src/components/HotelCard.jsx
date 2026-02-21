import { useNavigate } from "react-router-dom";
import "./HotelCard.css";

export default function HotelCard({ hotel }) {
  const navigate = useNavigate();

  const handleBookClick = () => {
    navigate(`/hotel/${hotel._id}`);
  };

  return (
    <div className="hotel-card">
      <div className="card-image">
        <img src={hotel.images?.main || hotel.image} alt={hotel.name} />
        {hotel.rating && <span className="rating-badge">Rating {hotel.rating}</span>}
      </div>

      <div className="hotel-info">
        <h3>{hotel.name}</h3>
        <p className="location">Location: {hotel.city || hotel.location}</p>

        <div className="amenities">
          {hotel.amenities?.slice(0, 3).map(a => (
            <span key={a} className="amenity-tag">{a}</span>
          ))}
        </div>

        <div className="card-footer">
          <span className="price">
            Rs {hotel.pricePerNight || hotel.price}
            <span>/night</span>
          </span>
          <button className="book-btn" onClick={handleBookClick}>
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
}
