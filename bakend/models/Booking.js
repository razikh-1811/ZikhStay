const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel', // Links to your Hotel model
    required: true
  },
  userId: {
    type: String, // Clerk User ID
    required: true
  },
  guestName: String,
  checkIn: Date,
  checkOut: Date,
  totalAmount: Number,
  razorpayOrderId: String,
  razorpayPaymentId: String,
  // Status: 'pending', 'confirmed', 'failed'
  status: {
    type: String,
    default: 'pending'
  },
  bookedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Booking', BookingSchema);