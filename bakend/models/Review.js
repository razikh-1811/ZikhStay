const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  hotelId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Hotel', 
    required: true 
  },
  userId: { 
    type: String, // Storing the Clerk User ID
    required: true 
  },
  userName: String,
  userImage: String,
  rating: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 5 
  },
  comment: { 
    type: String, 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);