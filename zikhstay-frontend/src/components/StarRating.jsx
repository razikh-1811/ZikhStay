// src/components/StarRating.jsx
import React from "react";
import { FaStar } from "react-icons/fa";

const StarRating = ({ rating, setRating }) => {
  return (
    <div className="star-row">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <FaStar
            key={index}
            size={30}
            className="star-icon"
            // If the star value is less than or equal to current rating, color it Gold
            color={starValue <= rating ? "#D4AF37" : "#444"}
            onClick={() => setRating(starValue)}
            style={{ cursor: "pointer", transition: "0.2s" }}
          />
        );
      })}
    </div>
  );
};

export default StarRating;