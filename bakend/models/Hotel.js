const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  ownerId: String,
  name: String,
  city: { type: String, index: true },
  pricePerNight: Number,
  images: {
    main: String,
    bedroom: [String],
    washroom: [String],
    hall: [String]
  },
  amenities: [String],
  isApproved: { type: Boolean, default: true } // Auto-approve for your development
});

module.exports = mongoose.model('Hotel', HotelSchema);